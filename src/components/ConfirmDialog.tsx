"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Ventana de confirmación propia (en lugar del cuadro del navegador): fondo oscuro, esquinas
// redondeadas y botones del estilo de la app. Se cierra con Escape, con la X o tocando afuera.
export default function ConfirmDialog({
  open,
  icon,
  title,
  children,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  tone = "amber",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "amber" | "fuchsia";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmStyle =
    tone === "amber"
      ? "border-amber-600 bg-amber-400 text-amber-950 hover:bg-amber-300"
      : "border-purple-900 bg-gradient-to-b from-fuchsia-500 to-purple-600 text-white hover:brightness-110";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border-2 border-white/15 bg-[#1c0c35] p-6 text-center shadow-2xl shadow-black/60"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
        {icon && <div className="mb-3 flex justify-center">{icon}</div>}
        <h2 id="confirm-title" className="text-xl font-extrabold leading-tight text-white">
          {title}
        </h2>
        {children && <div className="mt-2 text-sm leading-relaxed text-white/70">{children}</div>}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border-2 border-white/15 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white/80 transition hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`flex-1 rounded-2xl border-b-4 px-4 py-3 text-sm font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
