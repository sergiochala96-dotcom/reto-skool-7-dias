"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemShopItem } from "@/app/actions";
import { CoinIcon } from "@/components/StatIcons";

// Botón de canje de la tienda: descuenta las monedas y deja ver el contenido del producto.
export default function RedeemButton({
  itemId,
  cost,
  title,
  balance,
}: {
  itemId: string;
  cost: number;
  title: string;
  balance: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const missing = cost - balance;
  const canAfford = missing <= 0;

  function onClick() {
    if (!window.confirm(`¿Canjear «${title}» por ${cost} monedas de oro?`)) return;
    setError(null);
    startTransition(async () => {
      const r = await redeemShopItem(itemId);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No se pudo canjear.");
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending || !canAfford}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-3 text-sm font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed ${
          canAfford
            ? "border-amber-600 bg-amber-400 text-amber-950 hover:bg-amber-300"
            : "border-white/10 bg-white/10 text-white/40"
        }`}
      >
        {pending ? (
          "Canjeando..."
        ) : canAfford ? (
          <>
            Canjear · <CoinIcon className="h-5 w-5" /> {cost}
          </>
        ) : (
          <>
            <CoinIcon className="h-5 w-5 opacity-50" /> Te faltan {missing}
          </>
        )}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}
    </div>
  );
}
