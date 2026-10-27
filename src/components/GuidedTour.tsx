"use client";

import { useEffect, useState } from "react";

// Guía de inicio de 3 pasos. La primera vez que alguien entra (o con ?guia=1) solo aparece una invitación
// pequeña, sin bloquear nada: "¿Quieres una guía rápida?". Si la acepta, comienza un recorrido de foco:
// la pantalla se pone borrosa y oscura salvo el elemento del paso (con un aro amarillo) y junto a él va
// un texto breve en blanco con una flecha. Se puede saltar en cualquier momento.

type Step = {
  key: "day" | "whatsapp" | "install";
  title: string;
  body?: string; // línea corta opcional bajo el título
};

const STEPS: Step[] = [
  {
    key: "day",
    title: "Inicia el reto",
    body: "Aquí empieza tu Día 1.",
  },
  {
    key: "whatsapp",
    title: "Únete a WhatsApp",
    // sin línea extra
  },
  {
    key: "install",
    title: "Instala la app",
    body: "Desde tu celular.",
  },
];

type Rect = { x: number; y: number; w: number; h: number };

const PAD = 10; // aire alrededor del elemento resaltado
const ARROW = 40; // alto de la flecha entre el elemento y el texto
const CALLOUT_MAX = 340;

// Elementos visibles con esa marca. Puede haber varios (el punto del día y su tarjeta) y entonces se
// resaltan juntos; además, en el panel hay dos copias de algunas tarjetas y una se oculta según el ancho.
function findTargets(key: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`)).filter(
    (el) => el.getClientRects().length > 0
  );
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
  // "intro": invitación pequeña · "tour": recorrido de 3 pasos · "off": cerrada
  const [mode, setMode] = useState<"intro" | "tour" | "off">(initiallyOpen ? "intro" : "off");
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => setMounted(true), []);

  // Durante el recorrido: sin desplazamiento, el elemento del paso a la vista y su posición al día.
  useEffect(() => {
    if (mode !== "tour" || !mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      const els = findTargets(STEPS[step].key);
      if (els.length === 0) {
        setRect(null);
        return;
      }
      // Rectángulo que abarca todos los elementos del paso.
      const boxes = els.map((el) => el.getBoundingClientRect());
      const left = Math.min(...boxes.map((b) => b.left));
      const top = Math.min(...boxes.map((b) => b.top));
      const right = Math.max(...boxes.map((b) => b.right));
      const bottom = Math.max(...boxes.map((b) => b.bottom));
      setRect({ x: left - PAD, y: top - PAD, w: right - left + PAD * 2, h: bottom - top + PAD * 2 });
    };

    findTargets(STEPS[step].key)[0]?.scrollIntoView({ block: "center", behavior: "auto" });
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
  }, [mode, mounted, step]);

  useEffect(() => {
    if (mode === "off") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMode("off");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode]);

  if (mode === "off" || !mounted) return null;

  // --- Invitación inicial (no bloquea nada) ---------------------------------------------------
  if (mode === "intro") {
    return (
      <div
        role="region"
        aria-label="Guía rápida"
        className="mx-auto mb-6 max-w-md animate-[introPulse_2.2s_ease-in-out_infinite] rounded-3xl border-2 border-amber-300/40 bg-surface-2 p-5 text-center motion-reduce:animate-none"
      >
        <p className="text-3xl">👋</p>
        <h2 className="mt-1 text-xl font-extrabold leading-tight text-white">¡Bienvenido!</h2>
        <p className="mt-1 text-sm text-white/70">Aprende a usar Skooly en tan solo 3 pasos.</p>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setMode("tour");
          }}
          className="mx-auto mt-4 block rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-amber-950 transition hover:bg-amber-300 active:translate-y-0.5 active:border-b-2"
        >
          Iniciar guía
        </button>
        <button
          type="button"
          onClick={() => setMode("off")}
          className="mt-3 text-xs font-semibold text-white/50 transition hover:text-white"
        >
          Ahora no
        </button>
      </div>
    );
  }

  // --- Recorrido de foco -----------------------------------------------------------------------
  if (vp.w === 0) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const width = Math.min(CALLOUT_MAX, vp.w - 32);

  // El texto va debajo del elemento si ahí hay espacio; si no, arriba. Sin elemento (paso 3 en
  // computadora), va al centro.
  const below = rect ? vp.h - (rect.y + rect.h) : 0;
  const above = rect ? rect.y : 0;
  const placeBelow = rect ? below >= 200 || below >= above : false;
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
    <div role="dialog" aria-modal="true" aria-label="Guía rápida">
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
        {current.body && <p className="mt-1 text-base text-white/90">{current.body}</p>}

        <div className="mt-4 flex items-center justify-center gap-4 [text-shadow:none]">
          <button
            type="button"
            onClick={() => (last ? setMode("off") : setStep(step + 1))}
            className="rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-7 py-2.5 text-sm font-extrabold uppercase tracking-wide text-amber-950 shadow-lg shadow-black/40 transition hover:bg-amber-300 active:translate-y-0.5 active:border-b-2"
          >
            {last ? "Finalizar guía" : "Siguiente"}
          </button>
        </div>
        {!last && (
          <button
            type="button"
            onClick={() => setMode("off")}
            className="mt-3 text-xs font-semibold text-white/60 underline decoration-white/25 underline-offset-2 transition hover:text-white [text-shadow:none]"
          >
            Saltar guía
          </button>
        )}
      </div>
    </div>
  );
}
