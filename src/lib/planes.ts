// Planes de la página de ventas (/planes).
//
// Cuando los planes de pago estén creados en la procesadora (Creem), pega aquí el enlace de pago
// (checkout) de cada uno en `href`. Mientras sea null, el botón se muestra como "Próximamente".
// Dentro de la app, quien ya tiene sesión ve "Plan actual" en su plan y "Actualizar a ..." (con
// este mismo enlace) en los planes superiores.

export type PlanId = "standard" | "premium" | "vip";

export const PLAN_IDS: PlanId[] = ["standard", "premium", "vip"];

// Orden de menor a mayor, para saber qué es una mejora de plan.
export const PLAN_RANK: Record<PlanId, number> = { standard: 0, premium: 1, vip: 2 };

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as string[]).includes(value);
}

// Días de gracia después del fin del período pagado antes de volver a Standard (por si el aviso
// de renovación de Creem se demora).
const PLAN_GRACE_DAYS = 3;

// Plan que realmente tiene la persona: el guardado, salvo que su pago ya haya vencido.
// expiresAt null = sin vencimiento (plan dado a mano por el admin).
export function effectivePlan(plan: unknown, expiresAt: string | null | undefined): PlanId {
  if (!isPlanId(plan)) return "standard";
  if (plan !== "standard" && expiresAt) {
    const limit = new Date(expiresAt).getTime() + PLAN_GRACE_DAYS * 86_400_000;
    if (Number.isFinite(limit) && limit < Date.now()) return "standard";
  }
  return plan;
}

// Enlace de pago con el id de la persona, para que el aviso de Creem sepa a quién subirle el plan.
export function checkoutUrl(href: string, userId: string): string {
  const url = new URL(href);
  url.searchParams.set("metadata[user_id]", userId);
  return url.toString();
}

// Texto del botón del menú lateral según el plan de la persona.
export function sidebarPlanLabel(plan: PlanId): string {
  if (plan === "standard") return "Actualizar a Premium";
  if (plan === "premium") return "Actualizar a VIP";
  return "Mi plan VIP";
}

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  currency: string; // moneda de los precios, se muestra junto al monto
  period: string | null; // "/mes", o null si es gratis
  tagline: string;
  features: string[];
  cta: string; // texto del botón en la portada (sin sesión)
  upgradeCta?: string; // texto del botón dentro de la app para quien tiene un plan inferior
  href: string | null;
  // Ids del producto en Creem (el de prueba y, luego, el de producción): con ellos el aviso de
  // pago sabe qué plan se compró.
  creemProductIds: string[];
  badge?: string; // etiqueta destacada (ej: "Más popular")
};

export const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    price: "$0",
    currency: "USD",
    period: null,
    tagline: "Empieza gratis y crea tu Skool en 7 días.",
    features: [
      "Acceso al reto de 7 días",
      "Una misión guiada por día",
      "Prompts de IA listos para copiar",
      "Cofre del Tesoro al terminar",
    ],
    cta: "Empezar gratis",
    href: "/reto",
    creemProductIds: [],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$5",
    currency: "USD",
    period: "/mes",
    tagline: "Lleva tu Skool al siguiente nivel cuando el reto termina.",
    features: [
      "Acceso al reto de 7 días",
      "Acceso al Episodio 2: Escala tu Skool",
      "Recursos nuevos: prompts, estrategias antichurn y más",
    ],
    cta: "Quiero el plan Premium",
    upgradeCta: "Actualizar a Premium",
    // Enlace de PRUEBA (modo de prueba de Creem). Al aprobar la cuenta, cambiarlo por el de
    // producción y agregar su id a creemProductIds.
    href: "https://www.creem.io/test/payment/prod_7Nwh7z8GtdlVRhT2mJNuPv",
    creemProductIds: ["prod_7Nwh7z8GtdlVRhT2mJNuPv"],
    badge: "Más popular",
  },
  {
    id: "vip",
    name: "VIP",
    price: "$25",
    currency: "USD",
    period: "/mes",
    tagline: "Aprende en vivo y entra a la membresía de Skool.",
    features: [
      "Todo lo del plan Premium",
      "Clases en vivo semanales",
      "Acceso a la membresía de Skool de Neobrand Academy",
    ],
    cta: "Quiero el plan VIP",
    upgradeCta: "Actualizar a VIP",
    href: null, // TODO: enlace de pago de Creem
    creemProductIds: [],
  },
];

export function planFromCreemProduct(productId: string): PlanId | null {
  return PLANS.find((p) => p.creemProductIds.includes(productId))?.id ?? null;
}
