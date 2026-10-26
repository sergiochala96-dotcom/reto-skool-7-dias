"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { WORKSHOP_SOLD_PERCENT, WORKSHOP_START, WORKSHOP_URL } from "@/lib/captacion";
import { trackEvent } from "@/lib/metaPixel";

const WORKSHOP_IMAGE = "/mascota-workshop-envivo.png";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Cuenta regresiva hasta el inicio del workshop (cuadros negros con números blancos).
function WorkshopCountdown() {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(WORKSHOP_START).getTime() - Date.now())
  );

  useEffect(() => {
    const target = new Date(WORKSHOP_START).getTime();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (remaining <= 0) {
    return (
      <p className="mb-4 rounded-xl bg-black px-4 py-3 text-center text-sm font-extrabold text-white">
        🔴 ¡El workshop ya empezó!
      </p>
    );
  }

  const total = Math.floor(remaining / 1000);
  const units = [
    { value: Math.floor(total / 86400), label: "días" },
    { value: Math.floor((total % 86400) / 3600), label: "horas" },
    { value: Math.floor((total % 3600) / 60), label: "min" },
    { value: total % 60, label: "seg" },
  ];

  return (
    <div className="mb-4" role="timer" aria-label="Tiempo que falta para el workshop">
      <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
        El workshop empieza en
      </p>
      <div className="flex items-center justify-center gap-2">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex min-w-[3.6rem] flex-col items-center rounded-xl bg-black px-2 py-2 sm:min-w-[4.2rem]"
          >
            <span className="text-2xl font-extrabold leading-none tabular-nums text-white sm:text-3xl">
              {pad(u.value)}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Opción "Workshop EN VIVO" del menú lateral (computadora). Al tocarla se abre un popup con el
// comunicado del workshop en vivo.
export default function WorkshopMenuButton({
  collapsed = false,
  className = "",
}: {
  collapsed?: boolean;
  className?: string;
}) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={collapsed ? "Workshop EN VIVO" : undefined}
        className={className}
      >
        <span className="flex h-7 w-7 items-center justify-center text-2xl">🔴</span>
        {!collapsed && <span>Workshop EN VIVO</span>}
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
              className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center text-gray-900 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl font-bold leading-none text-gray-600 transition hover:bg-gray-200"
              >
                ×
              </button>
              <div className="pt-6">
                <WorkshopCountdown />
              </div>
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
                Únete al workshop EN VIVO🔴 para crear y lanzar tu Skool
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-700">
                Segunda edición del reto de Skool del{" "}
                <strong className="font-bold text-gray-900">28 al 29 de octubre</strong>. 30 cupos disponibles.
              </p>
              <a
                href={WORKSHOP_URL}
                onClick={() => trackEvent("InitiateCheckout", { content_name: "Workshop EN VIVO" })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full animate-[amberPulse_1.8s_ease-in-out_infinite] rounded-xl bg-amber-400 px-5 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 motion-reduce:animate-none sm:text-lg"
              >
                Quiero unirme al workshop en vivo
              </a>
              <div className="mt-5">
                <p className="mb-1.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Cupos vendidos
                </p>
                <div
                  role="progressbar"
                  aria-label="Cupos vendidos"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={WORKSHOP_SOLD_PERCENT}
                  className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
                >
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${WORKSHOP_SOLD_PERCENT}%` }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
