import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";
import NotificationForm from "@/components/NotificationForm";
import DeleteNotificationButton from "@/components/DeleteNotificationButton";
import TestPushButton from "@/components/TestPushButton";
import JoinCodesForm from "@/components/JoinCodesForm";
import { pushConfigured } from "@/lib/push";
import { DEVICE_ICON, DEVICE_LABEL, detectDevice } from "@/lib/device";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminNotificationsPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  if (!admin) redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: sent }, { data: reads }, { count: totalUsers }, { data: pushRows }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("notification_reads").select("notification_id"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("push_subscriptions")
      .select("id, user_id, user_agent, created_at")
      .order("created_at", { ascending: false }),
  ]);
  const pushUsers = new Set((pushRows ?? []).map((r) => r.user_id as string)).size;
  const { data: pushProfiles } = pushUsers
    ? await supabase
        .from("profiles")
        .select("id, email")
        .in("id", [...new Set((pushRows ?? []).map((r) => r.user_id as string))])
    : { data: [] };
  const emailById = new Map((pushProfiles ?? []).map((p) => [p.id as string, p.email as string]));
  const pushReady = pushConfigured();
  const { data: codeRows } = await supabase.from("join_codes").select("kind, code");
  const codes = new Map((codeRows ?? []).map((c) => [c.kind as string, c.code as string]));

  const readCount = new Map<string, number>();
  for (const r of reads ?? []) {
    const id = r.notification_id as string;
    readCount.set(id, (readCount.get(id) ?? 0) + 1);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
        notifications={notifications}
        plan={plan}
        coins={coins}
        lives={lives}
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8">
            <p className="text-sm text-white/50">Panel de administración</p>
            <h1 className="text-2xl font-bold text-white">Escribir notificaciones</h1>
            <p className="mt-1 text-sm text-white/60">
              Lo que envíes le aparece a todos los usuarios en la campanita 🔔 del menú.
            </p>
          </header>

          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="text-sm font-semibold text-white">🔔 Avisos en la pantalla de bloqueo</p>
            {pushReady ? (
              <p className="mt-1 text-sm text-white/70">
                {pushUsers} de {totalUsers ?? 0} usuarios los tienen activados. Además, cada día se
                avisa a quien lleva 5 días sin entrar.
              </p>
            ) : (
              <p className="mt-1 text-sm text-amber-200">
                Aún faltan las claves en Vercel (NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY).
                Mientras tanto, los comunicados solo salen en la campanita.
              </p>
            )}
            {pushReady && (pushRows ?? []).length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {(pushRows ?? []).map((r) => {
                  const device = detectDevice(r.user_agent as string | null);
                  return (
                    <li
                      key={r.id as string}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {DEVICE_ICON[device]} {DEVICE_LABEL[device]} ·{" "}
                          {emailById.get(r.user_id as string) ?? "cuenta eliminada"}
                        </p>
                        <p className="text-xs text-white/40">
                          Activado el {formatDateTime(r.created_at as string)}
                        </p>
                      </div>
                      <TestPushButton subscriptionId={r.id as string} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <NotificationForm />

          <div className="mt-10">
            <JoinCodesForm whatsapp={codes.get("whatsapp") ?? ""} skool={codes.get("skool") ?? ""} />
          </div>

          <h2 className="mb-3 mt-10 text-lg font-bold text-white">Enviadas</h2>
          {(sent ?? []).length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-center text-sm text-white/50">
              Aún no has enviado ninguna notificación.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {(sent ?? []).map((n) => (
                <li
                  key={n.id as string}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{n.title as string}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {formatDateTime(n.created_at as string)} · leída por{" "}
                        {readCount.get(n.id as string) ?? 0} de {totalUsers ?? 0} usuarios
                      </p>
                    </div>
                    <DeleteNotificationButton id={n.id as string} />
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-white/70">
                    {n.body as string}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
