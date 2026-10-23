import { NextResponse } from "next/server";
import { TOTAL_DAYS } from "@/lib/challenge";
import { loadSubscriptions, pushConfigured, sendPush } from "@/lib/push";
import { createServiceClient } from "@/lib/supabase/service";
import { daysSince } from "@/lib/syncSysteme";

// Tarea diaria (Vercel Cron, ver vercel.json): avisa en la pantalla de bloqueo a quien activó
// las notificaciones y lleva varios días sin entrar. Se envía UNA vez por ausencia (la fecha de
// última visita por la que ya se avisó queda en profiles.push_reminder_for). Quien ya terminó
// el reto no recibe nada. Usa las mismas variables que la sincronización con Systeme.io
// (CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY) más las claves VAPID.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Días sin entrar para mandar el "te extrañamos".
const INACTIVE_DAYS = 5;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!pushConfigured()) {
    return NextResponse.json({ skipped: "Faltan las claves VAPID" });
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    // Dispositivos agrupados por persona.
    const subsByUser = new Map<string, Awaited<ReturnType<typeof loadSubscriptions>>>();
    for (const s of await loadSubscriptions(supabase)) {
      subsByUser.set(s.user_id, [...(subsByUser.get(s.user_id) ?? []), s]);
    }
    const userIds = [...subsByUser.keys()];

    let sent = 0;
    let reminded = 0;
    for (let i = 0; i < userIds.length; i += 200) {
      const ids = userIds.slice(i, i + 200);
      const [{ data: overview }, { data: states }] = await Promise.all([
        supabase
          .from("admin_users_overview")
          .select("id, display_name, completed_days, last_seen_date")
          .in("id", ids),
        supabase.from("profiles").select("id, push_reminder_for").in("id", ids),
      ]);
      const reminderFor = new Map(
        (states ?? []).map((s) => [s.id as string, s.push_reminder_for as string | null])
      );

      for (const u of overview ?? []) {
        const id = u.id as string;
        const lastSeen = u.last_seen_date as string | null;
        const completed = Number(u.completed_days ?? 0);
        if (!lastSeen || completed >= TOTAL_DAYS) continue;
        if (daysSince(lastSeen, today) < INACTIVE_DAYS) continue;
        if (reminderFor.get(id) === lastSeen) continue; // ya se le avisó por esta ausencia

        const nombre = String(u.display_name ?? "").trim().split(/\s+/)[0] || "";
        const message =
          completed === 0
            ? {
                title: nombre ? `${nombre}, tu reto te espera 🚀` : "Tu reto te espera 🚀",
                body: "Empieza hoy el Día 1: en pocos minutos avanzas hacia tu comunidad en Skool.",
              }
            : {
                title: nombre ? `Te extrañamos, ${nombre} 👋` : "Te extrañamos 👋",
                body: `Tienes tu reto a medias (${completed}/${TOTAL_DAYS} días). Retómalo hoy, ¡te falta poco!`,
              };

        const result = await sendPush(supabase, subsByUser.get(id) ?? [], {
          ...message,
          tag: "reactivacion",
        });
        sent += result.sent;
        reminded++;
        await supabase.from("profiles").update({ push_reminder_for: lastSeen }).eq("id", id);
      }
    }

    return NextResponse.json({ ok: true, usersWithPush: userIds.length, reminded, sent });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
