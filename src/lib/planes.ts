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
  },
  {
    id: "premium",
    name: "Premium",
    price: "$5",
    currency: "USD",
    period: "/mes",
    tagline: "Sigue avanzando cuando el reto termina.",
    features: [
      "Acceso al reto de 7 días",
      "Recursos mensuales",
      "Desbloqueas todos los niveles siguientes después del reto de 7 días",
    ],
    cta: "Quiero el plan Premium",
    upgradeCta: "Actualizar a Premium",
    href: null, // TODO: enlace de pago de Creem
    badge: "Más popular",
  },
  {
    id: "vip",
    name: "VIP",
    price: "$25",
    currency: "USD",
    period: "/mes",
    tagline: "Acompañamiento cercano para avanzar más rápido.",
    features: [
      "Grupo de WhatsApp VIP de Skoolers",
      "Sesiones grupales en vivo de Skool",
      "1 sesión 1 a 1 al mes (30 minutos)",
    ],
    cta: "Quiero el plan VIP",
    upgradeCta: "Actualizar a VIP",
    href: null, // TODO: enlace de pago de Creem
  },
];
