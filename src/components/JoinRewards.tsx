"use client";

import { useState, useTransition } from "react";
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

function JoinCard({ kind, claimed }: { kind: Kind; claimed: boolean }) {
  const c = COPY[kind];
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await claimJoinReward(kind, code);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No se pudo canjear.");
    });
  }

  return (
    <section
      className={`rounded-2xl border-2 p-4 ${
        claimed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              kind === "whatsapp" ? "bg-[#25D366] text-white" : "bg-amber-400 text-purple-950"
            }`}
          >
            {kind === "whatsapp" ? (
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d={WHATSAPP_PATH} />
              </svg>
            ) : (
              <CourseIcon className="h-5 w-5" />
            )}
          </span>
          <h2 className="text-[15px] font-extrabold leading-tight text-white">{c.title}</h2>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-sm font-extrabold text-amber-300">
          <CoinIcon className="h-4 w-4" /> +50
        </span>
      </div>

      {claimed ? (
        <p className="mt-3 text-sm font-bold text-emerald-300">✓ Verificado: ya ganaste tus 50 monedas</p>
      ) : (
        <>
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void completeStartMission(kind)}
            className={`mt-3 block rounded-2xl px-4 py-2.5 text-center text-xs font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 ${c.tone}`}
          >
            {c.join}
          </a>
          <p className="mt-3 text-xs leading-snug text-white/55">
            Cuando estés dentro, busca el <strong className="text-white/80">código</strong> en{" "}
            {c.where} y escríbelo aquí para ganar tus monedas:
          </p>
          <form onSubmit={submit} className="mt-2 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Escribe el código"
              maxLength={40}
              autoComplete="off"
              aria-label={`Código de ${kind === "whatsapp" ? "WhatsApp" : "Skool"}`}
              className="min-w-0 flex-1 rounded-xl border-2 border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/35 outline-none focus:border-fuchsia-400"
            />
            <button
              type="submit"
              disabled={pending || code.trim().length === 0}
              className="shrink-0 rounded-xl bg-fuchsia-500 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-fuchsia-400 disabled:opacity-50"
            >
              {pending ? "..." : "Canjear"}
            </button>
          </form>
          {error && <p className="mt-2 text-xs font-semibold text-red-300">{error}</p>}
        </>
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
