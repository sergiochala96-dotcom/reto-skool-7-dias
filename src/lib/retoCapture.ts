import type { Attribution } from "@/lib/traffic";
import type { CapiTracking } from "@/lib/metaCapi";

// Al ir a Google se pierden los UTM y las cookies de Meta. Antes de salir, /reto los guarda
// en esta cookie de corta vida; al volver, /auth/callback la lee para registrar el lead
// con su origen (ver auth/callback/route.ts).
export const CAPTURE_COOKIE = "reto_capture";

// Cookie legible por el navegador con el ID del evento Lead, para que el panel dispare el
// mismo evento en el píxel y Meta no cuente doble (ver MetaRegistrationEvent).
export const LEAD_PENDING_COOKIE = "lead_pending";

export type Capture = { attribution: Attribution; tracking: CapiTracking };

export function parseCapture(raw: string | undefined): Capture | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Capture;
    return {
      attribution: data.attribution ?? {},
      tracking: data.tracking ?? {},
    };
  } catch {
    return null;
  }
}
