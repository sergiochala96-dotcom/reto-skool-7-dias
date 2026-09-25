"use client";

import { useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import TreasureChestIcon from "@/components/TreasureChestIcon";
import TreasureChestOpenIcon from "@/components/TreasureChestOpenIcon";

type Props = {
  nombre: string;
};

export default function TreasureChest({ nombre }: Props) {
  const [open, setOpen] = useState(false);
  const [showNivel2, setShowNivel2] = useState(false);

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
    <div className="flex w-full flex-col items-center text-center">
      {!open ? (
        <button
          onClick={handleOpen}
          className="group flex flex-col items-center gap-4 focus:outline-none"
        >
          <TreasureChestIcon
            locked={false}
            className="h-40 w-40 drop-shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
          />
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-3 font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition group-hover:brightness-110">
            Abrir el Cofre del Tesoro
          </span>
        </button>
      ) : (
        <div className="flex w-full flex-col items-center gap-5 animate-[fadeIn_0.6s_ease]">
          <TreasureChestOpenIcon className="h-40 w-40 drop-shadow-[0_0_30px_rgba(245,158,11,0.55)] md:h-20 md:w-20" />
          <h2 className="text-2xl font-bold text-amber-300">
            ¡Felicidades, {nombre}!
          </h2>
          <p className="max-w-md text-white/80">
            Completaste el Reto de 7 Días. Este es tu premio final:
          </p>
          <div className="w-full max-w-2xl rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-fuchsia-500/10 p-6 md:max-w-5xl">
            <div className="overflow-hidden rounded-xl">
              <iframe
                className="aspect-video w-full"
                src="https://www.youtube.com/embed/YzMBgs4k5yc?modestbranding=1&rel=0&iv_load_policy=3"
                title="Video final del reto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="https://cal.com/sergiochala/auditoria-de-skool"
                target="_blank"
                rel="noopener noreferrer"
                className="animate-pulse flex items-center justify-center rounded-xl bg-amber-300 px-4 py-3 text-center text-sm font-bold text-black shadow-lg shadow-amber-400/30 transition hover:brightness-105"
              >
                Quiero que revises mi Skool en llamada
              </a>
              <button
                type="button"
                onClick={() => setShowNivel2(true)}
                className="rounded-xl border-2 border-white/20 px-4 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10"
              >
                Desbloquear nivel 2
              </button>
            </div>
          </div>
        </div>
      )}

      {showNivel2 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowNivel2(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-md flex-col items-center rounded-3xl bg-gradient-to-b from-[#3b0764] to-[#0f0721] p-8 text-center shadow-2xl md:max-w-xl md:p-12"
          >
            <button
              type="button"
              onClick={() => setShowNivel2(false)}
              aria-label="Cerrar"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white md:h-11 md:w-11 md:text-lg"
            >
              ✕
            </button>

            <Image
              src="/celebracion-dia.png"
              alt="¡Muy pronto!"
              width={1254}
              height={1254}
              className="h-40 w-40 object-contain md:h-56 md:w-56"
            />

            <h3 className="mt-4 text-2xl font-extrabold text-white md:mt-6 md:text-4xl">
              ¡Muy pronto!
            </h3>
            <p className="mt-2 text-white/80 md:mt-3 md:text-xl">
              Estamos trabajando en el Nivel 2.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
