// Píxel de Meta (conjunto de datos "Skooly – Reto"). El ID no es secreto: va en el
// navegador de todos modos.
export const META_PIXEL_ID = "1123041123634527";

// Clave de localStorage para que el dueño no contamine sus propias audiencias:
// entrar a cualquier página con ?pixel=off apaga el píxel en ese navegador
// (y ?pixel=on lo vuelve a encender).
export const PIXEL_OFF_KEY = "meta_pixel_off";

type Fbq = (...args: unknown[]) => void;

function getFbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fbq === "function" ? fbq : null;
}

// Evento estándar de Meta (Lead, CompleteRegistration, InitiateCheckout...).
export function trackEvent(name: string, params?: Record<string, unknown>, eventId?: string) {
  const fbq = getFbq();
  if (!fbq) return;
  if (eventId) fbq("track", name, params ?? {}, { eventID: eventId });
  else fbq("track", name, params ?? {});
}

// Evento propio (DiaCompletado, RetoCompletado...).
export function trackCustomEvent(name: string, params?: Record<string, unknown>) {
  const fbq = getFbq();
  if (!fbq) return;
  fbq("trackCustom", name, params ?? {});
}

// Evita disparar dos veces el mismo evento para la misma persona/navegador.
export function trackOnce(key: string, fire: () => void) {
  try {
    const storageKey = `meta_once_${key}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");
  } catch {
    // sin localStorage: se dispara igual (mejor repetir que perder el evento)
  }
  fire();
}
