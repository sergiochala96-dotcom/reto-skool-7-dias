"use client";

import { useState, useTransition } from "react";
import { adminSendTestPush } from "@/app/actions";

// Manda un aviso de prueba a un dispositivo de la lista.
export default function TestPushButton({
  subscriptionId,
  compact = false,
}: {
  subscriptionId: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await adminSendTestPush(subscriptionId);
            setMsg(
              r.error
                ? { ok: false, text: r.error }
                : r.sent > 0
                  ? { ok: true, text: "✅ Enviado" }
                  : r.removed > 0
                    ? { ok: false, text: "Dispositivo ya inactivo: se eliminó de la lista" }
                    : { ok: false, text: `No se entregó (${r.detail ?? "sin detalle"})` }
            );
          })
        }
        className={`rounded-lg border border-white/20 font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-60 ${
          compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        }`}
      >
        {pending ? "Enviando..." : compact ? "Probar" : "Enviar prueba"}
      </button>
      {msg && <p className={`text-xs ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>{msg.text}</p>}
    </div>
  );
}
