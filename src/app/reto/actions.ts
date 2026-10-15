"use server";

import { SYSTEME_OPTIN } from "@/lib/captacion";
import { createClient } from "@/lib/supabase/server";
import { cleanAttribution, type Attribution } from "@/lib/traffic";

export type RetoState = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos enviar tus datos. Intenta de nuevo en un momento.";

// Guarda el contacto en Systeme.io (lista de correos). Se hace desde el servidor
// para no tener problemas de CORS y para no depender del formulario embebido.
export async function registrarContacto(
  name: string,
  email: string,
  attribution?: Attribution
): Promise<RetoState> {
  const firstName = name.trim().slice(0, 80);
  const cleanEmail = email.trim().toLowerCase().slice(0, 200);

  if (!firstName) return { ok: false, error: "Escribe tu nombre." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: "Escribe un correo válido." };
  }

  try {
    const res = await fetch(SYSTEME_OPTIN.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        optin: {
          fields: { first_name: firstName, email: cleanEmail },
          timeZone: "UTC",
          isDesktop: true,
          entityId: SYSTEME_OPTIN.entityId,
          checkBoxIds: [],
          surveysResults: {},
        },
      }),
      cache: "no-store",
    });

    if (res.ok) {
      await guardarLead(firstName, cleanEmail, attribution);
      return { ok: true };
    }

    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      const emailError: string | undefined = data?.errors?.fields?.email?.[0];
      if (emailError) return { ok: false, error: "Ese correo no parece válido. Revísalo e intenta de nuevo." };
    }
    return { ok: false, error: GENERIC_ERROR };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

// Guarda el lead con su origen de tráfico (UTM) en Supabase para verlo en el panel de
// admin. Si la persona ya estaba, se conserva el primer origen. Un fallo aquí no debe
// frenar el registro, que ya quedó en Systeme.io.
async function guardarLead(name: string, email: string, attribution?: Attribution) {
  try {
    const supabase = await createClient();
    // Insert simple: si el correo ya existe, la base lo rechaza y se conserva el primer origen.
    await supabase.from("leads").insert({ name, email, ...cleanAttribution(attribution) });
  } catch {
    // se ignora a propósito
  }
}
