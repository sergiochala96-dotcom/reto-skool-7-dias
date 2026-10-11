"use client";

import { useEffect, useState } from "react";

const START_SECONDS = 15 * 60 + 59; // 0 h : 15 min : 59 s
const STORAGE_KEY = "reto_countdown_end";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Cuenta regresiva con el mismo tiempo de partida para cada visitante. Guardamos
// la hora de fin en sessionStorage para que recargar la página no la reinicie.
function getEnd(): number {
  try {
    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    if (saved > 0) return saved;
    const end = Date.now() + START_SECONDS * 1000;
    sessionStorage.setItem(STORAGE_KEY, String(end));
    return end;
  } catch {
    return Date.now() + START_SECONDS * 1000;
  }
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[3.25rem] flex-col items-center rounded-lg bg-black px-2 py-1 sm:min-w-[4rem] sm:px-3 sm:py-1.5">
      <span className="text-xl font-extrabold leading-none tabular-nums text-amber-300 sm:text-2xl">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
        {label}
      </span>
    </div>
  );
}

export default function CountdownBanner() {
  const [seconds, setSeconds] = useState(START_SECONDS);

  useEffect(() => {
    const end = getEnd();
    const tick = () => setSeconds(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <a
      href="#reserva"
      className="block bg-amber-400 px-4 py-3 text-black transition hover:bg-amber-300"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-5">
        <p className="text-sm font-extrabold leading-snug sm:text-base">
          🔥 Regístrate totalmente gratis a nuestra app por tiempo limitado
        </p>
        <div
          className="flex items-center gap-1.5"
          role="timer"
          aria-label={`Quedan ${h} horas, ${m} minutos y ${s} segundos`}
        >
          <Unit value={pad(h)} label="horas" />
          <span className="pb-3 text-xl font-extrabold">:</span>
          <Unit value={pad(m)} label="min" />
          <span className="pb-3 text-xl font-extrabold">:</span>
          <Unit value={pad(s)} label="seg" />
        </div>
      </div>
    </a>
  );
}
