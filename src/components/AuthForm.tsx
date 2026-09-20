"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/actions";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "registro";
};

export default function AuthForm({ action, mode }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {mode === "registro" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">
            Nombre
          </label>
          <input
            name="nombre"
            type="text"
            placeholder="Tu nombre"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-fuchsia-400"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="tucorreo@email.com"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-fuchsia-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-white/80">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-fuchsia-400"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {pending
          ? "Cargando..."
          : mode === "login"
          ? "Iniciar sesión"
          : "Crear cuenta"}
      </button>
    </form>
  );
}
