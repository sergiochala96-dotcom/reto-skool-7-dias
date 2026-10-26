import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";
import { DEVICES, DEVICE_ICON, DEVICE_LABEL, isDevice, type Device } from "@/lib/device";
import {
  classifyTraffic,
  TRAFFIC_LABEL,
  TRAFFIC_STYLE,
  type TrafficType,
} from "@/lib/traffic";

type Lead = {
  id: string;
  name: string;
  email: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  device: string | null;
  created_at: string;
};

const PAGE_SIZES = [25, 50, 100] as const;

// Sin tildes y en minúsculas, para que la búsqueda encuentre "Ríchard" escribiendo "richard".
function plain(v: unknown) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Columnas de "Correos captados" por las que se puede ordenar. Al primer clic, los textos van de A a Z
// y la fecha del más reciente al más antiguo; otro clic invierte el sentido.
const SORT_KEYS = ["nombre", "email", "tipo", "fuente", "campana", "contenido", "dispositivo", "fecha"] as const;
type SortKey = (typeof SORT_KEYS)[number];
const FIRST_DIR: Record<SortKey, "asc" | "desc"> = {
  nombre: "asc",
  email: "asc",
  tipo: "asc",
  fuente: "asc",
  campana: "asc",
  contenido: "asc",
  dispositivo: "asc",
  fecha: "desc",
};
const TYPE_RANK: Record<TrafficType, number> = { pagado: 0, organico: 1, reto_skool: 2, otro: 3, sin_etiqueta: 4 };

const FILTERS: { key: TrafficType | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "organico", label: "Orgánico" },
  { key: "pagado", label: "Anuncios" },
  { key: "reto_skool", label: "Reto Skool" },
  { key: "otro", label: "Otro" },
  { key: "sin_etiqueta", label: "Sin etiqueta" },
];

export default async function OrigenPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    pageSize?: string;
    page?: string;
    q?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  if (!admin) redirect("/dashboard");

  const { tipo, pageSize: pageSizeParam, page: pageParam, q: qParam, sort: sortParam, dir: dirParam } =
    await searchParams;
  const sort: SortKey = (SORT_KEYS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortKey)
    : "fecha";
  const dir: "asc" | "desc" = dirParam === "asc" || dirParam === "desc" ? dirParam : FIRST_DIR[sort];
  const filter = FILTERS.some((f) => f.key === tipo) ? (tipo as TrafficType | "todos") : "todos";
  const pageSize = PAGE_SIZES.includes(Number(pageSizeParam) as (typeof PAGE_SIZES)[number])
    ? Number(pageSizeParam)
    : 25;
  const q = (qParam ?? "").trim().slice(0, 80);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, email, utm_source, utm_medium, utm_campaign, utm_content, referrer, device, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  const { data: profileDevices } = await supabase.from("profiles").select("last_device").limit(10000);

  const leads = ((data ?? []) as Lead[]).map((l) => ({ ...l, type: classifyTraffic(l.utm_medium, l.utm_campaign) }));

  const counts: Record<TrafficType, number> = { pagado: 0, organico: 0, reto_skool: 0, otro: 0, sin_etiqueta: 0 };
  for (const l of leads) counts[l.type]++;

  // Dispositivos: con cuál se registró cada correo y con cuál entró por última vez cada usuario.
  // Lo anterior a esta función (o sin dato) cuenta como "Sin dato".
  const leadDevices: Record<Device | "sin_dato", number> = { computadora: 0, android: 0, iphone: 0, otro: 0, sin_dato: 0 };
  for (const l of leads) leadDevices[isDevice(l.device) ? l.device : "sin_dato"]++;
  const userDevices: Record<Device | "sin_dato", number> = { computadora: 0, android: 0, iphone: 0, otro: 0, sin_dato: 0 };
  for (const p of profileDevices ?? []) userDevices[isDevice(p.last_device) ? p.last_device : "sin_dato"]++;
  const deviceGroups = [
    { title: "Con qué dispositivo se registran", counts: leadDevices, total: leads.length },
    { title: "Con qué dispositivo entran (última visita)", counts: userDevices, total: (profileDevices ?? []).length },
  ];

  // Correos por campaña (con su tipo de tráfico y fuente).
  const byCampaign = new Map<string, { type: TrafficType; source: string; campaign: string; count: number }>();
  for (const l of leads) {
    if (l.type === "sin_etiqueta") continue;
    const campaign = l.utm_campaign ?? "(sin campaña)";
    const source = l.utm_source ?? "—";
    const key = `${l.type}||${source}||${campaign}`;
    const prev = byCampaign.get(key);
    if (prev) prev.count++;
    else byCampaign.set(key, { type: l.type, source, campaign, count: 1 });
  }
  const campaigns = [...byCampaign.values()].sort((a, b) => b.count - a.count);

  // Filtro por tipo, búsqueda por nombre o correo y paginación de los correos captados.
  const needle = plain(q);
  const matching = leads.filter(
    (l) =>
      (filter === "todos" || l.type === filter) &&
      (!needle || plain(l.name).includes(needle) || plain(l.email).includes(needle))
  );
  const sortValue = (l: (typeof leads)[number]): string | number | null => {
    switch (sort) {
      case "nombre":
        return l.name ? plain(l.name) : null;
      case "email":
        return plain(l.email);
      case "tipo":
        return TYPE_RANK[l.type];
      case "fuente":
        return l.utm_source ? plain(l.utm_source) : null;
      case "campana":
        return l.utm_campaign ? plain(l.utm_campaign) : null;
      case "contenido":
        return l.utm_content ? plain(l.utm_content) : null;
      case "dispositivo":
        return isDevice(l.device) ? plain(DEVICE_LABEL[l.device]) : null;
      default:
        return new Date(l.created_at).getTime();
    }
  };
  const sorted = matching
    .map((l) => ({ l, v: sortValue(l) }))
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
    .map((x) => x.l);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Number(pageParam) || 1));
  const shown = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Enlace a esta pantalla cambiando solo lo indicado (se conservan filtro, búsqueda y tamaño).
  const href = (over: {
    tipo?: string;
    pageSize?: number;
    page?: number;
    q?: string;
    sort?: SortKey;
    dir?: "asc" | "desc";
  }) => {
    const v = { tipo: filter as string, pageSize, page: 1, q, sort, dir, ...over };
    const p = new URLSearchParams();
    if (v.sort !== "fecha" || v.dir !== FIRST_DIR.fecha) {
      p.set("sort", v.sort);
      p.set("dir", v.dir);
    }
    if (v.tipo !== "todos") p.set("tipo", v.tipo);
    if (v.pageSize !== 25) p.set("pageSize", String(v.pageSize));
    if (v.q) p.set("q", v.q);
    if (v.page > 1) p.set("page", String(v.page));
    const qs = p.toString();
    return `/admin/origen${qs ? `?${qs}` : ""}#correos`;
  };
  const sortHead = (key: SortKey, label: string) => {
    const active = sort === key;
    return (
      <th
        className="px-3 py-3 xl:px-4 font-medium"
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        <a
          href={href({ sort: key, dir: active ? (dir === "asc" ? "desc" : "asc") : FIRST_DIR[key], page: 1 })}
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

  const cards: { type: TrafficType; label: string }[] = [
    { type: "organico", label: "Orgánico" },
    { type: "pagado", label: "Anuncios" },
    { type: "reto_skool", label: "Reto Skool" },
    { type: "otro", label: "Otro" },
    { type: "sin_etiqueta", label: "Sin etiqueta" },
  ];

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
            <h1 className="text-2xl font-bold text-white">Origen del tráfico</h1>
            <p className="mt-1 text-sm text-white/60">
              De dónde llegan las personas que dejan su correo en /reto. Se mide con la etiqueta{" "}
              <code className="text-violet-300">utm_medium</code> del enlace (organic = orgánico,
              paid = anuncios).
            </p>
          </header>

          {error && (
            <p className="mb-6 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">
              Error al cargar: {error.message}
            </p>
          )}

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/40">Total</p>
              <p className="mt-1 text-3xl font-extrabold text-white">{leads.length}</p>
            </div>
            {cards.map((c) => (
              <div key={c.type} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                  {c.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold text-white">{counts[c.type]}</p>
                <p className="text-xs text-white/40">
                  {leads.length ? Math.round((counts[c.type] / leads.length) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 text-lg font-bold text-white">Dispositivos</h2>
          <div className="mb-10 grid gap-4 lg:grid-cols-2">
            {deviceGroups.map((g) => (
              <div key={g.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-semibold text-white/80">{g.title}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[...DEVICES, "sin_dato" as const].map((d) => (
                    <div key={d} className="rounded-xl bg-white/5 px-2 py-3 text-center">
                      <p className="text-lg">{d === "sin_dato" ? "…" : DEVICE_ICON[d]}</p>
                      <p className="text-2xl font-extrabold text-white">{g.counts[d]}</p>
                      <p className="text-[11px] text-white/40">
                        {g.total ? Math.round((g.counts[d] / g.total) * 100) : 0}%
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium leading-tight text-white/60">
                        {d === "sin_dato" ? "Sin dato" : DEVICE_LABEL[d]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-white/40 lg:col-span-2">
              Se detecta por el navegador de cada persona. Quien se registró antes de hoy aparece
              como “Sin dato” hasta que vuelva a entrar; las visitas nuevas se van sumando solas.
              Un iPad en modo escritorio se cuenta como computadora.
            </p>
          </div>

          <h2 className="mb-3 text-lg font-bold text-white">Por campaña</h2>
          <div className="mb-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-3 py-3 xl:px-4 font-medium">Tipo</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Fuente</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Campaña</th>
                  <th className="px-3 py-3 xl:px-4 text-right font-medium">Correos</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 text-white/80 last:border-0">
                    <td className="px-3 py-3 xl:px-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${TRAFFIC_STYLE[c.type]}`}
                      >
                        {TRAFFIC_LABEL[c.type]}
                      </span>
                    </td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">{c.source}</td>
                    <td className="px-3 py-3 xl:px-4">{c.campaign}</td>
                    <td className="px-3 py-3 xl:px-4 text-right font-semibold">{c.count}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-white/40">
                      Aún no hay correos con etiquetas UTM.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div id="correos" className="mb-3 flex scroll-mt-6 flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Correos captados</h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <a
                  key={f.key}
                  href={href({ tipo: f.key, page: 1 })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === f.key
                      ? "bg-violet-500 text-white"
                      : "border border-white/15 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {f.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <form action="/admin/origen#correos" method="get" role="search" className="relative">
                {filter !== "todos" && <input type="hidden" name="tipo" value={filter} />}
                {pageSize !== 25 && <input type="hidden" name="pageSize" value={pageSize} />}
                {(sort !== "fecha" || dir !== FIRST_DIR.fecha) && (
                  <>
                    <input type="hidden" name="sort" value={sort} />
                    <input type="hidden" name="dir" value={dir} />
                  </>
                )}
                <label htmlFor="origen-search" className="sr-only">
                  Buscar por nombre o correo
                </label>
                <input
                  id="origen-search"
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
                    {sorted.length} resultado{sorted.length === 1 ? "" : "s"} ·{" "}
                    <a href={href({ q: "", page: 1 })} className="text-violet-300 hover:underline">
                      Quitar búsqueda
                    </a>
                  </>
                ) : (
                  <>
                    {sorted.length} contacto{sorted.length === 1 ? "" : "s"}
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
                  {size} contactos
                </a>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  {sortHead("nombre", "Nombre")}
                  {sortHead("email", "Email")}
                  {sortHead("tipo", "Tipo")}
                  {sortHead("fuente", "Fuente")}
                  {sortHead("campana", "Campaña")}
                  {sortHead("contenido", "Contenido")}
                  {sortHead("dispositivo", "Dispositivo")}
                  {sortHead("fecha", "Fecha")}
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 text-white/80 last:border-0">
                    <td className="px-3 py-3 xl:px-4">{l.name}</td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">{l.email}</td>
                    <td className="px-3 py-3 xl:px-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${TRAFFIC_STYLE[l.type]}`}
                      >
                        {TRAFFIC_LABEL[l.type]}
                      </span>
                    </td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">{l.utm_source ?? "—"}</td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">{l.utm_campaign ?? "—"}</td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">{l.utm_content ?? "—"}</td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">
                      {isDevice(l.device) ? `${DEVICE_ICON[l.device]} ${DEVICE_LABEL[l.device]}` : "—"}
                    </td>
                    <td className="px-3 py-3 xl:px-4 text-white/60">
                      {new Date(l.created_at).toLocaleDateString("es")}
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && !error && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                      {q ? "Ningún correo coincide con la búsqueda." : "Todavía no hay correos captados con este filtro."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
