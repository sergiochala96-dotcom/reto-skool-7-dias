import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { planFromCreemProduct } from "@/lib/planes";
import { createServiceClient } from "@/lib/supabase/service";

// Aviso de pago de Creem (webhook). En el panel de Creem se registra esta dirección:
//   https://skool.neobrandclub.com/api/webhooks/creem
// y su "signing secret" va en la variable de entorno CREEM_WEBHOOK_SECRET (Vercel).
//
// Cuando una suscripción se paga (subscription.paid) o empieza (subscription.active), se sube el
// plan de la persona según el producto comprado y se guarda hasta cuándo está pagado
// (profiles.plan_expires_at). No hace falta escuchar las cancelaciones: pasado ese vencimiento la
// app vuelve sola a Standard (ver effectivePlan en lib/planes.ts).
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALLBACK_DAYS = 35; // si el aviso no trae fecha de fin de período

function validSignature(rawBody: string, received: string | null, secret: string): boolean {
  if (!received) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return (
    expected.length === received.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}

type CreemSubscription = {
  id?: string;
  product?: { id?: string } | string;
  customer?: { email?: string } | string;
  metadata?: Record<string, unknown>;
  current_period_end_date?: string | null;
};

export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    // 500: Creem reintenta, así que no se pierde el aviso mientras falta configurar la clave.
    return NextResponse.json({ error: "Falta CREEM_WEBHOOK_SECRET" }, { status: 500 });
  }

  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("creem-signature"), secret)) {
    return NextResponse.json({ error: "Firma no válida" }, { status: 401 });
  }

  let event: { id?: string; eventType?: string; object?: CreemSubscription };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }

  if (event.eventType !== "subscription.paid" && event.eventType !== "subscription.active") {
    return NextResponse.json({ ok: true, ignored: event.eventType ?? "sin tipo" });
  }

  const sub = event.object ?? {};
  const productId = typeof sub.product === "string" ? sub.product : sub.product?.id;
  const plan = productId ? planFromCreemProduct(productId) : null;
  if (!plan) {
    console.error("creem webhook: producto desconocido", productId, event.id);
    return NextResponse.json({ ok: true, ignored: "producto desconocido" });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const periodEnd = sub.current_period_end_date
    ? new Date(sub.current_period_end_date)
    : new Date(Date.now() + FALLBACK_DAYS * 86_400_000);
  const update = { plan, plan_expires_at: periodEnd.toISOString() };

  // 1) Por el id que va dentro del enlace de pago.
  const metaUser = sub.metadata?.user_id;
  let matched = false;
  if (typeof metaUser === "string" && UUID.test(metaUser)) {
    const { data } = await supabase.from("profiles").update(update).eq("id", metaUser).select("id");
    matched = (data ?? []).length > 0;
  }

  // 2) Si no vino el id (por ejemplo, alguien pagó desde un enlace sin él), por el correo.
  if (!matched) {
    const email = typeof sub.customer === "string" ? undefined : sub.customer?.email;
    if (email) {
      const { data } = await supabase
        .from("profiles")
        .update(update)
        .ilike("email", email)
        .select("id");
      matched = (data ?? []).length > 0;
    }
  }

  if (!matched) {
    // Se responde 200 igual (reintentar no ayudaría) y queda en el registro para resolverlo a mano.
    console.error("creem webhook: no se encontró a quién subirle el plan", event.id, plan);
    return NextResponse.json({ ok: true, unmatched: true });
  }

  return NextResponse.json({ ok: true, plan });
}
