"use client";

import { useActionState, useEffect, useRef } from "react";
import { adminCreateNotification, type NotificationState } from "@/app/actions";

export default function NotificationForm() {
  const [state, formAction, pending] = useActionState<NotificationState, FormData>(
    adminCreateNotification,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Al enviarse bien, se limpia el formulario.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("¿Enviar esta notificación a TODOS los usuarios?")) e.preventDefault();
      }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
    >
      <label className="mb-1 block text-sm font-medium text-white/80" htmlFor="notif-title">
        Título
      </label>
      <input
        id="notif-title"
        name="title"
        type="text"
        required
        maxLength={120}
        placeholder="Ej: ¡Nueva clase disponible!"
        className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400"
      />

      <label className="mb-1 mt-4 block text-sm font-medium text-white/80" htmlFor="notif-body">
        Mensaje
      </label>
      <textarea
        id="notif-body"
        name="body"
        required
        rows={7}
        maxLength={5000}
        placeholder="Escribe el comunicado que verán todos los usuarios..."
        className="w-full resize-y rounded-xl border border-white/20 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400"
      />
      <p className="mt-1 text-xs text-white/40">
        Los enlaces (https://...) se convierten en clicables automáticamente.
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-white/5 px-3 py-3 text-sm text-white/80">
        <input
          type="checkbox"
          name="push"
          defaultChecked
          className="mt-0.5 h-4 w-4 shrink-0 accent-amber-400"
        />
        <span>
          Enviar también a la <strong>pantalla de bloqueo</strong> de quienes activaron los avisos
          <span className="block text-xs text-white/40">
            Se muestra el título y el inicio del mensaje; al tocarlo abren la app.
          </span>
        </span>
      </label>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200">
          ✅ Notificación enviada. Ya aparece en la campanita de todos los usuarios
          {state.pushed ? " y salió a la pantalla de bloqueo de quienes activaron los avisos." : "."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-black transition hover:bg-amber-300 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Enviando..." : "Enviar a todos los usuarios"}
      </button>
    </form>
  );
}
