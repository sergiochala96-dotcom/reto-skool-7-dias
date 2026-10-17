import type { SupabaseClient } from "@supabase/supabase-js";
import { TOTAL_DAYS } from "@/lib/challenge";
import {
  createContact,
  createTag,
  ensureTag,
  findContactByEmail,
  listTags,
  deleteTag,
  removeTag,
} from "@/lib/systeme";

// Etiquetas que maneja la app en Systeme.io (estas 4 más la de origen "Skooly Leads"; el resto
// de tu cuenta no se toca).
//
// Avance (a lo sumo una): reto_sin_empezar (0 días) | reto_casi_listo (5 o 6 días) | reto_completado (7)
//   Quien va entre 1 y 4 días no lleva etiqueta de avance.
// Inactividad: sin_conexion (7 o más días sin entrar; se quita cuando la persona vuelve).
//   Los plazos de 7, 15 y 30 días se arman en la automatización de Systeme.io con esperas.
// Cada vez que se AGREGA una etiqueta puedes disparar una automatización en Systeme.io.
export const PROGRESS_TAGS = ["reto_sin_empezar", "reto_casi_listo", "reto_completado"] as const;
export const INACTIVITY_TAGS = ["sin_conexion"] as const;
export const MANAGED_TAGS: string[] = [...PROGRESS_TAGS, ...INACTIVITY_TAGS];

// Etiqueta de origen: la llevan TODAS las personas de Skooly (se pone al registrarse y la
// sincronización se la pone a quien aún no la tenga). Ya no dispara ninguna automatización:
// sirve para segmentar envíos puntuales (por ejemplo, el aviso del workshop).
export const BASE_TAG = "Skooly Leads";

// Etiqueta que SOLO se pone en el momento de registrarse (nunca la pone la sincronización diaria,
// por eso no entra en wantedTags): dispara el correo de bienvenida. Así las cuentas que ya
// existían no reciben ese correo.
export const WELCOME_TAG = "bienvenida";

// Todas las etiquetas que la app deja puestas a una persona según su avance e inactividad.
export function wantedTags(completedDays: number, daysAway: number): string[] {
  const progress = progressTag(completedDays);
  const inactivity = inactivityTag(completedDays, daysAway);
  return [BASE_TAG, ...(progress ? [progress] : []), ...(inactivity ? [inactivity] : [])];
}

// Etiquetas de versiones anteriores de este esquema. Cuando ya no queda nadie por migrar,
// la sincronización las borra de Systeme.io (solo estas, por su nombre exacto) para liberar
// cupo en tu cuenta.
export const OBSOLETE_TAGS = ["reto_en_progreso", "sin_conexion_7d", "sin_conexion_15d", "sin_conexion_30d"];

export function progressTag(completedDays: number): string | null {
  if (completedDays >= TOTAL_DAYS) return "reto_completado";
  if (completedDays >= TOTAL_DAYS - 2) return "reto_casi_listo"; // 5 o 6 de 7
  if (completedDays === 0) return "reto_sin_empezar";
  return null; // 1 a 4 días: sin etiqueta de avance
}

export function daysSince(dateIso: string | null, today: string): number {
  if (!dateIso) return 0;
  const ms = new Date(today).getTime() - new Date(dateIso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

// Quien ya terminó el reto no recibe la etiqueta de inactividad.
export function inactivityTag(completedDays: number, daysAway: number): string | null {
  if (completedDays >= TOTAL_DAYS) return null;
  return daysAway >= 7 ? "sin_conexion" : null;
}

export type SyncResult = {
  ok: boolean;
  total: number; // usuarios revisados
  unchanged: number; // sin cambios desde la última vez (no se llamó a la API)
  updated: number; // personas a las que se les cambiaron etiquetas
  contactsCreated: number; // contactos que no existían en Systeme.io y se crearon
  tagsCreated: string[]; // etiquetas nuevas creadas en Systeme.io
  tagsDeleted: string[]; // etiquetas viejas borradas de Systeme.io
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
export async function syncSysteme(
  supabase: SupabaseClient,
  source: "manual" | "automática" = "manual"
): Promise<SyncResult> {
  try {
    const result = await runSync(supabase);
    await recordRun(supabase, source, summarize(result));
    return result;
  } catch (e) {
    await recordRun(supabase, source, `ERROR: ${e instanceof Error ? e.message : String(e)}`);
    throw e;
  }
}

function summarize(r: SyncResult) {
  return (
    (r.ok ? "OK" : "CON ERRORES") +
    ` · revisados ${r.total} · actualizados ${r.updated} · sin cambios ${r.unchanged} · contactos creados ${r.contactsCreated}` +
    (r.pending > 0 ? ` · pendientes ${r.pending}` : "") +
    (r.errors.length > 0 ? ` · ${r.errors[0]}` : "")
  ).slice(0, 500);
}

// Una sola fila con la última corrida (para verla en el panel de admin). Si falla al
// guardarla no se interrumpe la sincronización.
async function recordRun(supabase: SupabaseClient, source: string, summary: string) {
  try {
    await supabase
      .from("sync_status")
      .upsert({ id: 1, last_run_at: new Date().toISOString(), source, summary });
  } catch {
    // se ignora a propósito
  }
}

async function runSync(supabase: SupabaseClient): Promise<SyncResult> {
  const result: SyncResult = {
    ok: true,
    total: 0,
    unchanged: 0,
    updated: 0,
    contactsCreated: 0,
    tagsCreated: [],
    tagsDeleted: [],
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
      const wanted = wantedTags(completed, daysSince(u.last_seen_date, today));
      return { user: u, wanted, key: wanted.join("|") };
    })
    .filter((t) => t.key !== (t.user.systeme_tags ?? ""));
  result.unchanged = result.total - todo.length;
  if (todo.length === 0) {
    await deleteObsoleteTags(result);
    return result;
  }

  // 3) Las etiquetas deben existir en Systeme.io (si faltan se crean).
  const tagIds = await listTags();
  for (const name of [BASE_TAG, ...MANAGED_TAGS]) {
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
        if (!previous.includes(name)) await ensureTag(contact, tagIds.get(name)!);
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

  // Ya migrados todos: se borran las etiquetas viejas (si hubo errores o quedan pendientes,
  // no se borra nada todavía).
  if (result.ok && result.pending === 0) await deleteObsoleteTags(result);
  return result;
}

async function deleteObsoleteTags(result: SyncResult) {
  try {
    const tagIds = await listTags();
    for (const name of OBSOLETE_TAGS) {
      const id = tagIds.get(name);
      if (id === undefined) continue;
      await deleteTag(id);
      result.tagsDeleted.push(name);
    }
  } catch (e) {
    result.ok = false;
    result.errors.push(`No se pudieron borrar las etiquetas viejas (bórralas a mano en Systeme.io): ${e instanceof Error ? e.message : String(e)}`);
  }
}
