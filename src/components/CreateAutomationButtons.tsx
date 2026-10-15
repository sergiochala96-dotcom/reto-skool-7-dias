"use client";

import { useState, useTransition } from "react";
import { adminCreateAutomation, adminCreateCampaign, adminUpdateAutomationEmails } from "@/app/actions";
import type { AutomationResult } from "@/lib/systemeAutomations";
import type { CampaignResult } from "@/lib/systemeCampaigns";

type Option = {
  key: string;
  kind: "email" | "campaign";
  label: string;
  confirm: string;
};

const OPTIONS: Option[] = [
  {
    key: "completado",
    kind: "email",
    label: "reto_completado",
    confirm: "1 correo (felicitación) y 1 regla: al agregar la etiqueta reto_completado se envía ese correo.",
  },
  {
    key: "casi_listo",
    kind: "email",
    label: "reto_casi_listo",
    confirm: "1 correo (motivación para terminar) y 1 regla: al agregar la etiqueta reto_casi_listo se envía ese correo.",
  },
  {
    key: "sin_conexion",
    kind: "campaign",
    label: "sin_conexion (campaña)",
    confirm:
      "1 campaña con 3 correos (día 7, día 15 y día 30) y 2 reglas: al agregar la etiqueta sin_conexion se suscribe a la campaña, y al quitarla se cancela.",
  },
  {
    key: "sin_empezar",
    kind: "campaign",
    label: "reto_sin_empezar (campaña)",
    confirm:
      "1 campaña con 1 correo (1 día después) y 2 reglas: al agregar la etiqueta reto_sin_empezar se suscribe a la campaña, y al quitarla se cancela.",
  },
];

type Shown = { label: string; ok: boolean; lines: string[]; error?: string };

// Botones del panel de admin: crean en Systeme.io los correos, campañas y reglas de cada
// etiqueta y muestran lo que se creó. Solo crean cosas nuevas y es seguro repetirlos.
export default function CreateAutomationButtons() {
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<string | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);

  const run = (o: Option) => {
    if (
      !window.confirm(
        `Esto creará en tu Systeme.io: ${o.confirm} No modifica nada existente. ¿Continuar?`
      )
    )
      return;
    setShown(null);
    setRunning(o.key);
    startTransition(async () => {
      if (o.kind === "email") {
        const r: AutomationResult = await adminCreateAutomation(o.key);
        setShown({
          label: o.label,
          ok: r.ok,
          error: r.error,
          lines: r.ok
            ? [
                `Correo #${r.emailId} ${r.emailReused ? "(ya existía, se reutilizó)" : "(creado)"}`,
                `Regla #${r.ruleId} ${r.ruleReused ? "(ya existía, no se duplicó)" : "(creada)"}`,
                `Estado de la regla: ${
                  r.isActive === null || r.isActive === undefined
                    ? "revísalo en Systeme.io"
                    : r.isActive
                    ? "ACTIVA"
                    : "inactiva"
                }`,
              ]
            : [],
        });
      } else {
        const r: CampaignResult = await adminCreateCampaign(o.key);
        setShown({ label: o.label, ok: r.ok, error: r.error, lines: r.lines ?? [] });
      }
      setRunning(null);
    });
  };

  const updateEmails = () => {
    if (
      !window.confirm(
        "Esto ACTUALIZARÁ el asunto, la vista previa y el texto de los correos de reto_completado y reto_casi_listo en Systeme.io (versión sin workshop). Las reglas no cambian. ¿Continuar?"
      )
    )
      return;
    setShown(null);
    setRunning("update");
    startTransition(async () => {
      const r = await adminUpdateAutomationEmails();
      setShown({ label: "Actualizar correos", ok: r.ok, error: r.error, lines: r.lines });
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
            onClick={() => run(o)}
            disabled={pending}
            className="rounded-lg border border-amber-300/40 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:opacity-60"
          >
            {running === o.key ? "Creando..." : `🧪 ${o.label}`}
          </button>
        ))}
        <button
          type="button"
          onClick={updateEmails}
          disabled={pending}
          className="rounded-lg border border-sky-300/40 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/10 disabled:opacity-60"
        >
          {running === "update" ? "Actualizando..." : "✏️ Actualizar correos (sin workshop)"}
        </button>
      </div>

      {shown && (
        <div
          className={`max-w-xl rounded-lg px-3 py-2 text-xs leading-relaxed ${
            shown.ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
          }`}
        >
          <p className="font-semibold">
            {shown.ok ? "✅" : "⚠️"} {shown.label}: {shown.ok ? "listo en Systeme.io" : "no se pudo completar"}
          </p>
          {shown.lines.map((l, i) => (
            <p key={i}>• {l}</p>
          ))}
          {shown.error && <p className="break-all">{shown.error}</p>}
        </div>
      )}
    </div>
  );
}
