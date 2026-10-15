// Origen del tráfico de los leads captados en /reto (etiquetas UTM del enlace).

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
};

export type TrafficType = "pagado" | "organico" | "otro" | "sin_etiqueta";

const PAID_MEDIUMS = ["paid", "cpc", "ppc", "ads", "ad", "paid_social", "paidsocial", "pagado", "pago"];
const ORGANIC_MEDIUMS = ["organic", "organico", "orgánico", "social", "manychat"];

// Pagado/orgánico según utm_medium. Sin etiquetas = el enlace no las traía.
export function classifyTraffic(medium?: string | null): TrafficType {
  const m = (medium ?? "").trim().toLowerCase();
  if (!m) return "sin_etiqueta";
  if (PAID_MEDIUMS.includes(m)) return "pagado";
  if (ORGANIC_MEDIUMS.includes(m)) return "organico";
  return "otro";
}

export const TRAFFIC_LABEL: Record<TrafficType, string> = {
  pagado: "Pagado",
  organico: "Orgánico",
  otro: "Otro",
  sin_etiqueta: "Sin etiqueta",
};

export const TRAFFIC_STYLE: Record<TrafficType, string> = {
  pagado: "bg-amber-400/20 text-amber-300",
  organico: "bg-emerald-400/20 text-emerald-300",
  otro: "bg-sky-400/20 text-sky-300",
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
