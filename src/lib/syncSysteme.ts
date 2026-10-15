import type { SupabaseClient } from "@supabase/supabase-js";
import { TOTAL_DAYS } from "@/lib/challenge";
import {
  addTag,
  createContact,
  createTag,
  findContactByEmail,
  listTags,
  removeTag,
} from "@/lib/systeme";

// Etiquetas que maneja la app en Systeme.io (solo estas 7; el resto de tu cuenta no se toca).
//
// Avance (siempre una sola): reto_sin_empezar | reto_en_progreso | reto_casi_listo | reto_completado
// Inactividad (a lo sumo una): sin_conexion_7d | sin_conexion_15d | sin_conexion_30d
// Cada vez que se AGREGA una etiqueta puedes disparar una automatización en Systeme.io.
export const PROGRESS_TAGS = [
  "reto_sin_empezar",
  "reto_en_progreso",
  "reto_casi_listo",
  "reto_completado",
] as const;
export const INACTIVITY_TAGS = ["sin_conexion_7d", "sin_conexion_15d", "sin_conexion_30d"] as const;
export const MANAGED_TAGS: string[] = [...PROGRESS_TAGS, ...INACTIVITY_TAGS];

export function progressTag(completedDays: number): string {
  if (completedDays >= TOTAL_DAYS) return "reto_completado";
  if (completedDays >= TOTAL_DAYS - 2) return "reto_casi_listo"; // 5 o 6 de 7
  if (completedDays >= 1) return "reto_en_progreso";
  return "reto_sin_empezar";
}

export function daysSince(dateIso: string | null, today: string): number {
  if (!dateIso) return 0;
  const ms = new Date(today).getTime() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

// Quien ya terminó el reto no recibe etiquetas de inactividad.
export function inactivityTag(completedDays: number, daysAway: number): string | null {
  if (completedDays >= TOTAL_DAYS) return null;
  if (daysAway >= 30) return "sin_conexion_30d";
  if (daysAway >= 15) return "sin_conexion_15d";
  if (daysAway >= 7) return "sin_conexion_7d";
  return null;
}

export type SyncResult = {
  ok: boolean;
  total: number; // usuarios revisados
  unchanged: number; // sin cambios desde la última vez (no se llamó a la API)
  updated: number; // personas a las que se les cambiaron etiquetas
  contactsCreated: number; // contactos que no existían en Systeme.io y se crearon
  tagsCreated: string[]; // etiquetas nuevas creadas en Systeme.io
  pending: number; // quedaron para la próxima corrida (límite por corrida)
  errors: string[];
};

type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  completed_days: number | null;
  last_seen_date: string | null;
  systeme_tags: string | null;
};

const MAX_UPDATES_PER_RUN = 120;

// Revisa a todos los usuarios y deja en Systeme.io las etiquetas que les corresponden.
// Solo llama a la API para quien cambió de estado desde la última corrida.
export async function syncSysteme(supabase: SupabaseClient): Promise<SyncResult> {
  const result: SyncResult = {
    ok: true,
    total: 0,
    unchanged: 0,
    updated: 0,
    contactsCreated: 0,
    tagsCreated: [],
    pending: 0,
    errors: [],
  };
  const today = new Date().toISOString().slice(0, 10);

  // 1) Usuarios (en páginas de 1000).
  const users: UserRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data: overview, error } = await supabase
      .from("admin_users_overview")
      .select("id, email, display_name, completed_days, last_seen_date")
      .range(from, from + 999);
    if (error) throw new Error(`No se pudo leer a los usuarios: ${error.message}`);
    const ids = (overview ?? []).map((r) => r.id as string);
    const { data: states } = ids.length
      ? await supabase.from("profiles").select("id, systeme_tags").in("id", ids)
      : { data: [] };
    const stateById = new Map((states ?? []).map((s) => [s.id as string, s.systeme_tags as string | null]));
    for (const r of overview ?? []) {
      users.push({
        id: r.id as string,
        email: r.email as string | null,
        display_name: r.display_name as string | null,
        completed_days: Number(r.completed_days ?? 0),
        last_seen_date: r.last_seen_date as string | null,
        systeme_tags: stateById.get(r.id as string) ?? null,
      });
    }
    if ((overview ?? []).length < 1000) break;
  }
  result.total = users.length;

  // 2) ¿Quién cambió de estado?
  const todo = users
    .filter((u) => u.email)
    .map((u) => {
      const completed = Number(u.completed_days ?? 0);
      const progress = progressTag(completed);
      const inactivity = inactivityTag(completed, daysSince(u.last_seen_date, today));
      const wanted = [progress, ...(inactivity ? [inactivity] : [])];
      return { user: u, wanted, key: wanted.join("|") };
    })
    .filter((t) => t.key !== (t.user.systeme_tags ?? ""));
  result.unchanged = result.total - todo.length;
  if (todo.length === 0) return result;

  // 3) Las 7 etiquetas deben existir en Systeme.io (si faltan se crean).
  const tagIds = await listTags();
  for (const name of MANAGED_TAGS) {
    if (!tagIds.has(name)) {
      tagIds.set(name, await createTag(name));
      result.tagsCreated.push(name);
    }
  }

  // 4) Aplicar los cambios (con un límite por corrida; el resto queda para la siguiente).
  const batch = todo.slice(0, MAX_UPDATES_PER_RUN);
  result.pending = todo.length - batch.length;

  for (const { user, wanted, key } of batch) {
    try {
      const email = user.email!.trim().toLowerCase();
      let contact = await findContactByEmail(email);
      if (!contact) {
        contact = await createContact(email, (user.display_name ?? "").split(" ")[0] ?? "");
        result.contactsCreated++;
      }
      const previous = (user.systeme_tags ?? "").split("|").filter(Boolean);

      for (const name of previous) {
        if (!wanted.includes(name) && tagIds.has(name)) await removeTag(contact.id, tagIds.get(name)!);
      }
      for (const name of wanted) {
        if (!previous.includes(name)) await addTag(contact.id, tagIds.get(name)!);
      }

      const { error } = await supabase.from("profiles").update({ systeme_tags: key }).eq("id", user.id);
      if (error) throw new Error(`No se pudo guardar el estado: ${error.message}`);
      result.updated++;
    } catch (e) {
      result.ok = false;
      if (result.errors.length < 8) {
        result.errors.push(`${user.email}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  return result;
}
