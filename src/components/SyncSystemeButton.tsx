"use client";

import { useState, useTransition } from "react";
import { adminSyncSysteme } from "@/app/actions";
import type { SyncResult } from "@/lib/syncSysteme";

// Botón del panel de admin: sincroniza ahora las etiquetas de avance e inactividad con
// Systeme.io y muestra qué pasó.
export default function SyncSystemeButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);

  const run = () => {
    setResult(null);
    startTransition(async () => {
      setResult(await adminSyncSysteme());
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        {pending ? "Sincronizando con Systeme.io..." : "🔄 Sincronizar etiquetas con Systeme.io"}
      </button>

      {result && (
        <div
          className={`max-w-xl rounded-lg px-3 py-2 text-xs leading-relaxed ${
            result.ok ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
          }`}
        >
          <p className="font-semibold">
            {result.ok ? "✅ Sincronización lista" : "⚠️ Terminó con errores"}
          </p>
          <p>
            Usuarios revisados: {result.total} · Actualizados: {result.updated} · Sin cambios:{" "}
            {result.unchanged} · Contactos creados en Systeme.io: {result.contactsCreated}
            {result.pending > 0 ? ` · Pendientes para la próxima: ${result.pending}` : ""}
          </p>
          {result.tagsCreated.length > 0 && (
            <p>Etiquetas creadas en Systeme.io: {result.tagsCreated.join(", ")}</p>
          )}
          {result.errors.map((e, i) => (
            <p key={i} className="break-all">
              • {e}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
