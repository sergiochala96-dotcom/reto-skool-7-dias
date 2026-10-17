"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Attribution } from "@/lib/traffic";
import type { CapiTracking } from "@/lib/metaCapi";
import { registrarLead } from "@/lib/registrarLead";

export type CrearCuentaState =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; error: string; exists?: boolean };

const GENERIC_ERROR = "No pudimos crear tu cuenta. Intenta de nuevo en un momento.";

// /reto ahora es captación y registro a la vez: crea la cuenta (con sesión iniciada) y, con
// la cuenta ya creada, registra el lead en Systeme.io, en el panel de origen y en Meta.
export async function crearCuentaReto(
  name: string,
  email: string,
  password: string,
  attribution?: Attribution,
  tracking?: CapiTracking
): Promise<CrearCuentaState> {
  const cleanName = name.trim().slice(0, 80);
  const cleanEmail = email.trim().toLowerCase().slice(0, 200);

  if (!cleanName) return { ok: false, error: "Escribe tu nombre." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: "Escribe un correo válido." };
  }
  if (password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const h = await headers();
    const origin = h.get("origin") ?? `https://${h.get("host")}`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { display_name: cleanName },
        // Si Supabase pide confirmar el correo, el enlace del correo lo deja dentro del panel.
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("crearCuentaReto: signUp", error.code ?? error.status, error.message);
      const msg = error.message.toLowerCase();
      if (error.code === "over_email_send_rate_limit" || msg.includes("rate limit")) {
        return {
          ok: false,
          error: "Hay muchas personas registrándose en este momento. Intenta de nuevo en unos minutos.",
        };
      }
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return { ok: false, error: "Ese correo ya tiene una cuenta.", exists: true };
      }
      if (msg.includes("password")) {
        return { ok: false, error: "La contraseña es muy corta (mínimo 6 caracteres)." };
      }
      if (msg.includes("valid email") || msg.includes("invalid")) {
        return { ok: false, error: "Ese correo no parece válido. Revísalo e intenta de nuevo." };
      }
      return { ok: false, error: GENERIC_ERROR };
    }

    // El lead se registra igual (aunque aún deba confirmar el correo), pero en segundo plano
    // para que la persona entre al panel al instante sin esperar a Systeme.io ni a Meta.
    const account = data.session && data.user ? { supabase, userId: data.user.id } : undefined;
    after(() => registrarLead(cleanName, cleanEmail, attribution, tracking, account));

    // Sin sesión = Supabase pidió confirmar el correo antes de dejarla entrar.
    return { ok: true, needsConfirmation: !data.session };
  } catch (e) {
    console.error("crearCuentaReto", e);
    return { ok: false, error: GENERIC_ERROR };
  }
}
