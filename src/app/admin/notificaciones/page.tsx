import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";
import NotificationForm from "@/components/NotificationForm";
import DeleteNotificationButton from "@/components/DeleteNotificationButton";

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
  const { nombre, user, avatarUrl, admin, completedDays, notifications } =
    await getSidebarData();
  if (!admin) redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: sent }, { data: reads }, { count: totalUsers }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("notification_reads").select("notification_id"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

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

          <NotificationForm />

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
