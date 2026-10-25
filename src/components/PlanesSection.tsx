import Link from "next/link";
import { PLANS, PLAN_RANK, checkoutUrl, type Plan, type PlanId } from "@/lib/planes";

// Piezas de la sección de planes. Las usan la portada (/) y la pantalla interna del panel
// (/dashboard/planes), para que se vean con la misma identidad. Los estilos viven en
// src/app/ventas.css (clase .ventas en el contenedor).

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="oklch(0.86 0.11 215 / 0.18)" />
      <path
        d="m6 10.4 2.7 2.7L14.2 7.6"
        stroke="oklch(0.86 0.11 215)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Heading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="v-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        {title}
      </h2>
      {text && <p className="v-muted mt-4 text-pretty text-base leading-relaxed sm:text-lg">{text}</p>}
    </div>
  );
}

// current y userId: plan e id de la persona si tiene sesión; sin ellos es la portada pública.
function PlanCard({
  plan,
  current,
  userId,
}: {
  plan: Plan;
  current?: PlanId;
  userId?: string;
}) {
  const featured = Boolean(plan.badge);
  const isCurrent = current === plan.id;
  const isLower = current !== undefined && PLAN_RANK[plan.id] < PLAN_RANK[current];
  const badge = isCurrent ? "Tu plan" : plan.badge;
  // Con sesión, los planes de pago van al checkout con el id de la persona; sin sesión, primero
  // se crea la cuenta gratis (el plan queda ligado a ella).
  const internal = plan.href?.startsWith("/") ?? false;
  const needsAccount = Boolean(plan.href) && !internal && !userId;
  const href = !plan.href
    ? null
    : internal
      ? plan.href
      : userId
        ? checkoutUrl(plan.href, userId)
        : "/reto";
  return (
    <div
      className={`relative flex flex-col p-7 sm:p-8 ${
        featured ? "v-featured lg:-my-4 lg:py-11" : "v-glass"
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
            isCurrent
              ? "bg-[var(--cyan-300)] text-[var(--ink)]"
              : "bg-[var(--n-50)] text-[var(--ink)]"
          }`}
        >
          {badge}
        </span>
      )}
      <p className="v-eyebrow">{plan.name}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
        <span className="v-muted text-base">
          {plan.currency}
          {plan.period}
        </span>
      </p>
      <p className="v-muted mt-3 text-sm leading-relaxed">{plan.tagline}</p>

      <ul className="v-soft mt-6 flex flex-1 flex-col gap-3 text-sm leading-snug">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3">
            <Check />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <span aria-current="true" className="v-btn v-btn-current mt-8">
          ✓ Plan actual
        </span>
      ) : isLower ? null : href ? (
        <>
          <Link
            href={href}
            className={`v-btn mt-8 ${featured ? "v-btn-solid" : "v-btn-ghost"}`}
          >
            {current !== undefined ? (plan.upgradeCta ?? plan.cta) : plan.cta}
          </Link>
          {needsAccount && (
            <p className="v-muted mt-3 text-center text-xs">
              Crea tu cuenta gratis y mejora tu plan desde la app.
            </p>
          )}
        </>
      ) : (
        <span aria-disabled="true" className="v-btn v-btn-disabled mt-8">
          Próximamente
        </span>
      )}
    </div>
  );
}

export function PlansGrid({ current, userId }: { current?: PlanId; userId?: string }) {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} current={current} userId={userId} />
      ))}
    </div>
  );
}
