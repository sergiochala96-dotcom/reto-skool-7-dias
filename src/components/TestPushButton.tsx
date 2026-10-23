"use client";

import { useState, useTransition } from "react";
import { adminSendTestPush } from "@/app/actions";

// Manda un aviso de prueba a los dispositivos del propio admin.
export default function TestPushButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await adminSendTestPush();
            setMsg(
              r.error
                ? { ok: false, text: r.error }
                : r.sent > 0
                  ? { ok: true, text: `✅ Enviado a ${r.sent} dispositivo${r.sent === 1 ? "" : "s"}. Mira tu pantalla de bloqueo.` }
                  : { ok: false, text: "No se pudo entregar. Revisa que el aviso no esté bloqueado en tu dispositivo." }
            );
          })
        }
        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Enviarme un aviso de prueba"}
      </button>
      {msg && (
        <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>{msg.text}</p>
      )}
    </div>
  );
}
