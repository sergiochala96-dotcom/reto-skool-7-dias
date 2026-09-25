"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS } from "@/lib/challenge";
import { isAdmin } from "@/lib/admin";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: nombre || email.split("@")[0] } },
  });

  if (error) return { error: traducirError(error.message) };

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
  const unlocked = day === 1 || completedDays.has(day - 1);

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
  const unlocked = day === 1 || completedDays.has(day - 1);
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

  await supabase
    .from("mission_answers")
    .upsert(
      { user_id: user.id, day, answers, updated_at: new Date().toISOString() },
      { onConflict: "user_id,day" }
    );

  const missingIds = getMissingRequiredFieldIds(day, answers);
  const { total } = countRequiredFields(day, answers);
  const dayComplete = missingIds.length === 0;

  if (dayComplete && !completedDays.has(day)) {
    await supabase
      .from("challenge_progress")
      .upsert({ user_id: user.id, day }, { onConflict: "user_id,day" });

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
    .update({ welcome_video_seen: false, episode2_locked_override: null })
    .eq("id", targetUserId);

  revalidatePath("/admin");
}

// Solo para pruebas del propio admin: fuerza el Episodio 2 bloqueado o
// desbloqueado en SU PROPIA cuenta, sin afectar a los demás usuarios (para
// quienes el Episodio 2 se desbloquea automáticamente al completar los 7 días).
export async function toggleEpisode2LockOverride(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) redirect("/dashboard");

  const [{ data: profile }, { count }] = await Promise.all([
    supabase
      .from("profiles")
      .select("episode2_locked_override")
      .eq("id", user.id)
      .single(),
    supabase
      .from("challenge_progress")
      .select("day", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const naturalLocked = (count ?? 0) < TOTAL_DAYS;
  const currentLocked = profile?.episode2_locked_override ?? naturalLocked;

  await supabase
    .from("profiles")
    .update({ episode2_locked_override: !currentLocked })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
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
    return "Email o contraseña incorrectos.";
  if (message.includes("already registered") || message.includes("already exists"))
    return "Ese email ya tiene una cuenta. Inicia sesión.";
  if (message.includes("Password should be"))
    return "La contraseña es muy corta (mínimo 6 caracteres).";
  return message;
}
