"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// "Abrir mi compra": muestra el contenido de un recurso ya comprado (un prompt o un texto) en una
// ventana, para que la tienda se mantenga ordenada. Los enlaces no necesitan ventana: se abren directo.
export default function PurchaseViewer({
  title,
  emoji,
  text,
  kind,
}: {
  title: string;
  emoji: string;
  text: string;
  kind: "prompt" | "text";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // sin portapapeles: la persona puede seleccionar el texto a mano
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2 sm:text-sm"
      >
        Abrir mi compra
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="purchase-title"
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border-2 border-white/15 bg-surface-2 p-6 shadow-2xl shadow-black/60"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl font-bold leading-none text-white transition hover:bg-white/20"
              >
                ×
              </button>

              <div className="flex items-center gap-3 pr-10">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  {emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-300">
                    ✓ Tu compra
                  </p>
                  <h2 id="purchase-title" className="text-lg font-extrabold leading-tight text-white">
                    {title}
                  </h2>
                </div>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl bg-black/30 p-4">
                <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/85">{text}</p>
              </div>

              <button
                type="button"
                onClick={copy}
                className="mt-4 w-full rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-amber-950 transition hover:bg-amber-300 active:translate-y-0.5 active:border-b-2"
              >
                {copied ? "Copiado ✓" : kind === "prompt" ? "📋 Copiar prompt" : "📋 Copiar texto"}
              </button>
              {kind === "prompt" && (
                <p className="mt-2 text-center text-xs text-white/50">
                  Cambia lo que está entre [corchetes] por tus datos antes de pegarlo en tu IA.
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
