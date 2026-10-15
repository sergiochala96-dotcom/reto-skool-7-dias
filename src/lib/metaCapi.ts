import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { META_PIXEL_ID } from "@/lib/metaPixel";

// API de Conversiones de Meta: envía el evento desde el servidor, además del píxel del
// navegador, para no perder eventos por bloqueadores de anuncios o iPhone.
//
// Variables de entorno (se configuran en Vercel, NUNCA en el código):
//  - META_CAPI_TOKEN: token de acceso del conjunto de datos (obligatorio; sin él no se envía nada)
//  - META_TEST_EVENT_CODE: código de la pestaña "Probar eventos" (opcional, solo para pruebas)

const GRAPH_VERSION = "v23.0";

export type CapiTracking = {
  eventId?: string; // el mismo ID que usó el píxel del navegador, para que Meta no cuente doble
  fbp?: string; // cookie _fbp
  fbc?: string; // cookie _fbc
  sourceUrl?: string;
};

// Meta pide los datos personales normalizados (minúsculas, sin espacios) y cifrados con SHA-256.
function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendLeadToMeta(
  name: string,
  email: string,
  tracking?: CapiTracking
): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return; // aún no configurado: se omite sin afectar el registro

  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = h.get("user-agent") ?? undefined;

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: tracking?.eventId,
          action_source: "website",
          event_source_url: tracking?.sourceUrl,
          user_data: {
            em: [sha256(email)],
            fn: [sha256(name.split(" ")[0] ?? name)],
            client_ip_address: ip,
            client_user_agent: userAgent,
            fbp: tracking?.fbp,
            fbc: tracking?.fbc,
          },
          custom_data: { content_name: "Reto Skool 7 dias" },
        },
      ],
    };
    if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

    await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
  } catch {
    // un fallo de Meta nunca debe frenar el registro de la persona
  }
}
