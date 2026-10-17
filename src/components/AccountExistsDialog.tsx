"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

// Ventana emergente de /reto cuando el correo ya tiene una cuenta: más visible que una línea
// de error. Se cierra con la X, con Escape o tocando fuera; el botón lleva al inicio de sesión.
export default function AccountExistsDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-exists-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm animate-[popIn_0.25s_ease-out] rounded-3xl bg-white p-6 pt-8 text-center shadow-2xl shadow-purple-950/40"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-purple-950/50 transition hover:bg-purple-100 hover:text-purple-950"
        >
          ✕
        </button>

        <p className="text-4xl" aria-hidden="true">
          👋
        </p>
        <h2
          id="account-exists-title"
          className="mt-2 text-xl font-extrabold leading-tight text-purple-950"
        >
          Ese correo ya tiene una cuenta
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-purple-950/70">
          Inicia sesión para entrar a tu panel. Si la creaste con Google, entra con el botón{" "}
          <strong>&quot;Continuar con Google&quot;</strong>.
        </p>

        <Link
          href="/login"
          autoFocus
          className="mt-5 block w-full rounded-xl bg-amber-400 px-6 py-3.5 text-base font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-[0.99]"
        >
          Inicia sesión aquí
        </Link>
      </div>
    </div>,
    document.body
  );
}
