"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { completeStartMission } from "@/app/actions";
import { SKOOL_COMMUNITY_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";
import { playVictoryFanfare } from "@/lib/successSound";

type Kind = "skool" | "whatsapp";

// En celular solo se muestra el nombre corto; desde pantallas medianas se antepone "Únete a".
const MISSIONS: { kind: Kind; name: string; extra?: string; href: string }[] = [
  { kind: "whatsapp", name: "WhatsApp", href: WHATSAPP_COMMUNITY_URL },
  { kind: "skool", name: "Skool", extra: " gratis", href: SKOOL_COMMUNITY_URL },
];

function celebrate() {
  playVictoryFanfare();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.3 },
    colors: ["#7e22ce", "#c026d3", "#f59e0b", "#facc15", "#10b981"],
  });
}

// Misiones iniciales (franja discreta): unirse a WhatsApp y al Skool. A quien aún no empieza
// el reto, al completar las dos se le abre el Día 1; a quien ya lo empezó solo se le invita.
// Cada botón abre el enlace en otra pestaña y marca la misión como hecha (desde aquí no se
// puede comprobar que la persona haya entrado, así que es de avance, no de prueba).
export default function StartMissions({
  initial,
  startUnlocked,
}: {
  initial: { skool: boolean; whatsapp: boolean };
  startUnlocked: boolean;
}) {
  // Se recuerda cómo llegó la persona: aunque el servidor desbloquee el Día 1 mientras tanto,
  // la franja sigue en pantalla para mostrar la celebración.
  const [gatesDay1] = useState(!startUnlocked);
  const [visible, setVisible] = useState(!(initial.skool && initial.whatsapp));
  const [done, setDone] = useState(initial);
  const [, startTransition] = useTransition();

  if (!visible) return null;

  const count = Number(done.skool) + Number(done.whatsapp);
  const allDone = count === 2;

  function mark(kind: Kind) {
    if (done[kind]) return;
    const next = { ...done, [kind]: true };
    setDone(next);
    startTransition(() => completeStartMission(kind));
    if (next.skool && next.whatsapp) celebrate();
  }

  const box =
    "mx-auto mb-4 w-full max-w-2xl rounded-2xl border border-amber-300/30 bg-white/5 px-3 py-2 md:mb-5 md:max-w-3xl";

  if (allDone) {
    return (
      <section className={`${box} flex flex-wrap items-center justify-between gap-2`}>
        <p className="text-sm font-bold text-white">
          {gatesDay1 ? "🎉 ¡Día 1 desbloqueado!" : "🎉 ¡Gracias por unirte!"}
        </p>
        <div className="flex items-center gap-2">
          {gatesDay1 && (
            <Link
              href="/dia/1"
              className="rounded-lg bg-amber-400 px-4 py-1.5 text-sm font-extrabold text-black transition hover:bg-amber-300"
            >
              Empezar el Día 1 →
            </Link>
          )}
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Cerrar"
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={box}>
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
          {gatesDay1 ? "Antes del Día 1" : "Únete a nuestras comunidades"}
        </p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white">
          {count}/2
        </span>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={2}
          aria-valuenow={count}
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-500"
            style={{ width: `${(count / 2) * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-2">
        {MISSIONS.map((m, i) => {
          const isDone = done[m.kind];
          return (
            <li key={m.kind}>
              <a
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => mark(m.kind)}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition sm:px-3 ${
                  isDone
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    isDone ? "bg-emerald-500 text-white" : "bg-fuchsia-500/30 text-fuchsia-100"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex-1 text-[13px] font-semibold leading-tight text-white sm:text-sm">
                  <span className="hidden sm:inline">Únete a </span>
                  {m.name}
                  {m.extra && <span className="hidden sm:inline">{m.extra}</span>}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold ${
                    isDone ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {isDone ? (
                    <span className="hidden sm:inline">Listo</span>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Unirme </span>→
                    </>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
