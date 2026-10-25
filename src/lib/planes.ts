// Planes de la página de ventas (/planes).
//
// Cuando los planes de pago estén creados en la procesadora (Creem), pega aquí el enlace de pago
// de cada uno en `href`. Mientras sea null, el botón se muestra como "Próximamente".

export type Plan = {
  id: "standard" | "premium" | "vip";
  name: string;
  price: string;
  period: string | null; // "/mes", o null si es gratis
  tagline: string;
  features: string[];
  cta: string;
  href: string | null;
  badge?: string; // etiqueta destacada (ej: "Más popular")
};

export const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    price: "$0",
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
    period: "/mes",
    tagline: "Sigue avanzando cuando el reto termina.",
    features: [
      "Acceso al reto de 7 días",
      "Recursos mensuales",
      "Desbloqueas todos los niveles siguientes después del reto de 7 días",
    ],
    cta: "Quiero el plan Premium",
    href: null, // TODO: enlace de pago de Creem
    badge: "Más popular",
  },
  {
    id: "vip",
    name: "VIP",
    price: "$25",
    period: "/mes",
    tagline: "Acompañamiento cercano para avanzar más rápido.",
    features: [
      "Grupo de WhatsApp VIP de Skoolers",
      "Sesiones grupales en vivo de Skool",
      "1 sesión 1 a 1 al mes (30 minutos)",
    ],
    cta: "Quiero el plan VIP",
    href: null, // TODO: enlace de pago de Creem
  },
];
