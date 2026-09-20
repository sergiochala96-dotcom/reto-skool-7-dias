import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS } from "@/lib/challenge";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";

const PAGE_SIZES = [15, 50, 100] as const;

type SearchParams = { pageSize?: string; page?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { nombre, user, admin, completedDays } = await getSidebarData();
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

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        admin={admin}
        completedDays={Array.from(completedDays)}
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <p className="text-sm text-white/50">Panel de administración</p>
            <h1 className="text-2xl font-bold text-white">Usuarios de Skooly</h1>
          </header>

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

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Progreso</th>
                  <th className="px-4 py-3 font-medium">Última actividad</th>
                  <th className="px-4 py-3 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 text-white/80 last:border-0"
                  >
                    <td className="px-4 py-3">{row.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/60">{row.email}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-white/60">
                      {row.last_activity
                        ? new Date(row.last_activity).toLocaleDateString("es")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {new Date(row.created_at).toLocaleDateString("es")}
                    </td>
                  </tr>
                ))}
                {(rows ?? []).length === 0 && !error && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40">
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
