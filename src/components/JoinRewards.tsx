"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { claimJoinReward, completeStartMission } from "@/app/actions";
import CourseIcon from "@/components/CourseIcon";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { CoinIcon } from "@/components/StatIcons";
import { SKOOL_COMMUNITY_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

type Kind = "whatsapp" | "skool";

const COPY: Record<
  Kind,
  { title: string; join: string; where: string; href: string; tone: string }
> = {
  whatsapp: {
    title: "Únete al boletín de WhatsApp",
    join: "Unirme al boletín",
    where: "el mensaje fijado del grupo",
    href: WHATSAPP_COMMUNITY_URL,
    tone: "border-b-4 border-emerald-700 bg-[#25D366] text-white hover:brightness-105",
  },
  skool: {
    title: "Únete al curso de Skool",
    join: "Unirme al curso",
    where: "la publicación fijada de la comunidad",
    href: SKOOL_COMMUNITY_URL,
    tone: "border-b-4 border-amber-700 bg-amber-400 text-amber-950 hover:brightness-105",
  },
};

// Compacta (computadora y tablet): título, premio y un solo botón; al tocarlo se abre una ventana con
// los pasos (unirse y canjear el código). large: versión de pantalla completa del celular, con todo
// más grande y centrado.
export function JoinCard({
  kind,
  claimed,
  large = false,
}: {
  kind: Kind;
  claimed: boolean;
  large?: boolean;
}) {
  const c = COPY[kind];
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await claimJoinReward(kind, code);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No se pudo canjear.");
    });
  }

  if (large) {
    return (
      <section
        className={`flex flex-1 flex-col items-center justify-center rounded-3xl border-2 p-6 text-center ${
          claimed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <span
          className={`flex h-24 w-24 items-center justify-center rounded-full ${
            kind === "whatsapp" ? "bg-[#25D366] text-white" : "bg-amber-400 text-white"
          }`}
        >
          {kind === "whatsapp" ? (
            <svg viewBox="0 0 32 32" fill="currentColor" className="h-14 w-14" aria-hidden="true">
              <path d={WHATSAPP_PATH} />
            </svg>
          ) : (
            <CourseIcon className="h-14 w-14" />
          )}
        </span>
        <h2 className="mt-5 text-2xl font-extrabold leading-tight text-white">{c.title}</h2>
        <span className="mt-3 flex items-center gap-1.5 rounded-2xl bg-black/25 px-4 py-1.5 text-xl font-extrabold text-amber-300">
          <CoinIcon className="h-6 w-6" /> +50 monedas de oro
        </span>

        {claimed ? (
          <p className="mt-6 text-base font-bold text-emerald-300">✓ Verificado: ya ganaste tus 50 monedas</p>
        ) : (
          <>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void completeStartMission(kind)}
              className={`mt-7 block w-full rounded-2xl px-4 py-4 text-center text-sm font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 ${c.tone}`}
            >
              {c.join}
            </a>
            <p className="mt-7 text-sm leading-snug text-white/60">
              Cuando estés dentro, busca el <strong className="text-white/85">código</strong> en {c.where} y
              escríbelo aquí para ganar tus monedas:
            </p>
            <form onSubmit={submit} className="mt-3 flex w-full flex-col gap-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Escribe el código"
                maxLength={40}
                autoComplete="off"
                aria-label={`Código de ${kind === "whatsapp" ? "WhatsApp" : "Skool"}`}
                className="w-full rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-3.5 text-center text-base text-white placeholder-white/35 outline-none focus:border-violet-400"
              />
              <button
                type="submit"
                disabled={pending || code.trim().length === 0}
                className="w-full rounded-2xl bg-violet-500 px-4 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-violet-400 disabled:opacity-50"
              >
                {pending ? "..." : "Canjear"}
              </button>
            </form>
            {error && <p className="mt-3 text-sm font-semibold text-red-300">{error}</p>}
          </>
        )}
      </section>
    );
  }

  const iconBubble = (size: string, glyph: string) => (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full ${
        kind === "whatsapp" ? "bg-[#25D366] text-white" : "bg-amber-400 text-white"
      }`}
    >
      {kind === "whatsapp" ? (
        <svg viewBox="0 0 32 32" fill="currentColor" className={glyph} aria-hidden="true">
          <path d={WHATSAPP_PATH} />
        </svg>
      ) : (
        <CourseIcon className={glyph} />
      )}
    </span>
  );

  return (
    <section
      className={`rounded-2xl border-2 p-4 ${
        claimed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {iconBubble("h-9 w-9", "h-5 w-5")}
          <h2 className="text-[15px] font-extrabold leading-tight text-white">{c.title}</h2>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-sm font-extrabold text-amber-300">
          <CoinIcon className="h-4 w-4" /> +50
        </span>
      </div>

      {claimed ? (
        <p className="mt-3 text-sm font-bold text-emerald-300">✓ Verificado: ya ganaste tus 50 monedas</p>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`mt-3 block w-full rounded-2xl px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 ${c.tone}`}
        >
          {c.join}
        </button>
      )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={c.title}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[94vh] w-full max-w-md animate-[popIn_0.25s_ease-out] overflow-y-auto rounded-3xl border-2 border-white/15 bg-surface-2 shadow-2xl shadow-black/60"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl font-bold leading-none text-white transition hover:bg-white/20"
              >
                ×
              </button>

              <div
                className={`flex flex-col items-center px-6 pb-5 pt-7 text-center ${
                  kind === "whatsapp" ? "bg-[#25D366]/15" : "bg-amber-400/15"
                }`}
              >
                {iconBubble("h-20 w-20", "h-12 w-12")}
                <h2 className="mt-3 text-xl font-extrabold leading-tight text-white">{c.title}</h2>
                <span className="mt-2 flex items-center gap-1.5 rounded-2xl bg-black/30 px-3.5 py-1 text-base font-extrabold text-amber-300">
                  <CoinIcon className="h-5 w-5" /> +50 monedas de oro
                </span>
              </div>

              <div className="px-6 pb-6 pt-5">
                {claimed ? (
                  <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-400/10 p-5 text-center">
                    <p className="text-4xl">🎉</p>
                    <p className="mt-2 text-lg font-extrabold text-emerald-300">
                      ¡Listo! Ya ganaste tus 50 monedas
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="mt-4 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <ol className="relative flex flex-col gap-6">
                    {/* Línea que une los dos pasos */}
                    <span className="absolute bottom-6 left-[1.0625rem] top-9 w-0.5 bg-white/15" aria-hidden="true" />

                    <li className="relative flex gap-4">
                      <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-base font-extrabold text-white">
                        1
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-extrabold text-white">Únete</p>
                        <p className="mt-0.5 text-sm leading-snug text-white/60">
                          Entra primero y quédate dentro: el código está allí.
                        </p>
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => void completeStartMission(kind)}
                          className={`mt-3 block rounded-2xl px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 ${c.tone}`}
                        >
                          {c.join}
                        </a>
                      </div>
                    </li>

                    <li className="relative flex gap-4">
                      <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-base font-extrabold text-white">
                        2
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-extrabold text-white">Canjea tu código</p>
                        <p className="mt-0.5 text-sm leading-snug text-white/60">
                          Busca el <strong className="text-white/85">código</strong> en {c.where} y escríbelo aquí
                          para reclamar tus monedas.
                        </p>
                        <form onSubmit={submit} className="mt-3 flex gap-2">
                          <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Escribe el código"
                            maxLength={40}
                            autoComplete="off"
                            aria-label={`Código de ${kind === "whatsapp" ? "WhatsApp" : "Skool"}`}
                            className="min-w-0 flex-1 rounded-xl border-2 border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-violet-400"
                          />
                          <button
                            type="submit"
                            disabled={pending || code.trim().length === 0}
                            className="shrink-0 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-violet-400 disabled:opacity-50"
                          >
                            {pending ? "..." : "Canjear"}
                          </button>
                        </form>
                        {error && <p className="mt-2 text-xs font-semibold text-red-300">{error}</p>}
                      </div>
                    </li>
                  </ol>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

// Las dos recompensas por unirse a las comunidades (50 monedas de oro cada una). Se verifican con
// un código que solo se ve dentro de cada grupo.
export default function JoinRewards({
  claimed,
  className = "",
}: {
  claimed: { whatsapp: boolean; skool: boolean };
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <JoinCard kind="whatsapp" claimed={claimed.whatsapp} />
      <JoinCard kind="skool" claimed={claimed.skool} />
    </div>
  );
}
