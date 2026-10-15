"use client";

import { useState, useTransition } from "react";
import { adminApplyEmailTexts } from "@/app/actions";

type Shown = { ok: boolean; lines: string[]; error?: string };

// Botón del panel de admin: aplica en Systeme.io el texto actual de los 6 correos automáticos
// (los textos viven en el código de la app y se cambian a través de Claude).
export default function ApplyEmailTextsButton() {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useState<Shown | null>(null);

  const run = () => {
    if (
      !window.confirm(
        "Esto REEMPLAZA el asunto, la vista previa y el texto de los 6 correos automáticos en Systeme.io (2 correos sueltos y 4 pasos de campañas) por los que están en la app.\n\nSi cambiaste algo a mano en Systeme.io, se perderá.\n\nLas reglas, las esperas y las etiquetas NO cambian. ¿Continuar?"
      )
    )
      return;
    setShown(null);
    startTransition(async () => {
      setShown(await adminApplyEmailTexts());
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg border border-sky-300/40 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/10 disabled:opacity-60"
      >
        {pending ? "Aplicando textos..." : "✏️ Aplicar textos de correos a Systeme.io"}
      </button>

      {shown && (
        <div
          className={`max-w-xl rounded-lg px-3 py-2 text-xs leading-relaxed ${
            shown.ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
          }`}
        >
          <p className="font-semibold">
            {shown.ok ? "✅ Textos aplicados en Systeme.io" : "⚠️ Terminó con errores"}
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
