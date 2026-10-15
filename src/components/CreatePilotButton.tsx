"use client";

import { useState, useTransition } from "react";
import { adminCreatePilotAutomation } from "@/app/actions";
import type { PilotResult } from "@/lib/systemePilot";

// Botón del panel de admin: crea en Systeme.io el piloto de automatización
// (correo + regla para la etiqueta reto_completado) y muestra lo que se creó.
export default function CreatePilotButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PilotResult | null>(null);

  const run = () => {
    if (
      !window.confirm(
        "Esto creará en tu Systeme.io 1 correo y 1 regla (etiqueta reto_completado → enviar correo). No modifica nada existente. ¿Continuar?"
      )
    )
      return;
    setResult(null);
    startTransition(async () => {
      setResult(await adminCreatePilotAutomation());
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg border border-amber-300/40 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:opacity-60"
      >
        {pending ? "Creando en Systeme.io..." : "🧪 Crear piloto de automatización (reto_completado)"}
      </button>

      {result && (
        <div
          className={`max-w-xl rounded-lg px-3 py-2 text-xs leading-relaxed ${
            result.ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
          }`}
        >
          {result.ok ? (
            <>
              <p className="font-semibold">✅ Piloto listo en Systeme.io</p>
              <p>
                Correo #{result.emailId} {result.emailReused ? "(ya existía, se reutilizó)" : "(creado)"} · Regla #
                {result.ruleId} {result.ruleReused ? "(ya existía, no se duplicó)" : "(creada)"}
              </p>
              <p>
                Estado de la regla:{" "}
                {result.isActive === null || result.isActive === undefined
                  ? "revísalo en Systeme.io"
                  : result.isActive
                  ? "ACTIVA"
                  : "inactiva"}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">⚠️ No se pudo crear</p>
              <p className="break-all">{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
