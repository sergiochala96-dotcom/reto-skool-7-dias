"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminResetUserProgress } from "@/app/actions";

export default function ResetUserButton({
  userId,
  label,
}: {
  userId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      await adminResetUserProgress(userId);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-medium text-red-300 hover:underline"
      >
        Reiniciar usuario
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
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              ¿Estás seguro que quieres resetear la información de{" "}
              <span className="font-semibold text-white">{label}</span>? Esto puede
              conllevar a problemas o malos entendidos con este usuario.
            </p>
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
