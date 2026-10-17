"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDayUnlocked, TOTAL_DAYS } from "@/lib/challenge";
import { isAdmin } from "@/lib/admin";
import { syncSysteme, type SyncResult } from "@/lib/syncSysteme";
import { updateAutomationEmails, type UpdateResult } from "@/lib/systemeAutomations";
import { createCampaignAutomation, updateCampaignSteps } from "@/lib/systemeCampaigns";
import {
  countRequiredFields,
  getFlatFields,
  getMissingRequiredFieldIds,
  isMultiValueField,
  type Answers,
} from "@/lib/missionFields";

export type AuthState = { error?: string } | undefined;

export async function signUpWithEmail(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const nombre = String(formData.get("nombre") || "").trim();

  if (!email || !password) return { error: "Completa email y contraseña." };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres." };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: nombre || email.split("@")[0] },
      // Si Supabase pide confirmar el correo, el enlace del correo lo deja dentro del panel.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: traducirError(error.message) };

  // Sin sesión = hay que confirmar el correo primero. Antes se mandaba igual al panel y la
  // persona terminaba en el login sin saber por qué.
  if (!data.session) {
    return {
      error:
        "Te enviamos un correo para confirmar tu cuenta. Ábrelo y toca el botón; si no lo ves, revisa Promociones o Spam.",
    };
  }

  redirect("/dashboard");
}

export async function signInWithEmail(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Completa email y contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traducirError(error.message) };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Recuperar contraseña
// ---------------------------------------------------------------------------

export type ResetState = { error?: string; sent?: boolean } | undefined;

// Paso 1: la persona escribe su correo y recibe un enlace. La respuesta es siempre la misma
// (exista o no la cuenta) para no revelar qué correos están registrados.
export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Escribe un correo válido." };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Misma dirección que usa el inicio de sesión con Google, que ya está autorizada en Supabase.
    redirectTo: `${origin}/auth/callback`,
  });
  if (error) {
    return {
      error: error.message.toLowerCase().includes("rate")
        ? "Pediste muchos enlaces seguidos. Espera unos minutos e intenta de nuevo."
        : "No pudimos enviar el correo. Intenta de nuevo en un momento.",
    };
  }

  // Marca que el próximo regreso por /auth/callback es una recuperación: así el enlace del
  // correo lleva a elegir la contraseña nueva (ver auth/callback/route.ts).
  (await cookies()).set("pw_reset", "1", {
    maxAge: 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });

  return { sent: true };
}

// Paso 2: con la sesión que abre el enlace del correo, la persona elige su contraseña nueva.
export async function updatePassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      error: error.message.includes("different from the old password")
        ? "Elige una contraseña distinta a la anterior."
        : "No pudimos cambiar la contraseña. Pide un enlace nuevo e intenta de nuevo.",
    };
  }

  redirect("/dashboard");
}

export async function completeDay(day: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // No permitir saltarse días: solo se puede completar si el anterior ya está hecho.
  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("day")
    .eq("user_id", user.id);

  const completedDays = new Set((progress ?? []).map((p) => p.day));
  const unlocked = isDayUnlocked(day, completedDays);

  if (!unlocked || day < 1 || day > TOTAL_DAYS) {
    redirect("/dashboard");
  }

  await supabase.from("challenge_progress").upsert(
    { user_id: user.id, day },
    { onConflict: "user_id,day" }
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dia/${day}`);
  revalidatePath("/cofre");

  if (day === TOTAL_DAYS) redirect("/cofre");
  redirect("/dashboard");
}

// Marca una misión inicial como hecha cuando la persona toca su botón (no se puede verificar
// desde aquí que haya entrado a Skool o a WhatsApp, por eso es de avance, no de prueba).
export async function completeStartMission(kind: "skool" | "whatsapp"): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const column = kind === "skool" ? "joined_skool_at" : "joined_whatsapp_at";
  await supabase
    .from("profiles")
    .update({ [column]: new Date().toISOString() })
    .eq("id", user.id)
    .is(column, null);

  revalidatePath("/dashboard");
}

export async function uncompleteDay(day: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Desmarcar un día también desmarca los siguientes, para no dejar
  // días "completados" que dependían de uno que ya no lo está.
  await supabase
    .from("challenge_progress")
    .delete()
    .eq("user_id", user.id)
    .gte("day", day);

  revalidatePath("/dashboard");
  revalidatePath(`/dia/${day}`);
  revalidatePath("/cofre");
}

export type MissionState =
  | { saved: true; missing: number; total: number; dayComplete: boolean }
  | undefined;

export async function saveMissionAnswers(
  day: number,
  _prevState: MissionState,
  formData: FormData
): Promise<MissionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("day")
    .eq("user_id", user.id);

  const completedDays = new Set((progress ?? []).map((p) => p.day));
  const unlocked = isDayUnlocked(day, completedDays);
  if (!unlocked || day < 1 || day > TOTAL_DAYS) redirect("/dashboard");

  const multiValueIds = new Set(
    getFlatFields(day)
      .filter(isMultiValueField)
      .map((f) => f.id)
  );

  const answers: Answers = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("field_")) continue;
    const id = key.slice("field_".length);
    const str = String(value);
    if (multiValueIds.has(id)) {
      const existing = answers[id];
      answers[id] = Array.isArray(existing) ? [...existing, str] : [str];
    } else {
      answers[id] = str;
    }
  }

  const missingIds = getMissingRequiredFieldIds(day, answers);
  const { total } = countRequiredFields(day, answers);
  const dayComplete = missingIds.length === 0;
  const newlyCompleted = dayComplete && !completedDays.has(day);

  // Las respuestas y el progreso no dependen entre sí, así que se guardan en
  // paralelo en vez de uno tras otro (esto era lo que hacía tardar el popup
  // de celebración: dos round-trips secuenciales a Supabase en vez de uno).
  await Promise.all([
    supabase
      .from("mission_answers")
      .upsert(
        { user_id: user.id, day, answers, updated_at: new Date().toISOString() },
        { onConflict: "user_id,day" }
      ),
    newlyCompleted
      ? supabase
          .from("challenge_progress")
          .upsert({ user_id: user.id, day }, { onConflict: "user_id,day" })
      : Promise.resolve(),
  ]);

  if (newlyCompleted) {
    revalidatePath("/dashboard");
    revalidatePath("/cofre");
  }

  revalidatePath(`/dia/${day}`);

  return { saved: true, missing: missingIds.length, total, dayComplete };
}

export async function adminUnlockAll(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const rows = Array.from({ length: TOTAL_DAYS }, (_, i) => ({
    user_id: user.id,
    day: i + 1,
  }));
  await supabase.from("challenge_progress").upsert(rows, { onConflict: "user_id,day" });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function adminResetProgress(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  await supabase.from("challenge_progress").delete().eq("user_id", user.id);
  await supabase.from("mission_answers").delete().eq("user_id", user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// Resetea la cuenta de OTRO usuario desde el panel de admin: la deja como
// si fuera nueva (sin progreso ni respuestas), para pruebas o a pedido del
// propio usuario.
export async function adminResetUserProgress(targetUserId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  await supabase.from("challenge_progress").delete().eq("user_id", targetUserId);
  await supabase.from("mission_answers").delete().eq("user_id", targetUserId);
  await supabase
    .from("profiles")
    .update({
      welcome_video_seen: false,
      episode2_locked_override: null,
      joined_skool_at: null,
      joined_whatsapp_at: null,
    })
    .eq("id", targetUserId);

  revalidatePath("/admin");
}

// El Episodio 2 está bloqueado para todos por defecto: solo se desbloquea cuando
// episode2_locked_override es exactamente false, y solo el admin puede escribir ese campo
// (también lo protege un trigger en la base de datos).
//
// Botón de prueba del propio admin: bloquea/desbloquea el Episodio 2 en SU PROPIA cuenta.
export async function toggleEpisode2LockOverride(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("episode2_locked_override")
    .eq("id", user.id)
    .single();

  const currentlyLocked = profile?.episode2_locked_override !== false;

  await supabase
    .from("profiles")
    .update({ episode2_locked_override: currentlyLocked ? false : true })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// Desde el panel de admin: da o quita el acceso al Episodio 2 a un usuario.
export async function adminSetEpisode2Access(
  targetUserId: string,
  enabled: boolean
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  await supabase
    .from("profiles")
    .update({ episode2_locked_override: enabled ? false : null })
    .eq("id", targetUserId);

  revalidatePath("/admin");
}

export async function updateProfile(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) return { error: "El nombre no puede estar vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: authError } = await supabase.auth.updateUser({
    data: { display_name: nombre },
  });
  if (authError) return { error: authError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: nombre })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  revalidatePath("/", "layout");
  return { error: undefined };
}

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

export async function updateAvatar(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "La imagen no puede pesar más de 3MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  // Se guarda solo en profiles (no en user_metadata): al iniciar sesión con
  // Google, Supabase re-sincroniza user_metadata con los datos de Google en
  // cada login y sobreescribía la foto subida aquí.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  revalidatePath("/", "layout");
  return { error: undefined };
}

function traducirError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return 'Email o contraseña incorrectos. Si te registraste con Google, entra con el botón "Continuar con Google". Si no recuerdas tu contraseña o nunca creaste una, usa "¿Olvidaste tu contraseña?".';
  if (message.includes("already registered") || message.includes("already exists"))
    return 'Ese email ya tiene una cuenta. Inicia sesión; si la creaste con Google, usa el botón "Continuar con Google".';
  if (message.includes("Password should be"))
    return "La contraseña es muy corta (mínimo 6 caracteres).";
  if (message.toLowerCase().includes("rate limit"))
    return "Hay muchas solicitudes en este momento. Intenta de nuevo en unos minutos.";
  if (message.includes("Email not confirmed"))
    return "Aún no confirmas tu correo. Revisa tu bandeja (y Promociones o Spam) y toca el enlace.";
  return message;
}

// ---------------------------------------------------------------------------
// Notificaciones
// ---------------------------------------------------------------------------

// Marca una notificación como leída para el usuario actual.
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notification_reads")
    .upsert(
      { user_id: user.id, notification_id: notificationId },
      { onConflict: "user_id,notification_id", ignoreDuplicates: true }
    );
}

export type NotificationState = { error?: string; ok?: boolean } | undefined;

// El admin escribe un comunicado que le aparece a todos los usuarios en la campanita.
export async function adminCreateNotification(
  _prevState: NotificationState,
  formData: FormData
): Promise<NotificationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title) return { error: "Escribe un título." };
  if (!body) return { error: "Escribe el mensaje." };
  if (title.length > 120) return { error: "El título es muy largo (máximo 120 caracteres)." };
  if (body.length > 5000) return { error: "El mensaje es muy largo (máximo 5000 caracteres)." };

  const { error } = await supabase
    .from("notifications")
    .insert({ title, body, created_by: user.id });
  if (error) return { error: "No se pudo enviar la notificación. Intenta de nuevo." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function adminDeleteNotification(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  await supabase.from("notifications").delete().eq("id", notificationId);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Sincronización con Systeme.io (etiquetas de avance e inactividad)
// ---------------------------------------------------------------------------

// Botón del panel de admin: ejecuta la sincronización ahora (la misma que corre a diario).
export async function adminSyncSysteme(): Promise<SyncResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  try {
    const result = await syncSysteme(supabase);
    revalidatePath("/admin");
    return result;
  } catch (e) {
    return {
      ok: false,
      total: 0,
      unchanged: 0,
      updated: 0,
      contactsCreated: 0,
      tagsCreated: [],
      tagsDeleted: [],
      pending: 0,
      errors: [e instanceof Error ? e.message : String(e)],
    };
  }
}

// Aplica en Systeme.io el texto actual de los 6 correos automáticos (2 correos sueltos y
// los pasos de las 2 campañas). Reemplaza el texto que haya allí; no toca reglas, esperas
// ni etiquetas.
export async function adminApplyEmailTexts(): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const emails = await updateAutomationEmails(["completado", "casi_listo"]);
  // La campaña de bienvenida se crea la primera vez (con una sola regla: suscribir al agregarse
  // reto_sin_empezar); si ya existe, se reutiliza sin duplicar nada. Después se actualizan los
  // textos de todas las campañas.
  const welcome = await createCampaignAutomation("bienvenida");
  const steps = await updateCampaignSteps(["sin_conexion", "sin_empezar", "bienvenida"]);
  return {
    ok: emails.ok && welcome.ok && steps.ok,
    lines: [
      ...emails.lines,
      ...(welcome.lines ?? []).map((l) => `Bienvenida · ${l}`),
      ...(steps.lines ?? []),
    ],
    error:
      [emails.error, welcome.error, steps.error].filter(Boolean).join(" | ") || undefined,
  };
}
