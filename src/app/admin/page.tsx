import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS } from "@/lib/challenge";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";
import ResetUserButton from "@/components/ResetUserButton";
import Episode2AccessToggle from "@/components/Episode2AccessToggle";
import SyncSystemeButton from "@/components/SyncSystemeButton";
import CreateAutomationButtons from "@/components/CreateAutomationButtons";
import { classifyTraffic, TRAFFIC_LABEL, TRAFFIC_STYLE } from "@/lib/traffic";

// La sincronización con Systeme.io (botón de abajo) puede tardar si hay muchos cambios.
export const maxDuration = 60;

const PAGE_SIZES = [15, 50, 100] as const;

// Fecha (YYYY-MM-DD) de hace N días, para contar quién lleva más de N días sin entrar.
function dateDaysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

type SearchParams = { pageSize?: string; page?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { nombre, user, avatarUrl, admin, completedDays, notifications } =
    await getSidebarData();
  if (!admin) redirect("/dashboard");

  const supabase = await createClient();

  const params = await searchParams;
  const pageSize = PAGE_SIZES.includes(Number(params.pageSize) as (typeof PAGE_SIZES)[number])
    ? Number(params.pageSize)
    : 15;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: rows,
    count,
    error,
  } = await supabase
    .from("admin_users_overview")
    .select("*", { count: "exact" })
    .range(from, to);

  // Origen del tráfico de cada usuario (si dejó su correo en /reto con etiquetas UTM).
  const emails = (rows ?? []).map((r) => String(r.email ?? "").toLowerCase()).filter(Boolean);
  const { data: leadRows } = emails.length
    ? await supabase
        .from("leads")
        .select("email, utm_medium, utm_source, utm_campaign")
        .in("email", emails)
    : { data: [] };
  const leadByEmail = new Map(
    (leadRows ?? []).map((l) => [String(l.email).toLowerCase(), l])
  );

  // Cuántos llevan más de 5, 7 y 15 días sin entrar (sin contar a quienes ya terminaron el reto).
  const inactivityCounts = await Promise.all(
    [5, 7, 15].map(async (days) => {
      const { count: n } = await supabase
        .from("admin_users_overview")
        .select("id", { count: "exact", head: true })
        .lt("last_seen_date", dateDaysAgo(days))
        .lt("completed_days", TOTAL_DAYS);
      return { days, n: n ?? 0 };
    })
  );
  const todayIso = new Date().toISOString().slice(0, 10);

  // Huella de la última sincronización con Systeme.io (manual o automática).
  const { data: lastSync } = await supabase
    .from("sync_status")
    .select("last_run_at, source, summary")
    .eq("id", 1)
    .maybeSingle();

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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

      <main className="min-w-0 flex-1 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[110rem]">
          <header className="mb-8">
            <p className="text-sm text-white/50">Panel de administración</p>
            <h1 className="text-2xl font-bold text-white">Usuarios de Skooly</h1>
          </header>

          <div className="mb-6 grid grid-cols-3 gap-3 sm:max-w-2xl">
            {inactivityCounts.map(({ days, n }) => (
              <div key={days} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                  Más de {days} días sin entrar
                </p>
                <p className="mt-1 text-3xl font-extrabold text-white">{n}</p>
              </div>
            ))}
          </div>
          <p className="-mt-3 mb-6 text-xs text-white/40">
            No cuenta a quienes ya completaron los 7 días.
          </p>

          <div className="mb-6 flex flex-wrap items-start gap-4">
            <div className="flex flex-col gap-2">
              <SyncSystemeButton />
              <p className="max-w-xl text-xs leading-relaxed text-white/50">
                {lastSync
                  ? `Última sincronización (${lastSync.source}): ${new Date(lastSync.last_run_at).toLocaleString("es", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" })} (hora de Colombia) · ${lastSync.summary}`
                  : "Todavía no se ha registrado ninguna sincronización."}
              </p>
            </div>
            <CreateAutomationButtons />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              {total} usuario{total === 1 ? "" : "s"} registrado
              {total === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              {PAGE_SIZES.map((size) => (
                <a
                  key={size}
                  href={`/admin?pageSize=${size}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    pageSize === size
                      ? "bg-fuchsia-500 text-white"
                      : "border border-white/15 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {size} por página
                </a>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">
              Error al cargar usuarios: {error.message}
            </p>
          )}

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-3 py-3 xl:px-4 font-medium">Nombre</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Email</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Origen</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Progreso</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Días sin entrar</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Última actividad</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Registrado</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Nivel 2</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Respuestas</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Reiniciar usuario</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 text-white/80 last:border-0"
                  >
                    <td className="px-3 py-3 xl:px-4">{row.display_name ?? "—"}</td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">{row.email}</td>
                    <td className="px-3 py-3 xl:px-4">
                      {(() => {
                        const lead = leadByEmail.get(String(row.email ?? "").toLowerCase());
                        const type = classifyTraffic(lead?.utm_medium);
                        return (
                          <span
                            title={
                              lead
                                ? [lead.utm_source, lead.utm_campaign].filter(Boolean).join(" · ")
                                : "No dejó su correo en /reto"
                            }
                            className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${TRAFFIC_STYLE[type]}`}
                          >
                            {lead ? TRAFFIC_LABEL[type] : "Sin registro"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3 xl:px-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          row.completed_days >= TOTAL_DAYS
                            ? "bg-emerald-400/20 text-emerald-300"
                            : "bg-fuchsia-400/20 text-fuchsia-300"
                        }`}
                      >
                        {row.completed_days}/{TOTAL_DAYS}
                      </span>
                    </td>
                    <td className="px-3 py-3 xl:px-4">
                      {(() => {
                        if (!row.last_seen_date) return <span className="text-white/30">—</span>;
                        const away = Math.max(
                          0,
                          Math.floor(
                            (new Date(todayIso).getTime() - new Date(row.last_seen_date).getTime()) /
                              86_400_000
                          )
                        );
                        const done = row.completed_days >= TOTAL_DAYS;
                        const tone = done
                          ? "text-white/40"
                          : away >= 15
                          ? "font-semibold text-red-300"
                          : away >= 7
                          ? "font-semibold text-amber-300"
                          : "text-white/70";
                        return <span className={tone}>{away === 0 ? "Hoy" : `${away} d`}</span>;
                      })()}
                    </td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">
                      {row.last_activity
                        ? new Date(row.last_activity).toLocaleDateString("es")
                        : "—"}
                    </td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">
                      {new Date(row.created_at).toLocaleDateString("es")}
                    </td>
                    <td className="px-3 py-3 xl:px-4">
                      <Episode2AccessToggle
                        userId={row.id}
                        enabled={row.episode2_locked_override === false}
                        label={row.display_name ?? row.email}
                      />
                    </td>
                    <td className="px-3 py-3 xl:px-4">
                      <a
                        href={`/admin/${row.id}`}
                        className="font-medium text-fuchsia-300 hover:underline"
                      >
                        Ver respuestas →
                      </a>
                    </td>
                    <td className="px-3 py-3 xl:px-4">
                      <ResetUserButton
                        userId={row.id}
                        label={row.display_name ?? row.email}
                      />
                    </td>
                  </tr>
                ))}
                {(rows ?? []).length === 0 && !error && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-white/40">
                      Todavía no hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/admin?pageSize=${pageSize}&page=${p}`}
                  className={`h-9 w-9 rounded-lg text-center text-sm leading-9 transition ${
                    p === page
                      ? "bg-fuchsia-500 text-white"
                      : "border border-white/15 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
