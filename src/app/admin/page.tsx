import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS } from "@/lib/challenge";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";
import ResetUserButton, { ResetIcon } from "@/components/ResetUserButton";
import Episode2AccessToggle from "@/components/Episode2AccessToggle";
import SyncSystemeButton from "@/components/SyncSystemeButton";
import ApplyEmailTextsButton from "@/components/ApplyEmailTextsButton";
import { classifyTraffic, TRAFFIC_LABEL, TRAFFIC_STYLE } from "@/lib/traffic";
import { effectivePlan, type PlanId } from "@/lib/planes";

// La sincronización con Systeme.io (botón de abajo) puede tardar si hay muchos cambios.
export const maxDuration = 60;

const PAGE_SIZES = [15, 50, 100] as const;

// Fecha (YYYY-MM-DD) de hace N días, para contar quién lleva más de N días sin entrar.
function dateDaysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

type SearchParams = { pageSize?: string; page?: string; q?: string; sort?: string; dir?: string };

// Columnas por las que se puede ordenar y su sentido al primer clic: los textos de A a Z; los números,
// las fechas y los días sin entrar de mayor a menor.
const SORT_KEYS = ["nombre", "email", "plan", "origen", "progreso", "dias", "actividad", "registrado", "nivel2"] as const;
type SortKey = (typeof SORT_KEYS)[number];
const FIRST_DIR: Record<SortKey, "asc" | "desc"> = {
  nombre: "asc",
  email: "asc",
  plan: "asc",
  origen: "asc",
  progreso: "desc",
  dias: "desc",
  actividad: "desc",
  registrado: "desc",
  nivel2: "desc",
};
const PLAN_RANK: Record<PlanId, number> = { standard: 0, premium: 1, vip: 2 };
const ORIGIN_RANK: Record<string, number> = { pagado: 0, organico: 1, reto_skool: 2, otro: 3, sin_etiqueta: 4 };

// Sin tildes y en minúsculas, para que la búsqueda encuentre "Ríchard" escribiendo "richard".
function plain(v: unknown) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Divide una lista en tandas (las consultas por lista de correos o ids no deben ser larguísimas).
function chunks<T>(list: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  if (!admin) redirect("/dashboard");

  const supabase = await createClient();

  const params = await searchParams;
  const pageSize = PAGE_SIZES.includes(Number(params.pageSize) as (typeof PAGE_SIZES)[number])
    ? Number(params.pageSize)
    : 15;
  const page = Math.max(1, Number(params.page) || 1);
  const q = (params.q ?? "").trim().slice(0, 80);
  const sort: SortKey = (SORT_KEYS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as SortKey)
    : "registrado";
  const dir: "asc" | "desc" = params.dir === "asc" || params.dir === "desc" ? params.dir : FIRST_DIR[sort];
  const todayIso = new Date().toISOString().slice(0, 10);

  // Se leen todos los usuarios (de 1000 en 1000) para poder buscar y ordenar entre todos, no solo
  // dentro de la página que se ve.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRows: any[] = [];
  let error: { message: string } | null = null;
  for (let from = 0; ; from += 1000) {
    const { data, error: e } = await supabase
      .from("admin_users_overview")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    if (e) {
      error = e;
      break;
    }
    allRows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  // Plan de cada usuario (con el vencimiento y el correo con el que pagó, si pagó).
  const planResults = await Promise.all(
    chunks(
      allRows.map((r) => r.id as string),
      100
    ).map((ids) =>
      supabase.from("profiles").select("id, plan, plan_expires_at, creem_customer_email").in("id", ids)
    )
  );
  const planById = new Map(planResults.flatMap((r) => r.data ?? []).map((p) => [p.id as string, p]));

  // Origen del tráfico de cada usuario (si dejó su correo en /reto con etiquetas UTM).
  const leadResults = await Promise.all(
    chunks(
      allRows.map((r) => String(r.email ?? "").toLowerCase()).filter(Boolean),
      100
    ).map((emails) =>
      supabase.from("leads").select("email, utm_medium, utm_source, utm_campaign").in("email", emails)
    )
  );
  const leadByEmail = new Map(
    leadResults.flatMap((r) => r.data ?? []).map((l) => [String(l.email).toLowerCase(), l])
  );

  // Búsqueda por nombre o correo y orden por la columna elegida.
  const needle = plain(q);
  const sortValue = (row: (typeof allRows)[number]): string | number | null => {
    switch (sort) {
      case "nombre":
        return row.display_name ? plain(row.display_name) : null;
      case "email":
        return plain(row.email);
      case "plan": {
        const p = planById.get(row.id as string);
        return PLAN_RANK[effectivePlan(p?.plan, p?.plan_expires_at)];
      }
      case "origen": {
        const lead = leadByEmail.get(String(row.email ?? "").toLowerCase());
        return lead ? ORIGIN_RANK[classifyTraffic(lead.utm_medium, lead.utm_campaign)] : 5;
      }
      case "progreso":
        return Number(row.completed_days ?? 0);
      case "dias":
        return row.last_seen_date
          ? Math.max(0, Math.floor((new Date(todayIso).getTime() - new Date(row.last_seen_date).getTime()) / 86_400_000))
          : null;
      case "actividad":
        return row.last_activity ? new Date(row.last_activity).getTime() : null;
      case "nivel2":
        return row.episode2_locked_override === false ? 1 : 0;
      default:
        return new Date(row.created_at).getTime();
    }
  };
  const filtered = needle
    ? allRows.filter((r) => plain(r.display_name).includes(needle) || plain(r.email).includes(needle))
    : allRows;
  const sorted = filtered
    .map((row) => ({ row, v: sortValue(row) }))
    .sort((a, b) => {
      // Los que no tienen dato quedan siempre al final.
      if (a.v === null && b.v === null) return 0;
      if (a.v === null) return 1;
      if (b.v === null) return -1;
      const cmp =
        typeof a.v === "string" && typeof b.v === "string"
          ? a.v.localeCompare(b.v, "es")
          : Number(a.v) - Number(b.v);
      return dir === "asc" ? cmp : -cmp;
    })
    .map((x) => x.row);
  const from = (page - 1) * pageSize;
  const rows = sorted.slice(from, from + pageSize);

  // Enlace a esta misma pantalla cambiando solo lo indicado (se conserva búsqueda, orden y tamaño).
  const href = (over: { pageSize?: number; page?: number; sort?: SortKey; dir?: "asc" | "desc"; q?: string }) => {
    const v = { pageSize, page: 1, sort, dir, q, ...over };
    const p = new URLSearchParams();
    if (v.pageSize !== 15) p.set("pageSize", String(v.pageSize));
    if (v.q) p.set("q", v.q);
    if (v.sort !== "registrado" || v.dir !== FIRST_DIR.registrado) {
      p.set("sort", v.sort);
      p.set("dir", v.dir);
    }
    if (v.page > 1) p.set("page", String(v.page));
    const qs = p.toString();
    return `/admin${qs ? `?${qs}` : ""}`;
  };
  // Título de columna que ordena al hacer clic (otro clic invierte el sentido).
  const sortHead = (key: SortKey, label: string, title?: string) => {
    const active = sort === key;
    return (
      <th className="px-3 py-3 xl:px-4 font-medium" title={title} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
        <a
          href={href({ sort: key, dir: active ? (dir === "asc" ? "desc" : "asc") : FIRST_DIR[key] })}
          className={`inline-flex items-center gap-1 transition hover:text-white ${active ? "text-white" : ""}`}
        >
          {label}
          <span className={`text-[10px] ${active ? "text-violet-300" : "text-white/25"}`} aria-hidden="true">
            {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </a>
      </th>
    );
  };

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

  // Huella de la última sincronización con Systeme.io (manual o automática).
  const { data: lastSync } = await supabase
    .from("sync_status")
    .select("last_run_at, source, summary")
    .eq("id", 1)
    .maybeSingle();

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex min-h-screen flex-col bg-ink md:flex-row">
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
            <ApplyEmailTextsButton />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <form action="/admin" method="get" role="search" className="relative">
                {pageSize !== 15 && <input type="hidden" name="pageSize" value={pageSize} />}
                {(sort !== "registrado" || dir !== FIRST_DIR.registrado) && (
                  <>
                    <input type="hidden" name="sort" value={sort} />
                    <input type="hidden" name="dir" value={dir} />
                  </>
                )}
                <label htmlFor="admin-search" className="sr-only">
                  Buscar por nombre o correo
                </label>
                <input
                  id="admin-search"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Buscar nombre o correo"
                  autoComplete="off"
                  className="w-72 rounded-xl border border-white/15 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-violet-400"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
              </form>
              <p className="text-sm text-white/60">
                {q ? (
                  <>
                    {total} resultado{total === 1 ? "" : "s"} de {allRows.length} ·{" "}
                    <a href={href({ q: "", page: 1 })} className="text-violet-300 hover:underline">
                      Quitar búsqueda
                    </a>
                  </>
                ) : (
                  <>
                    {total} usuario{total === 1 ? "" : "s"} registrado
                    {total === 1 ? "" : "s"}
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {PAGE_SIZES.map((size) => (
                <a
                  key={size}
                  href={href({ pageSize: size, page: 1 })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    pageSize === size
                      ? "bg-violet-500 text-white"
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
                  {sortHead("nombre", "Nombre")}
                  {sortHead("email", "Email")}
                  {sortHead("plan", "Plan")}
                  {sortHead("origen", "Origen", "De qué anuncio o enlace llegó")}
                  {sortHead("progreso", "Progreso")}
                  {sortHead("dias", "Días sin entrar")}
                  {sortHead("actividad", "Última actividad")}
                  {sortHead("registrado", "Registrado")}
                  {sortHead("nivel2", "Nivel 2")}
                  <th className="px-3 py-3 xl:px-4 font-medium">Respuestas</th>
                  <th className="px-3 py-3 xl:px-4 font-medium" title="Reiniciar usuario">
                    <ResetIcon className="h-4 w-4" />
                    <span className="sr-only">Reiniciar usuario</span>
                  </th>
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
                        const p = planById.get(row.id as string);
                        const current = effectivePlan(p?.plan, p?.plan_expires_at);
                        const style: Record<PlanId, string> = {
                          standard: "bg-white/10 text-white/60",
                          premium: "bg-violet-400/20 text-violet-200",
                          vip: "bg-amber-400/20 text-amber-300",
                        };
                        const label: Record<PlanId, string> = {
                          standard: "Standard",
                          premium: "Premium",
                          vip: "VIP",
                        };
                        const until =
                          current !== "standard" && p?.plan_expires_at
                            ? new Date(p.plan_expires_at).toLocaleDateString("es")
                            : null;
                        return (
                          <span
                            title={
                              p?.creem_customer_email
                                ? `Pagó con: ${p.creem_customer_email}`
                                : current === "standard"
                                  ? "Plan gratuito"
                                  : "Plan dado a mano"
                            }
                            className="inline-flex flex-col items-start gap-0.5"
                          >
                            <span
                              className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${style[current]}`}
                            >
                              {label[current]}
                            </span>
                            {until && <span className="text-[11px] text-white/40">hasta {until}</span>}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3 xl:px-4">
                      {(() => {
                        const lead = leadByEmail.get(String(row.email ?? "").toLowerCase());
                        const type = classifyTraffic(lead?.utm_medium, lead?.utm_campaign);
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
                            : "bg-violet-400/20 text-violet-300"
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
                        className="font-medium text-violet-300 hover:underline"
                      >
                        Ver
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
                    <td colSpan={11} className="px-4 py-8 text-center text-white/40">
                      {q ? "Ninguna persona coincide con la búsqueda." : "Todavía no hay usuarios registrados."}
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
                  href={href({ page: p })}
                  className={`h-9 w-9 rounded-lg text-center text-sm leading-9 transition ${
                    p === page
                      ? "bg-violet-500 text-white"
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
