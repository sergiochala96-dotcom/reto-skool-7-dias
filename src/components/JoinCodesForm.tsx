"use client";

import { useActionState } from "react";
import { adminSaveJoinCodes, type JoinCodesState } from "@/app/actions";

// Panel de admin: los códigos que las personas escriben para ganar sus 50 monedas. Hay que
// publicar cada código dentro de su grupo (mensaje fijado en WhatsApp, publicación fijada en Skool).
export default function JoinCodesForm({ whatsapp, skool }: { whatsapp: string; skool: string }) {
  const [state, formAction, pending] = useActionState<JoinCodesState, FormData>(
    adminSaveJoinCodes,
    undefined
  );

  const field = (name: string, label: string, hint: string, value: string) => (
    <div>
      <label htmlFor={`code-${name}`} className="mb-1 block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        id={`code-${name}`}
        name={name}
        defaultValue={value}
        maxLength={40}
        autoComplete="off"
        placeholder="Ej: SKOOLY-ORO-1"
        className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 font-mono text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400"
      />
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );

  return (
    <form action={formAction} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-white">🪙 Códigos de las comunidades</h2>
      <p className="mt-1 text-sm text-white/60">
        Quien se une escribe el código para ganar <strong>50 monedas de oro</strong>. Publícalo
        dentro de cada grupo (no lo compartas fuera) y cámbialo cuando quieras. Sin código, esa
        recompensa no se puede canjear.
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {field("whatsapp", "Código de la comunidad de WhatsApp", "Publícalo como mensaje fijado en el canal.", whatsapp)}
        {field("skool", "Código del curso en Skool", "Publícalo como publicación fijada de la comunidad.", skool)}
      </div>
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">
          ✅ Códigos guardados.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-black transition hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar códigos"}
      </button>
    </form>
  );
}
