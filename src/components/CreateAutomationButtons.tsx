"use client";

import { useState, useTransition } from "react";
import { adminCreateAutomation } from "@/app/actions";
import type { AutomationResult } from "@/lib/systemeAutomations";

const OPTIONS = [
  { key: "completado", label: "reto_completado", note: "felicitación + workshop" },
  { key: "casi_listo", label: "reto_casi_listo", note: "motivación para terminar" },
];

// Botones del panel de admin: crean en Systeme.io el correo y la regla de cada etiqueta
// (etiqueta agregada -> enviar correo) y muestran lo que se creó. Es seguro repetirlos.
export default function CreateAutomationButtons() {
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; data: AutomationResult } | null>(null);

  const run = (key: string, label: string, note: string) => {
    if (
      !window.confirm(
        `Esto creará en tu Systeme.io 1 correo (${note}) y 1 regla: cuando se agregue la etiqueta ${label}, se enviará ese correo. No modifica nada existente. ¿Continuar?`
      )
    )
      return;
    setResult(null);
    setRunning(key);
    startTransition(async () => {
      const data = await adminCreateAutomation(key);
      setResult({ label, data });
      setRunning(null);
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => run(o.key, o.label, o.note)}
            disabled={pending}
            className="rounded-lg border border-amber-300/40 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:opacity-60"
          >
            {running === o.key ? "Creando..." : `🧪 Automatización ${o.label}`}
          </button>
        ))}
      </div>

      {result && (
        <div
          className={`max-w-xl rounded-lg px-3 py-2 text-xs leading-relaxed ${
            result.data.ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
          }`}
        >
          {result.data.ok ? (
            <>
              <p className="font-semibold">✅ {result.label}: listo en Systeme.io</p>
              <p>
                Correo #{result.data.emailId} {result.data.emailReused ? "(ya existía, se reutilizó)" : "(creado)"} ·
                Regla #{result.data.ruleId} {result.data.ruleReused ? "(ya existía, no se duplicó)" : "(creada)"}
              </p>
              <p>
                Estado de la regla:{" "}
                {result.data.isActive === null || result.data.isActive === undefined
                  ? "revísalo en Systeme.io"
                  : result.data.isActive
                  ? "ACTIVA"
                  : "inactiva"}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">⚠️ {result.label}: no se pudo crear</p>
              <p className="break-all">{result.data.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
