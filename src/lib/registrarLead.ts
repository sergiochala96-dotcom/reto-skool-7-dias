import { SYSTEME_OPTIN } from "@/lib/captacion";
import { createClient } from "@/lib/supabase/server";
import { cleanAttribution, type Attribution } from "@/lib/traffic";
import { sendLeadToMeta, type CapiTracking } from "@/lib/metaCapi";

// Paso común "al crear la cuenta" en /reto (con contraseña o con Google). Hace tres cosas,
// y un fallo en cualquiera NO debe frenar a la persona, que ya tiene su cuenta:
//  1) la guarda en Systeme.io con el mismo formulario de siempre (así se dispara su automatización),
//  2) guarda el lead con su origen de tráfico (UTM) para el panel de admin,
//  3) avisa a Meta del Lead desde el servidor (API de Conversiones).
export async function registrarLead(
  name: string,
  email: string,
  attribution?: Attribution,
  tracking?: CapiTracking
): Promise<void> {
  const firstName = name.trim().split(/\s+/)[0]?.slice(0, 80) || email.split("@")[0];
  const cleanEmail = email.trim().toLowerCase();

  await Promise.allSettled([
    guardarEnSysteme(firstName, cleanEmail),
    guardarLead(firstName, cleanEmail, attribution),
    sendLeadToMeta(firstName, cleanEmail, tracking),
  ]);
}

async function guardarEnSysteme(firstName: string, email: string) {
  await fetch(SYSTEME_OPTIN.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      optin: {
        fields: { first_name: firstName, email },
        timeZone: "UTC",
        isDesktop: true,
        entityId: SYSTEME_OPTIN.entityId,
        checkBoxIds: [],
        surveysResults: {},
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

// Insert simple: si el correo ya existe, la base lo rechaza y se conserva el primer origen.
async function guardarLead(name: string, email: string, attribution?: Attribution) {
  const supabase = await createClient();
  await supabase.from("leads").insert({ name, email, ...cleanAttribution(attribution) });
}
