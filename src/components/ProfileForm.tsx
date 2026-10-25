"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions";
import type { AuthState } from "@/app/actions";
import Avatar from "@/components/Avatar";

// Formulario de la página de perfil: foto (se cambia tocándola) y nombre. El correo está bloqueado.
export default function ProfileForm({
  nombre,
  email,
  avatarUrl,
}: {
  nombre: string;
  email: string;
  avatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(updateProfile, undefined);
  const saved = state !== undefined && !state.error && !pending;

  return (
    <div className="rounded-2xl border-2 border-white/10 bg-white/[0.04] p-6 sm:p-8">
      <div className="flex flex-col items-center">
        <Avatar avatarUrl={avatarUrl} nombre={nombre} size={112} editable />
        <p className="mt-3 text-sm text-white/55">Toca tu foto para cambiarla</p>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <div>
          <label htmlFor="perfil-nombre" className="mb-1.5 block text-sm font-bold text-white/80">
            Nombre
          </label>
          <input
            id="perfil-nombre"
            name="nombre"
            defaultValue={nombre}
            required
            maxLength={80}
            className="w-full rounded-xl border-2 border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
          />
        </div>

        <div>
          <label htmlFor="perfil-email" className="mb-1.5 block text-sm font-bold text-white/80">
            Correo
          </label>
          <input
            id="perfil-email"
            value={email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-white/50"
          />
          <p className="mt-1 text-xs text-white/40">
            El correo no se puede cambiar. Si necesitas ayuda, escríbenos a soporte.
          </p>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{state.error}</p>
        )}
        {saved && (
          <p className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">Guardado ✓</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl border-b-4 border-purple-900 bg-gradient-to-b from-fuchsia-500 to-purple-600 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-110 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
