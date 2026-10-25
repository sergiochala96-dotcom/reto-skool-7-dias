"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CoinIcon, FlameIcon, HeartIcon } from "@/components/StatIcons";
import { TOTAL_DAYS } from "@/lib/challenge";

type Panel = "racha" | "monedas" | "vidas" | null;

// Barra de estadísticas del panel (como la de Duolingo): llama con los días del reto completados,
// monedas de oro y vidas. Cada una abre una ventanita con el detalle.
export default function StatsBar({
  completedDays,
  coins,
  lives,
  className = "",
  size = "default",
  sheet = false,
  extra,
}: {
  completedDays: number[];
  coins: number;
  lives: number;
  className?: string;
  size?: "default" | "compact"; // compact: barra delgada del celular
  sheet?: boolean; // la ventanita ocupa todo el ancho de la barra (celular)
  extra?: React.ReactNode; // elemento al final de la barra (la campana en el celular)
}) {
  const compact = size === "compact";
  const icon = compact ? "h-7 w-7" : "h-9 w-9";
  const [open, setOpen] = useState<Panel>(null);
  const ref = useRef<HTMLDivElement>(null);
  const done = new Set(completedDays);
  const count = completedDays.length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const chip = (panel: Exclude<Panel, null>, content: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setOpen(open === panel ? null : panel)}
      aria-expanded={open === panel}
      aria-label={label}
      className={`flex items-center rounded-2xl border-2 font-extrabold transition ${
        compact ? "gap-2 px-2.5 py-1.5 text-lg" : "gap-2.5 px-3.5 py-2.5 text-xl"
      } ${
        open === panel
          ? "border-white/20 bg-white/10"
          : "border-transparent hover:bg-white/5"
      }`}
    >
      {content}
    </button>
  );

  return (
    <div ref={ref} className={`relative flex items-center justify-between gap-1 ${className}`}>
      {chip(
        "racha",
        <>
          <FlameIcon className={icon} lit={count > 0} />
          <span className={count > 0 ? "text-orange-400" : "text-white/35"}>{count}</span>
        </>,
        `Racha: ${count} días del reto completados`
      )}
      {chip(
        "monedas",
        <>
          <CoinIcon className={icon} />
          <span className="text-amber-300">{coins}</span>
        </>,
        `${coins} monedas de oro`
      )}
      {chip(
        "vidas",
        <>
          <HeartIcon className={icon} />
          <span className="text-red-400">{lives}</span>
        </>,
        `${lives} vidas`
      )}

      {extra}

      {open && (
        <div
          role="dialog"
          className={`absolute top-full z-50 mt-2 ${sheet ? "inset-x-0" : "right-0 w-[19rem]"} rounded-2xl border-2 border-white/15 bg-[#1c0c35] p-5 text-white shadow-2xl shadow-black/50`}
        >
          {open === "racha" && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-extrabold leading-tight">
                    {count === 0 ? "0 días de racha" : `${count} de ${TOTAL_DAYS} días completados`}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-white/70">
                    {count === 0
                      ? "¡Completa tu primera misión y enciende tu llama!"
                      : count >= TOTAL_DAYS
                        ? "¡Completaste el reto! Abre el Cofre del Tesoro."
                        : "¡Sigue así! Cada día completado enciende más tu llama."}
                  </p>
                </div>
                <FlameIcon className="h-14 w-14 shrink-0" lit={count > 0} />
              </div>
              <div className="mt-4 flex justify-between rounded-xl bg-black/25 px-3 py-3">
                {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => (
                  <div key={d} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white/50">D{d}</span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                        done.has(d) ? "bg-orange-400 text-[#3a1500]" : "bg-white/10 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {open === "monedas" && (
            <>
              <div className="flex items-center gap-4">
                <CoinIcon className="h-16 w-16 shrink-0" />
                <div>
                  <p className="text-xl font-extrabold">Monedas de oro</p>
                  <p className="text-sm text-white/70">Tienes {coins} monedas</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-white/70">
                <li>🪙 +10 por cada día del reto completado</li>
                <li>🪙 +50 por unirte a WhatsApp y +50 por unirte a Skool</li>
                <li>🪙 +5 por completar la trivia del día</li>
                <li>🪙 +50 al terminar los 7 días</li>
              </ul>
              <Link
                href="/dashboard/tienda"
                onClick={() => setOpen(null)}
                className="mt-4 block text-sm font-extrabold uppercase tracking-wide text-sky-400 hover:text-sky-300"
              >
                Ir a la tienda
              </Link>
            </>
          )}

          {open === "vidas" && (
            <>
              <div className="flex items-center gap-4">
                <HeartIcon className="h-16 w-16 shrink-0" />
                <div>
                  <p className="text-xl font-extrabold">Vidas</p>
                  <p className="text-sm text-white/70">Tienes {lives} vidas</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-snug text-white/70">
                Pierdes una vida cada vez que fallas una pregunta de la trivia del día. Sin vidas no
                puedes terminarla y pierdes las monedas.
              </p>
              <p className="mt-2 text-sm leading-snug text-white/70">
                Todos los días a las <strong className="text-white">6:00 a. m. (GMT-5)</strong> tus
                vidas se reinician a 3.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
