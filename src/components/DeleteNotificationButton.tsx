"use client";

import { adminDeleteNotification } from "@/app/actions";

export default function DeleteNotificationButton({ id }: { id: string }) {
  return (
    <form
      action={adminDeleteNotification.bind(null, id)}
      onSubmit={(e) => {
        if (!window.confirm("¿Borrar esta notificación? Dejará de verse para todos los usuarios.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
      >
        Borrar
      </button>
    </form>
  );
}
