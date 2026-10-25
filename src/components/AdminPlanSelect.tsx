"use client";

import { useState, useTransition } from "react";
import { adminSetPlan } from "@/app/actions";
import { PLAN_IDS, type PlanId } from "@/lib/planes";

const LABEL: Record<PlanId, string> = { standard: "Standard (gratis)", premium: "Premium", vip: "VIP" };

// Panel de admin: cambia a mano el plan de una persona (por ejemplo, si pagó por fuera de Creem).
export default function AdminPlanSelect({ userId, plan }: { userId: string; plan: PlanId }) {
  const [value, setValue] = useState<PlanId>(plan);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <label className="text-sm text-white/60" htmlFor="admin-plan">
        Plan
      </label>
      <select
        id="admin-plan"
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as PlanId;
          const prev = value;
          setValue(next);
          setMsg(null);
          startTransition(async () => {
            const r = await adminSetPlan(userId, next);
            if (!r.ok) setValue(prev);
            setMsg(r.ok ? { ok: true, text: "✅ Plan actualizado" } : { ok: false, text: r.error ?? "No se pudo cambiar" });
          });
        }}
        className="rounded-lg border border-white/20 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 disabled:opacity-60"
      >
        {PLAN_IDS.map((id) => (
          <option key={id} value={id}>
            {LABEL[id]}
          </option>
        ))}
      </select>
      {msg && <span className={`text-xs ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>{msg.text}</span>}
    </div>
  );
}
