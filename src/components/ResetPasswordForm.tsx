"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions";

const INPUT =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-fuchsia-400";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-white/80">
          Contraseña nueva
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          className={INPUT}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-white/80">
          Repite la contraseña
        </label>
        <input
          id="confirm-password"
          name="confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
          className={INPUT}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar y entrar"}
      </button>
    </form>
  );
}
