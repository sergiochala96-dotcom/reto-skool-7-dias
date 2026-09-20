"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

type Props = {
  nombre: string;
};

export default function TreasureChest({ nombre }: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    const duration = 1500;
    const end = Date.now() + duration;
    const colors = ["#f59e0b", "#facc15", "#e879f9", "#a855f7"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors });
  };

  return (
    <div className="flex flex-col items-center text-center">
      {!open ? (
        <button
          onClick={handleOpen}
          className="group flex flex-col items-center gap-4 focus:outline-none"
        >
          <span className="text-[7rem] leading-none transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
            🎁
          </span>
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition group-hover:brightness-110">
            Abrir el Cofre del Tesoro
          </span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-5 animate-[fadeIn_0.6s_ease]">
          <span className="text-[7rem] leading-none">🏆</span>
          <h2 className="text-2xl font-bold text-amber-300">
            ¡Felicidades, {nombre}!
          </h2>
          <p className="max-w-md text-white/80">
            Completaste el Reto de 7 Días. Este es tu premio final:
          </p>
          <div className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-fuchsia-500/10 p-6">
            <p className="text-lg font-semibold text-amber-200">
              🎁 Premio sorpresa (placeholder)
            </p>
            <p className="mt-2 text-sm text-white/70">
              Aquí va tu premio real: un enlace de descuento, un bono, una
              sesión en vivo o el contenido que definas para tus miembros
              fundadores.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
