"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CourseIcon from "@/components/CourseIcon";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { JoinCard } from "@/components/JoinRewards";
import { CoinIcon } from "@/components/StatIcons";

type Kind = "whatsapp" | "skool";

const TILE: Record<Kind, { label: string; top: string; bar: string }> = {
  whatsapp: { label: "Unirme al boletín de WhatsApp", top: "bg-[#25D366]", bar: "bg-emerald-700" },
  skool: { label: "Unirme al curso de Skool", top: "bg-amber-400", bar: "bg-amber-600" },
};

function Tile({ kind, claimed, onOpen }: { kind: Kind; claimed: boolean; onOpen: () => void }) {
  const t = TILE[kind];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t.label}
      className="w-[4.25rem] overflow-hidden rounded-2xl shadow-lg shadow-black/40 ring-1 ring-black/20 transition active:scale-95"
    >
      <span className={`flex h-11 items-center justify-center text-white ${t.top}`}>
        {kind === "whatsapp" ? (
          <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8" aria-hidden="true">
            <path d={WHATSAPP_PATH} />
          </svg>
        ) : (
          <CourseIcon className="h-8 w-8" />
        )}
      </span>
      <span
        className={`flex h-[1.375rem] items-center justify-center gap-0.5 text-xs font-extrabold text-white ${t.bar}`}
      >
        {claimed ? (
          "✓"
        ) : (
          <>
            <CoinIcon className="h-3.5 w-3.5" /> +50
          </>
        )}
      </span>
    </button>
  );
}

// Celular: dos iconos cuadrados fijos bajo la tarjeta del episodio (WhatsApp y Skool, +50 monedas
// cada uno). Cada uno abre un popup de pantalla completa con el botón para unirse y el campo del
// código. Van como hijos del bloque de episodios para que "sticky" los mantenga a la vista; la caja
// tiene alto 0 para que floten sobre el contenido sin empujarlo.
export default function JoinTiles({ claimed }: { claimed: { whatsapp: boolean; skool: boolean } }) {
  const [open, setOpen] = useState<Kind | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-[9rem] z-20 h-0 md:hidden">
        <div className="absolute -left-2 top-0 flex flex-col gap-3">
          <Tile kind="whatsapp" claimed={claimed.whatsapp} onOpen={() => setOpen("whatsapp")} />
          <Tile kind="skool" claimed={claimed.skool} onOpen={() => setOpen("skool")} />
        </div>
      </div>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={TILE[open].label}
            className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_70%)] px-4 pb-6 pt-3 md:hidden"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Cerrar"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl font-bold leading-none text-white transition hover:bg-white/20"
              >
                ×
              </button>
            </div>
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col pt-1">
              <JoinCard kind={open} claimed={claimed[open]} large />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
