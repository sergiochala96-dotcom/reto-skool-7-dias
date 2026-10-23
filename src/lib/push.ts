import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";

// Envío de notificaciones push (pantalla de bloqueo). Variables de entorno en Vercel:
//  - NEXT_PUBLIC_VAPID_PUBLIC_KEY: clave pública (también la usa el navegador para suscribirse)
//  - VAPID_PRIVATE_KEY: clave privada, solo del servidor. Se generan con `npm run vapid`.
// Sin ellas, los envíos se omiten sin dar error.

export type PushPayload = { title: string; body: string; url?: string; tag?: string };
export type PushResult = { sent: number; removed: number; failed: number; skipped?: boolean };

type SubscriptionRow = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string };

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(`mailto:${ADMIN_EMAIL}`, pub, priv);
  configured = true;
  return true;
}

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

// Envía el mismo aviso a una lista de dispositivos. Los que ya no existen (el usuario desactivó
// los avisos o desinstaló la app: el servicio responde 404/410) se borran de la base.
export async function sendPush(
  supabase: SupabaseClient,
  subs: SubscriptionRow[],
  payload: PushPayload
): Promise<PushResult> {
  const result: PushResult = { sent: 0, removed: 0, failed: 0 };
  if (!configure()) return { ...result, skipped: true };

  const message = JSON.stringify({ url: "/dashboard", ...payload });
  const expired: string[] = [];

  for (let i = 0; i < subs.length; i += 25) {
    await Promise.all(
      subs.slice(i, i + 25).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            message,
            { TTL: 60 * 60 * 24 * 3 }
          );
          result.sent++;
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) expired.push(s.id);
          else result.failed++;
        }
      })
    );
  }

  if (expired.length) {
    await supabase.from("push_subscriptions").delete().in("id", expired);
    result.removed = expired.length;
  }
  return result;
}

// Todos los dispositivos registrados, o solo los de un usuario.
export async function loadSubscriptions(
  supabase: SupabaseClient,
  userId?: string
): Promise<SubscriptionRow[]> {
  const rows: SubscriptionRow[] = [];
  for (let from = 0; ; from += 1000) {
    let query = supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .range(from, from + 999);
    if (userId) query = query.eq("user_id", userId);
    const { data } = await query;
    rows.push(...((data ?? []) as SubscriptionRow[]));
    if ((data ?? []).length < 1000) break;
  }
  return rows;
}
