"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upgradeMySubscription } from "@/app/actions";
import type { PlanId } from "@/lib/planes";

// Mejora de plan para quien YA paga (por ejemplo, de Premium a VIP): cambia la misma suscripción en
// Creem, sin crear un segundo cobro. Se cobra al momento la diferencia proporcional del período.
export default function UpgradePlanButton({
  plan,
  label,
  featured,
}: {
  plan: PlanId;
  label: string;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    const ok = window.confirm(
      "Tu plan cambiará ahora mismo y se te cobrará la diferencia proporcional del período en curso. Seguirás con una sola suscripción. ¿Continuar?"
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const r = await upgradeMySubscription(plan);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No se pudo cambiar el plan.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`v-btn mt-8 disabled:opacity-60 ${featured ? "v-btn-solid" : "v-btn-ghost"}`}
      >
        {pending ? "Cambiando tu plan..." : label}
      </button>
      {error && <p className="mt-3 text-center text-xs text-red-300">{error}</p>}
    </>
  );
}
