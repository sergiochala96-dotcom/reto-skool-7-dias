"use client";

import { useEffect, useState } from "react";

// Guía de inicio de 3 pasos (reemplaza al video de bienvenida): aparece la primera vez que alguien
// entra al panel y no bloquea nada. Una tarjeta flotante va explicando, paso a paso, qué tocar
// (empezar el Día 1, unirse a WhatsApp, instalar la app) y resalta con un aro amarillo el elemento
// de la pantalla del que habla. Se puede saltar en cualquier momento y volver a abrir desde el Perfil.

type Step = {
  key: "day" | "whatsapp" | "install";
  emoji: string;
  title: string;
  body: { mobile: string; desktop: string };
};

const STEPS: Step[] = [
  {
    key: "day",
    emoji: "🚀",
    title: "Empieza el Día 1",
    body: {
      mobile: "Tu reto de 7 días arranca aquí. Toca el primer punto del camino y completa la misión de hoy.",
      desktop: "Tu reto de 7 días arranca aquí. Pulsa «Empezar día 1» y completa la misión de hoy.",
    },
  },
  {
    key: "whatsapp",
    emoji: "💬",
    title: "Únete a WhatsApp",
    body: {
      mobile: "Ahí te avisamos de todo y resolvemos dudas. Toca el icono verde y gana 50 monedas de oro.",
      desktop: "Ahí te avisamos de todo y resolvemos dudas. Usa esta tarjeta y gana 50 monedas de oro.",
    },
  },
  {
    key: "install",
    emoji: "📲",
    title: "Instala la app en tu celular",
    body: {
      mobile: "Toca el icono azul y sigue los pasos para tener Skooly en tu pantalla. Ganas 100 monedas de oro.",
      desktop:
        "Entra a Skooly desde tu celular y toca el icono azul de instalar: queda en tu pantalla como una app y ganas 100 monedas de oro.",
    },
  },
];

const HIGHLIGHT = "tour-highlight";

// Primer elemento visible con esa marca (en el panel hay dos copias de algunas tarjetas y una se oculta
// según el ancho de la pantalla).
function findTarget(key: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`));
  return all.find((el) => el.getClientRects().length > 0) ?? null;
}

export default function GuidedTour({ open: initiallyOpen }: { open: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Resalta lo que explica el paso actual y lo trae a la vista.
  useEffect(() => {
    if (!open) return;
    const clear = () => document.querySelectorAll(`.${HIGHLIGHT}`).forEach((el) => el.classList.remove(HIGHLIGHT));
    clear();
    const target = findTarget(STEPS[step].key);
    if (target) {
      target.classList.add(HIGHLIGHT);
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    return clear;
  }, [open, step, mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Guía de inicio"
      className="fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-3xl border-2 border-white/15 bg-surface-2 p-5 shadow-2xl shadow-black/60 md:inset-x-auto md:bottom-8 md:left-1/2 md:w-[27rem] md:-translate-x-1/2"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-4 top-4 text-xs font-semibold text-white/45 transition hover:text-white"
      >
        Saltar guía
      </button>

      <div className="flex items-center gap-1.5" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-7 bg-amber-300" : i < step ? "w-3 bg-amber-300/60" : "w-3 bg-white/15"
            }`}
          />
        ))}
        <span className="ml-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
          {current.emoji}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold leading-tight text-white">{current.title}</h2>
          <p className="mt-1 text-sm leading-snug text-white/70">
            {mobile ? current.body.mobile : current.body.desktop}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-sm font-semibold text-white/55 transition hover:text-white"
          >
            Atrás
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => (last ? setOpen(false) : setStep(step + 1))}
          className="rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-amber-950 transition hover:bg-amber-300 active:translate-y-0.5 active:border-b-2"
        >
          {last ? "Finalizar guía" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
