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

const FILTERS: { key: TrafficType | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "organico", label: "Orgánico" },
  { key: "pagado", label: "Anuncios" },
  { key: "otro", label: "Otro" },
  { key: "sin_etiqueta", label: "Sin etiqueta" },
];

export default async function OrigenPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  if (!admin) redirect("/dashboard");

  const { tipo } = await searchParams;
  const filter = FILTERS.some((f) => f.key === tipo) ? (tipo as TrafficType | "todos") : "todos";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, email, utm_source, utm_medium, utm_campaign, utm_content, referrer, device, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  const { data: profileDevices } = await supabase.from("profiles").select("last_device").limit(10000);

  const leads = ((data ?? []) as Lead[]).map((l) => ({ ...l, type: classifyTraffic(l.utm_medium) }));

  const counts: Record<TrafficType, number> = { pagado: 0, organico: 0, otro: 0, sin_etiqueta: 0 };
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

  const shown = leads.filter((l) => filter === "todos" || l.type === filter).slice(0, 200);

  const cards: { type: TrafficType; label: string }[] = [
    { type: "organico", label: "Orgánico" },
    { type: "pagado", label: "Anuncios" },
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

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
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

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Correos captados</h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <a
                  key={f.key}
                  href={f.key === "todos" ? "/admin/origen" : `/admin/origen?tipo=${f.key}`}
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

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-3 py-3 xl:px-4 font-medium">Nombre</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Email</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Tipo</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Fuente</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Campaña</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Contenido</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Dispositivo</th>
                  <th className="px-3 py-3 xl:px-4 font-medium">Fecha</th>
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
                      Todavía no hay correos captados con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {leads.length > shown.length && filter === "todos" && (
            <p className="mt-3 text-center text-xs text-white/40">
              Mostrando los últimos {shown.length} de {leads.length}.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
