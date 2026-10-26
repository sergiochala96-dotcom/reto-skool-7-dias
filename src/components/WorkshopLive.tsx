"use client";

import { useEffect, useState } from "react";
import { WORKSHOP_START, WORKSHOP_URL } from "@/lib/captacion";
import { trackEvent } from "@/lib/metaPixel";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Cuenta regresiva hasta el inicio del workshop (cuadros con números grandes).
export function WorkshopCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(WORKSHOP_START).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (remaining === null) return <div className="h-[5.5rem]" aria-hidden="true" />;

  if (remaining <= 0) {
    return (
      <p className="rounded-2xl bg-red-500/15 px-4 py-4 text-center text-base font-extrabold text-red-200">
        🔴 ¡El workshop ya empezó!
      </p>
    );
  }

  const total = Math.floor(remaining / 1000);
  const units = [
    { value: Math.floor(total / 86400), label: "días" },
    { value: Math.floor((total % 86400) / 3600), label: "horas" },
    { value: Math.floor((total % 3600) / 60), label: "min" },
    { value: total % 60, label: "seg" },
  ];

  return (
    <div role="timer" aria-label="Tiempo que falta para el workshop">
      <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-white/50">
        El workshop empieza en
      </p>
      <div className="flex items-center justify-center gap-2.5">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex min-w-[4.2rem] flex-col items-center rounded-2xl bg-black/60 px-2 py-3 ring-1 ring-white/10"
          >
            <span className="text-3xl font-extrabold leading-none tabular-nums text-white">{pad(u.value)}</span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Botón de compra del workshop (registra el evento de inicio de compra).
export function WorkshopCta() {
  return (
    <a
      href={WORKSHOP_URL}
      onClick={() => trackEvent("InitiateCheckout", { content_name: "Workshop EN VIVO" })}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full animate-[amberPulse_1.8s_ease-in-out_infinite] rounded-2xl bg-amber-400 px-6 py-4 text-center text-base font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 motion-reduce:animate-none sm:text-lg"
    >
      Quiero unirme al workshop en vivo
    </a>
  );
}
