"use client";

import { useEffect, useState } from "react";

// Guía de inicio de 3 pasos: aparece la primera vez que alguien entra al panel (o con ?guia=1).
// Es un recorrido de "foco": toda la pantalla se pone borrosa y oscura, salvo el elemento del paso
// (que queda nítido y con un aro amarillo), y junto a él aparece un texto blanco con una flecha que
// lo señala. Se avanza con "Siguiente"; se puede saltar en cualquier momento.

type Step = {
  key: "day" | "whatsapp" | "install";
  title: string;
  body: { mobile: string; desktop: string };
};

const STEPS: Step[] = [
  {
    key: "day",
    title: "Empieza el Día 1",
    body: {
      mobile: "Tu reto de 7 días arranca aquí. Toca el primer punto del camino y completa la misión de hoy.",
      desktop: "Tu reto de 7 días arranca aquí. Pulsa «Empezar día 1» y completa la misión de hoy.",
    },
  },
  {
    key: "whatsapp",
    title: "Únete a WhatsApp",
    body: {
      mobile: "Ahí te avisamos de todo y resolvemos dudas. Toca el icono verde y gana 50 monedas de oro.",
      desktop: "Ahí te avisamos de todo y resolvemos dudas. Usa esta tarjeta y gana 50 monedas de oro.",
    },
  },
  {
    key: "install",
    title: "Instala la app en tu celular",
    body: {
      mobile: "Toca el icono azul y sigue los pasos para tener Skooly en tu pantalla. Ganas 100 monedas de oro.",
      desktop:
        "Entra a Skooly desde tu celular y toca el icono azul de instalar: queda en tu pantalla como una app y ganas 100 monedas de oro.",
    },
  },
];

type Rect = { x: number; y: number; w: number; h: number };

const PAD = 8; // aire alrededor del elemento resaltado
const ARROW = 40; // alto de la flecha entre el elemento y el texto
const CALLOUT_MAX = 380;

// Primer elemento visible con esa marca (en el panel hay dos copias de algunas tarjetas y una se oculta
// según el ancho de la pantalla).
function findTarget(key: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`));
  return all.find((el) => el.getClientRects().length > 0) ?? null;
}

// Recorte de la capa borrosa: toda la pantalla menos un rectángulo redondeado (el hueco por el que se
// ve nítido el elemento del paso).
function holePath(vw: number, vh: number, r: Rect, radius: number) {
  const { x, y, w, h } = r;
  return (
    `path(evenodd, "M0 0H${vw}V${vh}H0Z ` +
    `M${x + radius} ${y}H${x + w - radius}A${radius} ${radius} 0 0 1 ${x + w} ${y + radius}` +
    `V${y + h - radius}A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}` +
    `H${x + radius}A${radius} ${radius} 0 0 1 ${x} ${y + h - radius}` +
    `V${y + radius}A${radius} ${radius} 0 0 1 ${x + radius} ${y}Z")`
  );
}

function Arrow({ up }: { up: boolean }) {
  return (
    <svg
      viewBox="0 0 24 40"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-9 w-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] ${up ? "" : "rotate-180"}`}
      aria-hidden="true"
    >
      <path d="M12 38C7 27 17 17 12 6" />
      <path d="M5 13 12 5l7 8" />
    </svg>
  );
}

export default function GuidedTour({ open: initiallyOpen }: { open: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Mientras dura la guía: sin desplazamiento, el elemento del paso a la vista y su posición al día.
  useEffect(() => {
    if (!open || !mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      const el = findTarget(STEPS[step].key);
      if (!el) {
        setRect(null);
        return;
      }
      const b = el.getBoundingClientRect();
      setRect({ x: b.left - PAD, y: b.top - PAD, w: b.width + PAD * 2, h: b.height + PAD * 2 });
    };

    const target = findTarget(STEPS[step].key);
    target?.scrollIntoView({ block: "center", behavior: "auto" });
    measure();
    const settle = window.setTimeout(measure, 150); // por si la pantalla acomoda algo después
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted, step, mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || !mounted || vp.w === 0) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const width = Math.min(CALLOUT_MAX, vp.w - 32);

  // El texto va debajo del elemento si ahí hay espacio; si no, arriba. Sin elemento (paso 3 en
  // computadora), va al centro.
  const below = rect ? vp.h - (rect.y + rect.h) : 0;
  const above = rect ? rect.y : 0;
  const placeBelow = rect ? below >= 240 || below >= above : false;
  const centerX = rect ? rect.x + rect.w / 2 : vp.w / 2;
  const left = Math.min(Math.max(centerX - width / 2, 16), vp.w - width - 16);
  const radius = rect ? (Math.abs(rect.w - rect.h) < 8 ? Math.min(rect.w, rect.h) / 2 : 18) : 0;

  const calloutStyle: React.CSSProperties = rect
    ? placeBelow
      ? { top: rect.y + rect.h + ARROW, left, width }
      : { bottom: vp.h - rect.y + ARROW, left, width }
    : { top: "50%", left: (vp.w - width) / 2, width, transform: "translateY(-50%)" };

  const arrowX = Math.min(Math.max(centerX, 28), vp.w - 28) - 12;

  return (
    <div role="dialog" aria-modal="true" aria-label="Guía de inicio">
      {/* Capa borrosa y oscura con un hueco sobre el elemento del paso */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[6px]"
        style={rect ? { clipPath: holePath(vp.w, vp.h, rect, radius) } : undefined}
        aria-hidden="true"
      />

      {rect && (
        <>
          {/* Aro amarillo alrededor del elemento */}
          <div
            className="tour-ring pointer-events-none fixed z-[71]"
            style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: radius }}
            aria-hidden="true"
          />
          {/* Flecha que apunta al elemento */}
          <div
            className="pointer-events-none fixed z-[72]"
            style={
              placeBelow
                ? { left: arrowX, top: rect.y + rect.h + 4 }
                : { left: arrowX, bottom: vp.h - rect.y + 4 }
            }
            aria-hidden="true"
          >
            <Arrow up={placeBelow} />
          </div>
        </>
      )}

      {/* Texto del paso (sin tarjeta: letras blancas sobre la capa borrosa) */}
      <div
        className="fixed z-[72] text-center text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.85)]"
        style={calloutStyle}
      >
        <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
          Paso {step + 1} de {STEPS.length}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold leading-tight">{current.title}</h2>
        <p className="mt-2 text-base leading-snug text-white/90">
          {mobile ? current.body.mobile : current.body.desktop}
        </p>

        <div className="mt-4 flex items-center justify-center gap-4 [text-shadow:none]">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? setOpen(false) : setStep(step + 1))}
            className="rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-7 py-2.5 text-sm font-extrabold uppercase tracking-wide text-amber-950 shadow-lg shadow-black/40 transition hover:bg-amber-300 active:translate-y-0.5 active:border-b-2"
          >
            {last ? "Finalizar guía" : "Siguiente"}
          </button>
        </div>
        {!last && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-xs font-semibold text-white/60 underline decoration-white/25 underline-offset-2 transition hover:text-white [text-shadow:none]"
          >
            Saltar guía
          </button>
        )}
      </div>
    </div>
  );
}
