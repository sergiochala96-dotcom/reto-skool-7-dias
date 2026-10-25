"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDayUnlocked, TOTAL_DAYS } from "@/lib/challenge";
import { isAdmin } from "@/lib/admin";
import { CREEM_API_BASE, PLANS, PLAN_RANK, effectivePlan, isPlanId } from "@/lib/planes";
import { loadSubscriptions, pushConfigured, sendPush, type PushResult } from "@/lib/push";
import { createServiceClient } from "@/lib/supabase/service";
import { TRIVIA_REWARD, getTodayTrivia } from "@/lib/trivias";
import { INSTALL_REWARD } from "@/lib/captacion";
import { AVATAR_ICON_PREFIX, isAvatarIconKey } from "@/components/AvatarIcon";
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
  | { saved: true; missing: number; total: number; dayComplete: boolean; coins: number }
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
  const savingStartedAt = new Date(Date.now() - 5_000).toISOString();

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

  // Monedas que dio ESTE guardado (las da un trigger de la base al completar el día, una sola vez:
  // si ya las había ganado antes, por ejemplo tras reiniciar el progreso, no se vuelven a dar).
  let coins = 0;
  if (newlyCompleted) {
    const { data: earned } = await supabase
      .from("coin_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .in("reason", ["day", "bono"])
      .gte("created_at", savingStartedAt);
    coins = (earned ?? []).reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  }

  return { saved: true, missing: missingIds.length, total, dayComplete, coins };
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

export type NotificationState = { error?: string; ok?: boolean; pushed?: boolean } | undefined;

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

  // Además de la campanita, el aviso puede salir en la pantalla de bloqueo de quienes lo activaron.
  const alsoPush = formData.get("push") === "on" && pushConfigured();
  if (alsoPush) {
    const preview = body.replace(/s+/g, " ");
    after(async () => {
      const service = createServiceClient();
      if (!service) return;
      await sendPush(service, await loadSubscriptions(service), {
        title,
        body: preview.length > 140 ? `${preview.slice(0, 137)}...` : preview,
        tag: "comunicado",
      });
    });
  }

  revalidatePath("/", "layout");
  return { ok: true, pushed: alsoPush };
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

// Solo el admin: cambia el plan de una persona. La base de datos ignora este cambio si lo hace
// cualquier otra persona (ver protect_plan en la migración 0017).
export async function adminSetPlan(
  userId: string,
  plan: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");
  if (!isPlanId(plan)) return { ok: false, error: "Plan no válido." };

  const { data, error } = await supabase
    .from("profiles")
    .update({ plan, plan_expires_at: null }) // a mano: sin vencimiento
    .eq("id", userId)
    .select("plan")
    .single();
  if (error || data?.plan !== plan) return { ok: false, error: "No se pudo cambiar el plan." };

  revalidatePath("/", "layout");
  return { ok: true };
}

// Mejora de plan de quien ya paga (por ejemplo, Premium a VIP): cambia la MISMA suscripción en
// Creem (se cobra al momento la diferencia proporcional) en vez de crear un segundo cobro. Bajar de
// plan no se hace aquí: se cancela y se contrata el plan menor al terminar el período.
// Necesita CREEM_API_KEY (clave de API de Creem del mismo modo que CREEM_LIVE).
export async function upgradeMySubscription(
  target: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isPlanId(target)) return { ok: false, error: "Plan no válido." };

  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return { ok: false, error: "El cambio automático de plan aún no está disponible." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, creem_subscription_id")
    .eq("id", user.id)
    .single();
  const current = effectivePlan(profile?.plan, profile?.plan_expires_at);
  if (current === "standard" || PLAN_RANK[target] <= PLAN_RANK[current]) {
    return { ok: false, error: "Ese cambio no está disponible." };
  }

  const subscriptionId = profile?.creem_subscription_id as string | null | undefined;
  const productId = PLANS.find((p) => p.id === target)?.creemProductId;
  if (!subscriptionId || !productId) {
    return { ok: false, error: "No encontramos tu suscripción. Escríbenos a soporte." };
  }

  let res: Response;
  try {
    res = await fetch(`${CREEM_API_BASE}/v1/subscriptions/${encodeURIComponent(subscriptionId)}/upgrade`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ product_id: productId, update_behavior: "proration-charge-immediately" }),
    });
  } catch {
    return { ok: false, error: "No pudimos conectar con Creem. Inténtalo de nuevo en un momento." };
  }
  if (!res.ok) {
    console.error("upgradeMySubscription: Creem respondió", res.status);
    return { ok: false, error: "Creem no pudo hacer el cambio. Inténtalo de nuevo o escríbenos a soporte." };
  }

  // La respuesta es la suscripción ya actualizada: de ahí sale hasta cuándo está pagada.
  const sub = (await res.json().catch(() => null)) as { current_period_end_date?: string } | null;
  const end = sub?.current_period_end_date ? new Date(sub.current_period_end_date) : null;
  const expires =
    end && !Number.isNaN(end.getTime()) ? end : new Date(Date.now() + 35 * 86_400_000);

  const service = createServiceClient();
  if (!service) return { ok: false, error: "Hubo un problema al guardar tu plan. Escríbenos a soporte." };
  const { error } = await service
    .from("profiles")
    .update({ plan: target, plan_expires_at: expires.toISOString() })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Se hizo el cambio, pero no pudimos guardarlo. Escríbenos a soporte." };

  revalidatePath("/", "layout");
  return { ok: true };
}

export type TriviaAnswerResult = {
  ok: boolean;
  error?: string;
  correct?: boolean; // ¿acertó esta pregunta? (no viene si ya no tenía vidas)
  correctIndex?: number; // la opción correcta, que se revela al responder
  explanation?: string;
  lives?: number; // vidas que le quedan
  wrong?: number; // respuestas falladas hoy
  total?: number;
  status?: "in_progress" | "completed" | "failed";
  awarded?: number; // monedas ganadas (solo al completar)
};

// Responde la pregunta que sigue de la trivia del día. El servidor califica con las respuestas que
// NO están en el navegador y revela la correcta recién al responder. Cada respuesta fallada cuesta
// una vida; si se queda sin vidas la trivia queda como fallida (sin monedas) hasta el día siguiente
// (6:00 a. m. de Colombia). Al contestar bien la última (con vidas), se dan las monedas una sola vez.
export async function answerTrivia(choice: number): Promise<TriviaAnswerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!Number.isInteger(choice) || choice < 0 || choice > 3) {
    return { ok: false, error: "Elige una respuesta." };
  }
  const service = createServiceClient();
  const unavailable = { ok: false, error: "No pudimos guardar tu respuesta. Inténtalo de nuevo." };
  if (!service) return unavailable;

  const { trivia, date } = getTodayTrivia();
  const total = trivia.questions.length;

  // Un solo intento por día: se crea si no existe y se lee el estado actual.
  await service
    .from("trivia_attempts")
    .upsert({ user_id: user.id, play_date: date }, { onConflict: "user_id,play_date", ignoreDuplicates: true });
  const { data: attempt } = await service
    .from("trivia_attempts")
    .select("answers, wrong, status")
    .eq("user_id", user.id)
    .eq("play_date", date)
    .single();
  if (!attempt) return unavailable;
  if (attempt.status !== "in_progress") {
    return { ok: false, error: "La trivia de hoy ya terminó.", status: attempt.status };
  }

  const index = (attempt.answers as number[]).length;
  if (index >= total) return { ok: false, error: "La trivia de hoy ya terminó." };

  // Sin vidas no se puede seguir: la trivia queda fallida y no hay monedas.
  const { data: currentLives } = await service.rpc("sync_lives", { p_user: user.id });
  let lives = Number(currentLives ?? 0);
  if (lives <= 0) {
    await service
      .from("trivia_attempts")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("play_date", date);
    revalidatePath("/", "layout");
    return { ok: true, status: "failed", lives: 0, wrong: attempt.wrong, total };
  }

  const question = trivia.questions[index];
  const correct = choice === question.answer;

  // Solo cuenta si es la pregunta que sigue (evita responder dos veces la misma).
  const { data: appended } = await service.rpc("append_trivia_answer", {
    p_user: user.id,
    p_date: date,
    p_index: index,
    p_choice: choice,
    p_is_wrong: !correct,
  });
  if (!appended) return { ok: false, error: "Esa pregunta ya se respondió. Recarga la página." };

  const wrong = attempt.wrong + (correct ? 0 : 1);
  let status: "in_progress" | "completed" | "failed" = "in_progress";

  if (!correct) {
    const { data: left } = await service.rpc("lose_life", { p_user: user.id });
    lives = Number(left ?? 0);
    if (lives <= 0) status = "failed";
  }
  if (status === "in_progress" && index === total - 1) status = "completed";

  if (status !== "in_progress") {
    await service
      .from("trivia_attempts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("play_date", date);
  }

  let awarded = 0;
  if (status === "completed") {
    const { error } = await service.rpc("award_coins", {
      p_user: user.id,
      p_amount: TRIVIA_REWARD,
      p_reason: "trivia",
      p_ref: date,
    });
    if (error) console.error("answerTrivia: no se pudieron dar las monedas", error.message);
    else awarded = TRIVIA_REWARD;
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    correct,
    correctIndex: question.answer,
    explanation: question.explain,
    lives,
    wrong,
    total,
    status,
    awarded,
  };
}

// Recompensa de 50 monedas por unirse a WhatsApp o a Skool: la persona escribe un código que solo se
// ve dentro del grupo. La base de datos compara el código, limita los intentos y da las monedas una
// sola vez (el código nunca sale de la base).
export async function claimJoinReward(
  kind: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("claim_join_reward", {
    p_kind: kind,
    p_code: code.slice(0, 80),
  });
  if (error) return { ok: false, error: "No se pudo verificar. Inténtalo de nuevo." };

  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    const messages: Record<string, string> = {
      wrong_code: "Ese código no es correcto. Revísalo dentro del grupo.",
      too_many: "Demasiados intentos. Prueba de nuevo en una hora.",
      not_configured: "Esta recompensa aún no está disponible. Vuelve pronto.",
    };
    return { ok: false, error: messages[result?.error ?? ""] ?? "No se pudo verificar." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

// Recompensa por instalar la app: 100 monedas, una sola vez. Se pide cuando la persona abre Skooly
// desde el icono de su pantalla de inicio (modo app). Ojo: el servidor no puede comprobarlo por sí
// solo, así que esto confía en el aviso del navegador (el premio es único por persona).
export async function claimInstallReward(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const service = createServiceClient();
  if (!service) return { ok: false };
  const { error } = await service.rpc("award_coins", {
    p_user: user.id,
    p_amount: INSTALL_REWARD,
    p_reason: "instalar",
    p_ref: "app",
  });
  if (error) return { ok: false };

  revalidatePath("/", "layout");
  return { ok: true };
}

export type JoinCodesState = { ok?: boolean; error?: string } | undefined;

// Solo el admin: guarda los códigos de verificación de las comunidades.
export async function adminSaveJoinCodes(
  _prevState: JoinCodesState,
  formData: FormData
): Promise<JoinCodesState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const rows = (["whatsapp", "skool"] as const).map((kind) => ({
    kind,
    code: String(formData.get(kind) ?? "").trim(),
    updated_at: new Date().toISOString(),
  }));
  if (rows.some((r) => r.code.length > 40)) {
    return { error: "Los códigos pueden tener hasta 40 caracteres." };
  }

  const { error } = await supabase.from("join_codes").upsert(rows, { onConflict: "kind" });
  if (error) return { error: "No se pudieron guardar los códigos." };

  revalidatePath("/admin/notificaciones");
  return { ok: true };
}

// Pone un icono de la tienda (ya canjeado) como foto de perfil: se guarda "icon:<clave>".
export async function setAvatarIcon(itemId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: item } = await supabase
    .from("shop_items")
    .select("kind")
    .eq("id", itemId)
    .maybeSingle();
  if (item?.kind !== "avatar") return { ok: false, error: "Ese producto no es un icono." };

  // Solo se puede usar lo canjeado (la base ya esconde el contenido de lo no canjeado).
  const { data: redemption } = await supabase
    .from("shop_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();
  if (!redemption && !isAdmin(user.email)) return { ok: false, error: "Primero canjea este icono." };

  const { data: content } = await supabase
    .from("shop_item_contents")
    .select("content")
    .eq("item_id", itemId)
    .maybeSingle();
  const key = content?.content;
  if (!isAvatarIconKey(key)) return { ok: false, error: "No se encontró el icono." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: `${AVATAR_ICON_PREFIX}${key}` })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No se pudo cambiar tu foto." };

  revalidatePath("/", "layout");
  return { ok: true };
}

// Canjea un producto de la tienda con monedas de oro (todo se valida en la base de datos: saldo,
// que no se cobre dos veces y que el contenido solo se vea después de canjear).
export async function redeemShopItem(itemId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("redeem_shop_item", { p_item: itemId });
  if (error) return { ok: false, error: "No se pudo canjear. Inténtalo de nuevo." };

  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    return {
      ok: false,
      error:
        result?.error === "insufficient"
          ? "Aún no tienes monedas suficientes."
          : "Ese producto ya no está disponible.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Notificaciones push (pantalla de bloqueo)
// ---------------------------------------------------------------------------

type PushSubscriptionJSON = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

// Guarda el dispositivo de quien acaba de aceptar los avisos. Se usa la service role porque un
// mismo dispositivo puede pasar de una cuenta a otra (el endpoint es único).
export async function savePushSubscription(sub: PushSubscriptionJSON): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const endpoint = sub.endpoint;
  const p256dh = sub.keys?.p256dh;
  const auth = sub.keys?.auth;
  if (!user || !endpoint || !p256dh || !auth || !endpoint.startsWith("https://")) return { ok: false };

  const service = createServiceClient();
  if (!service) return { ok: false };
  const h = await headers();
  const { error } = await service.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint, p256dh, auth, user_agent: h.get("user-agent")?.slice(0, 300) ?? null },
    { onConflict: "endpoint" }
  );
  return { ok: !error };
}

// Solo el admin: manda un aviso de prueba a UN dispositivo de la lista del panel.
export async function adminSendTestPush(
  subscriptionId: string
): Promise<PushResult & { error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) redirect("/dashboard");
  if (!pushConfigured()) {
    return { sent: 0, removed: 0, failed: 0, error: "Faltan las claves VAPID en Vercel." };
  }
  const service = createServiceClient();
  if (!service) return { sent: 0, removed: 0, failed: 0, error: "Falta SUPABASE_SERVICE_ROLE_KEY." };
  const { data: sub } = await service
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .eq("id", subscriptionId)
    .maybeSingle();
  if (!sub) {
    return { sent: 0, removed: 0, failed: 0, error: "Ese dispositivo ya no está registrado." };
  }
  return sendPush(service, [sub], {
    title: "Prueba de Skooly 🔔",
    body: "Si ves esto en la pantalla de bloqueo, las notificaciones funcionan.",
    tag: "prueba",
  });
}
