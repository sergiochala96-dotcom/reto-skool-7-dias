"use client";

import { useState, useTransition, type CSSProperties } from "react";
import confetti from "canvas-confetti";
import { completeStartMission } from "@/app/actions";
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

// Icono de reproductor de curso: pantalla con el botón de play.
function CourseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="14" rx="3" />
      <path d="M10 8.2v5.6l4.8-2.8z" fill="currentColor" />
      <path d="M8 21h8" />
    </svg>
  );
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

const TILE =
  "group flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition hover:bg-white/5";
const CIRCLE =
  "relative flex h-16 w-16 items-center justify-center rounded-full transition duration-300 group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]";

// Las dos misiones de inicio del dashboard: unirse al boletín de WhatsApp y al curso en Skool.
// Las ve TODO el mundo y no desaparecen al completarlas (ni siquiera al terminar el reto): la
// idea es que cualquiera pueda entrar a las comunidades cuando quiera. No cierran ningún día.
// Cada botón abre el enlace en otra pestaña y marca la misión como hecha (desde aquí no se
// puede comprobar que la persona haya entrado, así que es de avance, no de prueba).
export default function StartMissions({ initial }: { initial: Done }) {
  const [done, setDone] = useState(initial);
  const [, startTransition] = useTransition();

  const both = done.skool && done.whatsapp;

  function mark(kind: Kind) {
    if (done[kind]) return;
    const next = { ...done, [kind]: true };
    setDone(next);
    startTransition(() => completeStartMission(kind));
    if (next.skool && next.whatsapp) celebrate();
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
    <section className="mx-auto mb-5 w-full max-w-md rounded-3xl border-2 border-fuchsia-400/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] px-4 py-4 text-center shadow-2xl shadow-fuchsia-900/40 md:mb-6">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
        Primeras misiones
      </p>
      <p className="mt-0.5 text-sm text-white/70 md:text-base">
        Únete a nuestras comunidades y no te pierdas nada del reto
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
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
          <span className="text-sm font-bold leading-tight text-white">
            Únete al boletín en WhatsApp
          </span>
          <span
            className={`text-xs font-bold ${done.whatsapp ? "text-emerald-300" : "text-amber-300"}`}
          >
            {done.whatsapp ? "Ya estás dentro ✓" : "Unirme →"}
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
          <span className="text-sm font-bold leading-tight text-white">
            Únete al curso en Skool
          </span>
          <span className={`text-xs font-bold ${done.skool ? "text-emerald-300" : "text-amber-300"}`}>
            {done.skool ? "Ya estás dentro ✓" : "Unirme →"}
          </span>
        </a>
      </div>

      {both && (
        <p className="mt-2 text-xs font-semibold text-emerald-300">
          🎉 ¡Listo! Ya estás en las dos comunidades
        </p>
      )}
    </section>
  );
}
