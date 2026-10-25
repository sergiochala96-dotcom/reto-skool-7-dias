"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAvatarIcon } from "@/app/actions";

// Botón de un icono ya canjeado: lo pone como foto de perfil (o muestra que ya está en uso).
export default function UseAvatarButton({ itemId, inUse }: { itemId: string; inUse: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (inUse) {
    return (
      <p className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-emerald-300">
        ✓ En uso como tu foto
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const r = await setAvatarIcon(itemId);
            if (r.ok) router.refresh();
            else setError(r.error ?? "No se pudo cambiar tu foto.");
          });
        }}
        className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
      >
        {pending ? "Cambiando..." : "Usar como mi foto"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}
    </div>
  );
}
