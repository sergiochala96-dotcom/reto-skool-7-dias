"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSetEpisode2Access } from "@/app/actions";

// Interruptor del panel de admin: da o quita el acceso al Episodio 2 a un usuario.
export default function Episode2AccessToggle({
  userId,
  enabled,
  label,
}: {
  userId: string;
  enabled: boolean;
  label: string;
}) {
  const [on, setOn] = useState(enabled);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    const next = !on;
    setOn(next); // se ve el cambio al instante
    startTransition(async () => {
      await adminSetEpisode2Access(userId, next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Acceso al Episodio 2 para ${label}`}
      onClick={toggle}
      disabled={isPending}
      title={on ? "Episodio 2 activo" : "Episodio 2 bloqueado"}
      className="flex items-center disabled:opacity-60"
    >
      <span
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
          on ? "bg-emerald-500" : "bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            on ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
