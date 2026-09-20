"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS } from "@/lib/challenge";

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

function traducirError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Email o contraseña incorrectos.";
  if (message.includes("already registered") || message.includes("already exists"))
    return "Ese email ya tiene una cuenta. Inicia sesión.";
  if (message.includes("Password should be"))
    return "La contraseña es muy corta (mínimo 6 caracteres).";
  return message;
}
