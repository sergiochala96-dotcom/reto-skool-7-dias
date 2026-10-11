"use server";

import { SYSTEME_OPTIN } from "@/lib/captacion";

export type RetoState = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos enviar tus datos. Intenta de nuevo en un momento.";

// Guarda el contacto en Systeme.io (lista de correos). Se hace desde el servidor
// para no tener problemas de CORS y para no depender del formulario embebido.
export async function registrarContacto(name: string, email: string): Promise<RetoState> {
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

    if (res.ok) return { ok: true };

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
