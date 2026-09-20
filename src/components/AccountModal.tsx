"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions";
import type { AuthState } from "@/app/actions";

export default function AccountModal({
  nombre,
  email,
  onClose,
}: {
  nombre: string;
  email: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updateProfile,
    undefined
  );
  const saved = state !== undefined && !state.error && !pending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a0b2e] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Mi cuenta</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">
              Nombre
            </label>
            <input
              name="nombre"
              defaultValue={nombre}
              required
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">
              Email
            </label>
            <input
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white/50"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          )}
          {saved && !state?.error && !pending && (
            <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">
              Guardado ✓
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
