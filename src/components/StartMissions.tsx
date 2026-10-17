"use client";

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { completeStartMission, unlockEpisode1 } from "@/app/actions";
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

// Panel de inicio del dashboard. Según cómo llegue la persona se muestra una de dos versiones
// (se decide al cargar y no cambia durante la visita, para que la celebración no se corte):
//  - Checklist de 3 pasos sobre la tarjeta del Episodio 1: para quien aún no abrió el Día 2
//    en adelante. El Día 1 NO depende de él; el checklist abre el Día 2 en adelante.
//  - Franja discreta que invita a unirse: para quien ya pasó el Día 2 sin haberlo hecho.
// Los botones de unirse abren el enlace en otra pestaña y marcan la misión como hecha (desde
// aquí no se puede comprobar que la persona haya entrado, así que es de avance, no de prueba).
export default function StartMissions({
  initial,
  showChecklist,
  nextDay,
}: {
  initial: Done;
  showChecklist: boolean;
  nextDay: number;
}) {
  const [checklist] = useState(showChecklist);
  return checklist ? (
    <Checklist initial={initial} nextDay={nextDay} />
  ) : (
    <InviteStrip initial={initial} />
  );
}

// ---------------------------------------------------------------------------
// Checklist de 3 pasos (personas nuevas)
// ---------------------------------------------------------------------------

function LockIcon({ open, className }: { open?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d={open ? "M8 11V7a4 4 0 0 1 7.5-2" : "M8 11V7a4 4 0 0 1 8 0v4"} />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Destello que titila en la esquina de un paso pendiente.
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

const CIRCLE =
  "relative flex h-14 w-14 items-center justify-center rounded-full transition duration-500 sm:h-16 sm:w-16";
const LINE = "mt-[1.625rem] h-1 w-8 shrink-0 rounded-full transition-colors duration-500 sm:mt-[1.875rem] sm:w-14";
const STEP = "flex w-[4.75rem] flex-col items-center gap-1.5 sm:w-24";
const LABEL = "text-[11px] font-bold uppercase leading-tight tracking-wide sm:text-xs";

// Estado de cada paso: "done" (✓), "current" (con color y brillo, es el que toca) u "off"
// (apagado en gris, aún no se puede tocar). Se van encendiendo de a uno.
type StepState = "done" | "current" | "off";

function Checklist({ initial, nextDay }: { initial: Done; nextDay: number }) {
  const [done, setDone] = useState(initial);
  const [unlocked, setUnlocked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const both = done.skool && done.whatsapp;

  const whatsapp: StepState = done.whatsapp ? "done" : "current";
  const skool: StepState = done.skool ? "done" : done.whatsapp ? "current" : "off";
  const padlock: StepState = unlocked ? "done" : both ? "current" : "off";

  function mark(kind: Kind) {
    if (done[kind]) return;
    setDone((d) => ({ ...d, [kind]: true }));
    startTransition(() => completeStartMission(kind));
  }

  function openPadlock() {
    if (padlock !== "current" || pending) return;
    setNotice(null);
    setUnlocked(true);
    celebrate();
    startTransition(async () => {
      const ok = await unlockEpisode1();
      if (!ok) {
        setUnlocked(false);
        setNotice("Primero completa los pasos 1 y 2.");
      }
    });
  }

  const glow = (rgba: string) => ({ "--glow": rgba }) as CSSProperties;
  const pulse = "animate-[glowPulse_1.9s_ease-in-out_infinite] motion-reduce:animate-none";
  const doneCircle = "bg-emerald-500 text-3xl font-bold text-white shadow-lg shadow-emerald-500/30";
  const offCircle = "bg-white/10 text-white/70 grayscale opacity-60";
  const labelClass = (s: StepState) =>
    `${LABEL} ${s === "done" ? "text-emerald-300" : s === "current" ? "text-white" : "text-white/40"}`;

  return (
    <section className="mx-auto mb-5 w-full max-w-2xl rounded-3xl border-2 border-fuchsia-400/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] px-4 pb-4 pt-4 text-center shadow-2xl shadow-fuchsia-900/40 md:mb-6 md:max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
        Primeros pasos
      </p>
      <p className="mt-0.5 text-sm text-white/70 md:text-base">
        {unlocked
          ? "¡Listo! Ya tienes todo el reto de 7 días desbloqueado"
          : "Empieza el Día 1 ya mismo. Haz estas 3 misiones para desbloquear el resto del reto"}
      </p>

      <div className="mt-4 flex items-start justify-center">
        {/* Paso 1: WhatsApp */}
        <div className={STEP}>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => mark("whatsapp")}
            aria-label="Unirme a la comunidad de WhatsApp"
            style={glow("rgba(37,211,102,0.6)")}
            className={`${CIRCLE} ${
              whatsapp === "done"
                ? doneCircle
                : `bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 ${pulse}`
            }`}
          >
            {whatsapp === "done" ? (
              "✓"
            ) : (
              <>
                <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8" aria-hidden="true">
                  <path d={WHATSAPP_PATH} />
                </svg>
                <Sparkle className="-right-1 -top-1" delay="0s" />
              </>
            )}
          </a>
          <span className={labelClass(whatsapp)}>Únete a WhatsApp</span>
        </div>

        <span className={`${LINE} ${done.whatsapp ? "bg-emerald-400" : "bg-white/15"}`} />

        {/* Paso 2: Skool (se enciende al terminar el paso 1) */}
        <div className={STEP}>
          {skool === "off" ? (
            <span
              aria-label="Paso 2, Skool: se activa al terminar el paso 1"
              className={`${CIRCLE} ${offCircle}`}
            >
              <PeopleIcon className="h-7 w-7" />
            </span>
          ) : (
            <a
              href={SKOOL_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => mark("skool")}
              aria-label="Unirme gratis a la comunidad en Skool"
              style={glow("rgba(251,191,36,0.6)")}
              className={`${CIRCLE} ${
                skool === "done"
                  ? doneCircle
                  : `bg-gradient-to-br from-amber-300 to-orange-500 text-purple-950 shadow-lg shadow-amber-400/30 ${pulse}`
              }`}
            >
              {skool === "done" ? (
                "✓"
              ) : (
                <>
                  <PeopleIcon className="h-7 w-7" />
                  <Sparkle className="-left-1 -top-1" delay="0.5s" />
                </>
              )}
            </a>
          )}
          <span className={labelClass(skool)}>Únete a Skool</span>
        </div>

        <span className={`${LINE} ${done.skool ? "bg-emerald-400" : "bg-white/15"}`} />

        {/* Paso 3: el candado (se enciende al terminar el paso 2) */}
        <div className={STEP}>
          <button
            type="button"
            onClick={openPadlock}
            disabled={padlock !== "current"}
            aria-label={
              padlock === "done"
                ? "Reto desbloqueado"
                : padlock === "current"
                  ? "Tocar el candado para desbloquear el reto"
                  : "Candado bloqueado: completa primero los pasos 1 y 2"
            }
            style={glow("rgba(217,70,239,0.65)")}
            className={`${CIRCLE} ${
              padlock === "done"
                ? doneCircle
                : padlock === "current"
                  ? `cursor-pointer bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/40 ${pulse}`
                  : `cursor-not-allowed ${offCircle}`
            }`}
          >
            {padlock === "done" ? (
              <LockIcon open className="h-7 w-7" />
            ) : (
              <>
                <LockIcon className="h-7 w-7" />
                {padlock === "current" && <Sparkle className="-right-1 -top-1" delay="0.2s" />}
              </>
            )}
          </button>
          <span className={labelClass(padlock)}>
            {padlock === "done"
              ? "Reto abierto"
              : padlock === "current"
                ? "¡Toca el candado!"
                : "Desbloquea el reto"}
          </span>
        </div>
      </div>

      {unlocked && (
        <Link
          href={`/dia/${nextDay}`}
          className="mt-4 inline-block rounded-xl bg-amber-400 px-5 py-2 text-sm font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300"
        >
          {nextDay === 1 ? "Empezar el Día 1 →" : `Ir al Día ${nextDay} →`}
        </Link>
      )}
      {notice && <p className="mt-3 text-xs font-medium text-amber-200">{notice}</p>}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Franja discreta (cuentas que ya pasaron el Día 2 sin hacer las misiones)
// ---------------------------------------------------------------------------

// En celular solo se muestra el nombre corto; desde pantallas medianas se antepone "Únete a".
const INVITES: { kind: Kind; name: string; extra?: string; href: string }[] = [
  { kind: "whatsapp", name: "WhatsApp", href: WHATSAPP_COMMUNITY_URL },
  { kind: "skool", name: "Skool", extra: " gratis", href: SKOOL_COMMUNITY_URL },
];

function InviteStrip({ initial }: { initial: Done }) {
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
      <section className={`${box} flex items-center justify-between gap-2`}>
        <p className="text-sm font-bold text-white">🎉 ¡Gracias por unirte!</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </section>
    );
  }

  return (
    <section className={box}>
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
          Únete a nuestras comunidades
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
        {INVITES.map((m, i) => {
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
