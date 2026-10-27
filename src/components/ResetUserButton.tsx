"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminResetUserProgress } from "@/app/actions";

// Icono de reinicio (flecha circular). También se usa en el encabezado de la columna.
export function ResetIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function ResetUserButton({
  userId,
  label,
}: {
  userId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const r = await adminResetUserProgress(userId);
      if (!r.ok) {
        setError(r.error ?? "No se pudo resetear.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Reiniciar usuario"
        aria-label={`Reiniciar usuario ${label}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
      >
        <ResetIcon className="h-[1.125rem] w-[1.125rem]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1f0f38] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-lg font-bold text-white">Resetear usuario</h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-white/70">
              ¿Estás seguro que quieres resetear la información de{" "}
              <span className="font-semibold text-white">{label}</span>? Esto puede
              conllevar a problemas o malos entendidos con este usuario.
            </p>
            <p className="mb-6 text-xs leading-relaxed text-white/50">
              La cuenta queda como recién creada: se borran el progreso, las respuestas, las trivias, las
              monedas y los canjes, vuelve a ver la guía de inicio, tiene 0 monedas y 3 vidas, sin foto, y
              su plan vuelve a Standard. Se conservan el correo, el nombre y la contraseña.
            </p>
            {error && <p className="mb-4 text-sm font-semibold text-red-300">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-base font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 disabled:opacity-50"
              >
                {isPending ? "Reseteando…" : "Sí, resetear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
