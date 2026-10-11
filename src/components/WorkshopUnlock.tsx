"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { WORKSHOP_URL } from "@/lib/captacion";

const WORKSHOP_IMAGE = "/mascota-workshop-envivo.png";

// Texto + botón "Desbloquear" del Episodio 2 bloqueado. Al tocarlo se abre un popup
// con el comunicado del workshop en vivo.
export default function WorkshopUnlock() {
  const [open, setOpen] = useState(false);

  // Precarga la imagen del popup para que aparezca completa al abrirlo.
  useEffect(() => {
    const img = new window.Image();
    img.src = WORKSHOP_IMAGE;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <p className="text-center text-base font-semibold leading-snug text-white/80 lg:text-lg">
        Desbloquear siguiente nivel:
        <br />
        <span className="font-extrabold text-white">Workshop EN VIVO 🔴</span>
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 rounded-full bg-purple-200 px-8 py-2.5 text-base font-extrabold text-purple-900 shadow-lg transition hover:bg-purple-100 active:scale-[0.98]"
      >
        Desbloquear
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="workshop-title"
              className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center text-gray-900 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={WORKSHOP_IMAGE}
                alt="Skooly señalando una videollamada en vivo"
                width={1672}
                height={941}
                unoptimized
                className="mx-auto h-auto w-full max-w-xs"
              />
              <h2
                id="workshop-title"
                className="mt-4 text-2xl font-extrabold leading-tight text-purple-950"
              >
                Únete al workshop en vivo para crear y lanzar tu Skool
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-700">
                Segunda edición del reto de Skool del 21 al 22 de octubre. 30 cupos disponibles.
              </p>
              <a
                href={WORKSHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full rounded-xl bg-amber-400 px-5 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 sm:text-lg"
              >
                Quiero unirme al workshop en vivo
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
