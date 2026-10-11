"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";

// Ventana emergente de bienvenida que se abre apenas se entra a /gracias,
// acompañada de confeti. El botón "Continuar" la cierra.
export default function GraciasPopup({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#7e22ce", "#c026d3", "#f59e0b", "#facc15", "#10b981", "#3b82f6"];
    const end = Date.now() + 2000;
    let raf = 0;

    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors });
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) raf = requestAnimationFrame(frame);
    })();

    return () => cancelAnimationFrame(raf);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gracias-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/70 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md animate-[popIn_0.35s_ease-out] rounded-3xl bg-white p-6 text-center shadow-2xl shadow-purple-950/40 sm:p-8">
        <Image
          src="/celebracion-dia.png"
          alt="Sergio y Skooly saltando de alegría"
          width={1254}
          height={1254}
          className="mx-auto h-48 w-48 object-contain sm:h-56 sm:w-56"
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
            setOpen(false);
            onClose?.();
          }}
          className="mt-6 w-full rounded-xl bg-amber-400 px-6 py-4 text-lg font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-[0.99]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
