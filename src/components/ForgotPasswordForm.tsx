"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ResetState } from "@/app/actions";

const INPUT =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-violet-400";

export default function ForgotPasswordForm({ expiredLink = false }: { expiredLink?: boolean }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    requestPasswordReset,
    undefined
  );

  if (state?.sent) {
    return (
      <div className="rounded-xl bg-emerald-500/15 px-4 py-4 text-sm leading-relaxed text-emerald-100">
        <p className="font-semibold">Listo, revisa tu correo 📬</p>
        <p className="mt-1">
          Si ese correo tiene cuenta, te enviamos un enlace para elegir tu contraseña nueva.
          Ábrelo en este mismo navegador. Si no lo ves, revisa Promociones o Spam.
        </p>
        <p className="mt-2 text-emerald-100/80">
          ¿Te registraste con Google? Entra con el botón &quot;Continuar con Google&quot;, no
          necesitas contraseña.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {expiredLink && !state?.error && (
        <p className="rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-100">
          Ese enlace venció o se abrió en otro navegador. Pide uno nuevo y ábrelo en el mismo
          navegador donde lo pediste.
        </p>
      )}

      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tucorreo@email.com"
          className={INPUT}
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white shadow-lg shadow-black/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Enviarme el enlace"}
      </button>
    </form>
  );
}
