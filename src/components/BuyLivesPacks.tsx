"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buyLives } from "@/app/actions";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CoinIcon, HeartIcon } from "@/components/StatIcons";
import { LIFE_PACKS, MAX_LIVES } from "@/lib/lives";

// Los dos paquetes de vidas (1 por 15 monedas, 3 por 40) con su botón de compra. Se usa en la tienda
// (con confirmación) y en la ventana de la trivia cuando se acaban las vidas (compra directa).
export default function BuyLivesPacks({
  coins,
  lives,
  confirm = false,
  onBought,
}: {
  coins: number;
  lives: number;
  confirm?: boolean;
  onBought?: (result: { lives: number; coins: number }) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState<(typeof LIFE_PACKS)[number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function buy(pack: (typeof LIFE_PACKS)[number]) {
    setAsking(null);
    setError(null);
    startTransition(async () => {
      const r = await buyLives(pack.qty);
      if (r.ok && r.lives !== undefined && r.coins !== undefined) {
        onBought?.({ lives: r.lives, coins: r.coins });
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo comprar.");
      }
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {LIFE_PACKS.map((pack) => {
          const fits = lives + pack.qty <= MAX_LIVES;
          const missing = pack.cost - coins;
          const canBuy = fits && missing <= 0;
          const saves = pack.qty * LIFE_PACKS[0].cost - pack.cost;
          return (
            <button
              key={pack.qty}
              type="button"
              disabled={pending || !canBuy}
              onClick={() => (confirm ? setAsking(pack) : buy(pack))}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 pb-4 pt-5 text-center transition disabled:cursor-not-allowed ${
                canBuy
                  ? "border-rose-400/40 bg-rose-400/10 hover:bg-rose-400/20 active:scale-[0.98]"
                  : "border-white/10 bg-white/[0.04] opacity-60"
              }`}
            >
              {saves > 0 && (
                <span className="absolute -top-2.5 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-900">
                  Ahorras {saves}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                {Array.from({ length: pack.qty }, (_, i) => (
                  <HeartIcon key={i} className="h-8 w-8" />
                ))}
              </span>
              <span className="text-sm font-extrabold text-white">
                {pack.qty} {pack.qty === 1 ? "vida" : "vidas"}
              </span>
              <span className="flex items-center gap-1 rounded-xl bg-black/30 px-3 py-1 text-base font-extrabold text-amber-300">
                <CoinIcon className="h-5 w-5" /> {pack.cost}
              </span>
              {!fits ? (
                <span className="text-[11px] font-semibold text-white/50">No caben (máximo {MAX_LIVES})</span>
              ) : missing > 0 ? (
                <span className="text-[11px] font-semibold text-white/50">Te faltan {missing} monedas</span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-300">
                  {pending ? "Comprando..." : "Comprar"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-center text-sm font-semibold text-red-300">{error}</p>}

      <ConfirmDialog
        open={asking !== null}
        icon={<HeartIcon className="h-14 w-14" />}
        title={asking ? `¿Comprar ${asking.qty} ${asking.qty === 1 ? "vida" : "vidas"}?` : ""}
        confirmLabel="Comprar"
        onConfirm={() => asking && buy(asking)}
        onCancel={() => setAsking(null)}
      >
        {asking && (
          <p className="mt-1">
            Costará <strong className="text-amber-300">{asking.cost} monedas de oro</strong>. Te quedarán{" "}
            <strong className="text-white">{coins - asking.cost}</strong>.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
