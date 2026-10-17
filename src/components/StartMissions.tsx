"use client";

import { useState, useTransition, type CSSProperties } from "react";
import confetti from "canvas-confetti";
import { completeStartMission } from "@/app/actions";
import CourseIcon from "@/components/CourseIcon";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { SKOOL_COMMUNITY_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";
import { playVictoryFanfare } from "@/lib/successSound";

type Kind = "skool" | "whatsapp";
type Done = { skool: boolean; whatsapp: boolean };

function celebrate() {
  playVictoryFanfare();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({
    particleCount: 110,
    spread: 85,
    origin: { y: 0.35 },
    colors: ["#7e22ce", "#c026d3", "#f59e0b", "#facc15", "#10b981", "#25D366"],
  });
}

// Destello que titila en la esquina de una misión pendiente.
function Sparkle({ className, delay }: { className: string; delay: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute text-sm text-amber-200 motion-reduce:hidden ${className}`}
      style={{ animation: `twinkle 1.6s ease-in-out ${delay} infinite` }}
    >
      ✦
    </span>
  );
}

// En celular cada misión es una columna (icono arriba, texto abajo); desde pantallas medianas
// es una fila (icono a la izquierda, texto a la derecha) para que la tarjeta quede alargada.
const TILE =
  "group flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition hover:bg-white/5 md:flex-row md:gap-4 md:px-4 md:text-left";
const CIRCLE =
  "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition duration-300 group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]";

// Las dos misiones de inicio del dashboard: unirse al boletín de WhatsApp y al curso en Skool.
// Las ve TODO el mundo y no desaparecen al completarlas (ni siquiera al terminar el reto): la
// idea es que cualquiera pueda entrar a las comunidades cuando quiera. No cierran ningún día.
// Cada botón abre el enlace en otra pestaña y marca la misión como hecha (desde aquí no se
// puede comprobar que la persona haya entrado, así que es de avance, no de prueba).
// Lo que ya venga marcado del servidor (por ejemplo, desde los botones del menú lateral)
// también cuenta.
export default function StartMissions({ initial }: { initial: Done }) {
  const [local, setLocal] = useState<Done>({ skool: false, whatsapp: false });
  const [, startTransition] = useTransition();

  const done: Done = {
    skool: initial.skool || local.skool,
    whatsapp: initial.whatsapp || local.whatsapp,
  };
  const both = done.skool && done.whatsapp;

  function mark(kind: Kind) {
    if (done[kind]) return;
    setLocal((l) => ({ ...l, [kind]: true }));
    startTransition(() => completeStartMission(kind));
    const other: Kind = kind === "skool" ? "whatsapp" : "skool";
    if (done[other]) celebrate();
  }

  const glow = (rgba: string) => ({ "--glow": rgba }) as CSSProperties;
  const pulse = "animate-[glowPulse_1.9s_ease-in-out_infinite] motion-reduce:animate-none";

  const badge = (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1f0d3d] bg-emerald-500 text-xs font-extrabold text-white shadow-lg"
    >
      ✓
    </span>
  );

  return (
    <section className="mx-auto mb-5 w-full max-w-md rounded-3xl border-2 border-fuchsia-400/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] px-4 py-4 text-center shadow-2xl shadow-fuchsia-900/40 md:mb-6 md:max-w-4xl md:px-6 md:py-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
        Primeras misiones
      </p>
      <p className="mt-0.5 text-sm text-white/70 md:text-base">
        Únete a nuestras comunidades y no te pierdas nada del reto
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:gap-4">
        {/* Misión 1: boletín de WhatsApp */}
        <a
          href={WHATSAPP_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => mark("whatsapp")}
          className={TILE}
        >
          <span
            style={glow("rgba(37,211,102,0.6)")}
            className={`${CIRCLE} bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 ${
              done.whatsapp ? "" : pulse
            }`}
          >
            <svg viewBox="0 0 32 32" fill="currentColor" className="h-9 w-9" aria-hidden="true">
              <path d={WHATSAPP_PATH} />
            </svg>
            {done.whatsapp ? badge : <Sparkle className="-right-1 -top-1" delay="0s" />}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-sm font-bold leading-tight text-white md:text-base">
              Únete al boletín en WhatsApp
            </span>
            <span
              className={`text-xs font-bold md:text-sm ${
                done.whatsapp ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {done.whatsapp ? "Ya estás dentro ✓" : "Unirme gratis →"}
            </span>
          </span>
        </a>

        {/* Misión 2: curso en Skool */}
        <a
          href={SKOOL_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => mark("skool")}
          className={TILE}
        >
          <span
            style={glow("rgba(251,191,36,0.6)")}
            className={`${CIRCLE} bg-gradient-to-br from-amber-300 to-orange-500 text-purple-950 shadow-lg shadow-amber-400/30 ${
              done.skool ? "" : pulse
            }`}
          >
            <CourseIcon className="h-9 w-9" />
            {done.skool ? badge : <Sparkle className="-left-1 -top-1" delay="0.5s" />}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-sm font-bold leading-tight text-white md:text-base">
              Únete al curso en Skool
            </span>
            <span
              className={`text-xs font-bold md:text-sm ${
                done.skool ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {done.skool ? "Ya estás dentro ✓" : "Unirme gratis →"}
            </span>
          </span>
        </a>
      </div>

      {both && (
        <p className="mt-2 text-xs font-semibold text-emerald-300 md:text-sm">
          🎉 ¡Listo! Ya estás en las dos comunidades
        </p>
      )}
    </section>
  );
}
