"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { completeStartMission } from "@/app/actions";
import { SKOOL_COMMUNITY_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";
import { playVictoryFanfare } from "@/lib/successSound";

type Kind = "skool" | "whatsapp";

const MISSIONS: { kind: Kind; title: string; text: string; button: string; href: string }[] = [
  {
    kind: "skool",
    title: "Únete gratis a nuestra comunidad en Skool",
    text: "Entra a la comunidad gratuita para seguir el reto desde ahí.",
    button: "Unirme a Skool",
    href: SKOOL_COMMUNITY_URL,
  },
  {
    kind: "whatsapp",
    title: "Únete a la comunidad de WhatsApp",
    text: "Recibe los avisos y novedades del reto.",
    button: "Unirme a WhatsApp",
    href: WHATSAPP_COMMUNITY_URL,
  },
];

function celebrate() {
  playVictoryFanfare();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.4 },
    colors: ["#7e22ce", "#c026d3", "#f59e0b", "#facc15", "#10b981"],
  });
}

// Misiones iniciales: unirse al Skool y a WhatsApp. Al completar las dos se abre el Día 1.
// Cada botón abre el enlace en otra pestaña y marca la misión como hecha (desde aquí no se
// puede comprobar que la persona haya entrado, así que es de avance, no de prueba).
export default function StartMissions({
  initial,
  startUnlocked,
}: {
  initial: { skool: boolean; whatsapp: boolean };
  startUnlocked: boolean;
}) {
  // Solo se muestra a quien llegó con el Día 1 aún bloqueado. Se queda visible en esta
  // sesión aunque el servidor ya lo desbloquee, para que se vea la celebración.
  const [visible, setVisible] = useState(!startUnlocked);
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

  return (
    <section className="mx-auto mb-6 w-full max-w-2xl rounded-3xl border-2 border-amber-300/40 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] p-5 shadow-2xl shadow-fuchsia-900/30 md:mb-8 md:max-w-3xl md:p-7">
      {allDone ? (
        <div className="text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-2 text-xl font-extrabold text-white md:text-2xl">
            ¡Listo! Desbloqueaste el Día 1
          </h2>
          <p className="mt-1 text-sm text-white/60 md:text-base">
            Ya estás dentro de las dos comunidades. Ahora sí, a crear tu Skool.
          </p>
          <Link
            href="/dia/1"
            className="mt-4 inline-block rounded-xl bg-amber-400 px-6 py-3 text-base font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300"
          >
            Empezar el Día 1 →
          </Link>
          <div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="mt-3 text-xs text-white/40 underline hover:text-white/70"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
                Antes del Día 1
              </p>
              <h2 className="text-lg font-extrabold text-white md:text-2xl">
                Completa estas 2 misiones para empezar el reto
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">
              {count}/2
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={2}
            aria-valuenow={count}
            className="mb-4 h-2 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-500"
              style={{ width: `${(count / 2) * 100}%` }}
            />
          </div>

          <ul className="flex flex-col gap-3">
            {MISSIONS.map((m, i) => {
              const isDone = done[m.kind];
              return (
                <li
                  key={m.kind}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isDone
                      ? "border-emerald-400/40 bg-emerald-400/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                        isDone ? "bg-emerald-500 text-white" : "bg-fuchsia-500/30 text-fuchsia-100"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white md:text-lg">{m.title}</p>
                      <p className="text-sm text-white/60">{m.text}</p>
                    </div>
                  </div>
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => mark(m.kind)}
                    className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-center text-sm font-extrabold transition sm:shrink-0 md:text-base ${
                      isDone
                        ? "border border-white/20 text-white/70 hover:bg-white/10"
                        : "bg-amber-400 text-black shadow-lg shadow-amber-400/30 hover:bg-amber-300"
                    }`}
                  >
                    {isDone ? "Abrir de nuevo" : m.button}
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
