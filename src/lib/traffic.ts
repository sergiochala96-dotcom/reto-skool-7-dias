// Origen del tráfico de los leads captados en /reto (etiquetas UTM del enlace).

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
};

export type TrafficType = "pagado" | "organico" | "reto_skool" | "otro" | "sin_etiqueta";

const PAID_MEDIUMS = ["paid", "cpc", "ppc", "ads", "ad", "paid_social", "paidsocial", "pagado", "pago"];
const ORGANIC_MEDIUMS = ["organic", "organico", "orgánico", "social", "manychat"];

// Campaña de las personas que ya estaban en la comunidad de Skool y entraron al reto gratis.
export const RETO_SKOOL_CAMPAIGN = "reto-skool-gratis";

// Pagado/orgánico según utm_medium; la campaña "Reto-Skool-Gratis" tiene su propio tipo. Sin
// etiquetas = el enlace no las traía.
export function classifyTraffic(medium?: string | null, campaign?: string | null): TrafficType {
  if ((campaign ?? "").trim().toLowerCase() === RETO_SKOOL_CAMPAIGN) return "reto_skool";
  const m = (medium ?? "").trim().toLowerCase();
  if (!m) return "sin_etiqueta";
  if (PAID_MEDIUMS.includes(m)) return "pagado";
  if (ORGANIC_MEDIUMS.includes(m)) return "organico";
  return "otro";
}

export const TRAFFIC_LABEL: Record<TrafficType, string> = {
  pagado: "Anuncios",
  organico: "Orgánico",
  reto_skool: "Reto Skool",
  otro: "Otro",
  sin_etiqueta: "Sin etiqueta",
};

export const TRAFFIC_STYLE: Record<TrafficType, string> = {
  pagado: "bg-cyan-400/20 text-cyan-300",
  organico: "bg-emerald-400/20 text-emerald-300",
  reto_skool: "bg-orange-400/20 text-orange-300",
  otro: "bg-violet-400/20 text-violet-300",
  sin_etiqueta: "bg-white/10 text-white/50",
};

// Limpia y recorta los valores que vienen del navegador antes de guardarlos.
export function cleanAttribution(a?: Attribution): Attribution {
  const clean = (v?: string) => {
    const t = (v ?? "").trim().slice(0, 200);
    return t || undefined;
  };
  return {
    utm_source: clean(a?.utm_source),
    utm_medium: clean(a?.utm_medium),
    utm_campaign: clean(a?.utm_campaign),
    utm_content: clean(a?.utm_content),
    utm_term: clean(a?.utm_term),
    referrer: clean(a?.referrer),
  };
}
