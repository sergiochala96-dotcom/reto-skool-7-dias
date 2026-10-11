"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import GraciasCheckpoints from "@/components/GraciasCheckpoints";
import { playVictoryFanfare } from "@/lib/successSound";

// Ventana emergente de bienvenida que se abre apenas se entra a /gracias,
// acompañada de confeti. El botón "Continuar" la cierra.
export default function GraciasPopup({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    // Mientras el popup está abierto se pausan las animaciones de la página de atrás
    // (ver globals.css) para que el confeti y el popup vayan fluidos.
    document.body.dataset.popup = "open";
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.popup;
    };
  }, [open]);

  // Al aparecer el popup: sonido de victoria y confeti. Si el navegador aún no
  // permite audio sin interacción, el sonido se omite (al continuar suena igual).
  useEffect(() => {
    playVictoryFanfare(1, true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Confeti liviano: menos partículas y ráfagas espaciadas (no una por frame).
    const colors = [
      "#7e22ce",
      "#c026d3",
      "#f59e0b",
      "#facc15",
      "#10b981",
      "#3b82f6",
    ];
    const end = Date.now() + 1500;
    let timer = 0;

    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.45 },
      colors,
      disableForReducedMotion: true,
    });
    (function burst() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) timer = window.setTimeout(burst, 90);
    })();

    return () => window.clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gracias-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 p-4"
    >
      <div className="w-full max-w-md animate-[popIn_0.35s_ease-out] rounded-3xl bg-white p-6 text-center shadow-2xl shadow-purple-950/40 sm:p-8">
        <GraciasCheckpoints size="sm" labels />
        <Image
          src="/mascota-whatsapp-gato.png"
          alt="Skooly con el logo de WhatsApp"
          width={1254}
          height={1254}
          className="mx-auto mt-2 h-44 w-44 object-contain sm:h-56 sm:w-56"
          priority
        />
        <h2
          id="gracias-popup-title"
          className="mt-2 text-2xl font-extrabold leading-tight text-purple-950 sm:text-3xl"
        >
          Estás a un paso de monetizar tu conocimiento con Skool
        </h2>
        <button
          type="button"
          autoFocus
          onClick={() => {
            playVictoryFanfare();
            setOpen(false);
            onClose?.();
          }}
          className="mt-6 w-full rounded-xl bg-amber-400 px-6 py-4 text-lg font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-[0.99]"
        >
          Continuar
        </button>

        {/* Progreso: la primera mitad ya está llena, falta la segunda. */}
        <div
          role="progressbar"
          aria-label="Progreso"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          className="mt-5 flex gap-2"
        >
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-purple-100">
            <div className="h-full w-full animate-[fillBar_0.9s_ease-out] rounded-full bg-emerald-500" />
          </div>
          <div className="h-2.5 flex-1 rounded-full bg-purple-100" />
        </div>
      </div>
    </div>
  );
}
