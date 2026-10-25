import type { Metadata } from "next";
import Link from "next/link";
import AvatarIcon, { avatarIconKey, isAvatarIconKey } from "@/components/AvatarIcon";
import PromptBox from "@/components/PromptBox";
import RedeemButton from "@/components/RedeemButton";
import Sidebar from "@/components/Sidebar";
import StatsBar from "@/components/StatsBar";
import { CoinIcon } from "@/components/StatIcons";
import UseAvatarButton from "@/components/UseAvatarButton";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tienda | Skooly",
};

type Item = {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  cost: number;
  kind: "prompt" | "link" | "text" | "avatar";
};

// Tienda: se canjean monedas de oro por prompts, plantillas, enlaces e iconos de perfil.
export default async function TiendaPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();

  const supabase = await createClient();
  const [{ data: itemRows }, { data: redemptionRows }, { data: contentRows }] = await Promise.all([
    supabase
      .from("shop_items")
      .select("id, slug, title, description, emoji, cost, kind")
      .eq("active", true)
      .order("sort", { ascending: true }),
    supabase.from("shop_redemptions").select("item_id").eq("user_id", user.id),
    // La base solo devuelve el contenido de lo que la persona ya canjeó.
    supabase.from("shop_item_contents").select("item_id, content"),
  ]);

  const items = (itemRows ?? []) as Item[];
  const redeemed = new Set((redemptionRows ?? []).map((r) => r.item_id as string));
  const contentById = new Map((contentRows ?? []).map((c) => [c.item_id as string, c.content as string]));
  const completedList = Array.from(completedDays);
  const currentIcon = avatarIconKey(avatarUrl);

  const resources = items.filter((i) => i.kind !== "avatar");
  const icons = items.filter((i) => i.kind === "avatar");

  function renderItem(item: Item) {
    const owned = redeemed.has(item.id);
    const content = contentById.get(item.id);
    const isIcon = item.kind === "avatar";
    // El dibujo se ve antes de canjear: la clave sale del nombre interno (avatar-llama → llama).
    const iconKey = isIcon ? item.slug.replace(/^avatar-/, "") : null;
    const wide = owned && item.kind !== "link" && !isIcon;

    return (
      <li
        key={item.id}
        className={`flex flex-col gap-4 rounded-2xl border-2 p-5 ${
          owned ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-white/10 bg-white/[0.04]"
        } ${wide ? "sm:col-span-2" : ""}`}
      >
        <div className="flex items-start gap-4">
          {isIcon && iconKey && isAvatarIconKey(iconKey) ? (
            <AvatarIcon name={iconKey} size={56} />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              {item.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold leading-tight text-white">{item.title}</h3>
            <p className="mt-1 text-sm leading-snug text-white/60">{item.description}</p>
          </div>
          {!owned && (
            <span className="flex shrink-0 items-center gap-1 rounded-xl bg-black/25 px-2.5 py-1 text-sm font-extrabold text-amber-300">
              <CoinIcon className="h-4 w-4" /> {item.cost}
            </span>
          )}
        </div>

        {owned ? (
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-300">✓ Desbloqueado</p>
            {isIcon ? (
              <UseAvatarButton itemId={item.id} inUse={content !== undefined && content === currentIcon} />
            ) : (
              content &&
              (item.kind === "link" ? (
                <a
                  href={content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400"
                >
                  Abrir enlace
                </a>
              ) : (
                <PromptBox
                  title={item.title}
                  text={content}
                  buttonLabel={item.kind === "prompt" ? "📋 Copiar prompt" : "📋 Copiar texto"}
                  hint={
                    item.kind === "prompt"
                      ? "Cambia lo que está entre [corchetes] por tus datos antes de pegarlo en tu IA."
                      : null
                  }
                />
              ))
            )}
          </div>
        ) : (
          <RedeemButton itemId={item.id} cost={item.cost} title={item.title} balance={coins} />
        )}
      </li>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={completedList}
        notifications={notifications}
        plan={plan}
        coins={coins}
        lives={lives}
      />

      <main className="min-w-0 flex-1 px-4 py-10 md:px-6 md:py-5">
        {/* Estadísticas en la esquina superior derecha de la pantalla. */}
        <div className="mb-2 hidden justify-end md:flex">
          <StatsBar completedDays={completedList} coins={coins} lives={lives} />
        </div>

        <div className="mx-auto max-w-4xl">
          <header className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-300">Tienda</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">Canjea tus monedas de oro</h1>
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-white/10 bg-white/5 px-4 py-2">
              <CoinIcon className="h-7 w-7" />
              <span className="text-2xl font-extrabold text-amber-300">{coins}</span>
              <span className="text-sm text-white/60">monedas</span>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
              Ganas <strong className="text-white/80">10</strong> monedas por cada día del reto
              completado, <strong className="text-white/80">50</strong> por unirte a WhatsApp y otras{" "}
              <strong className="text-white/80">50</strong> por unirte a Skool,{" "}
              <strong className="text-white/80">50</strong> de bono al terminar los 7 días, y{" "}
              <strong className="text-white/80">5</strong> por la trivia de cada día.
            </p>
          </header>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-white/50">
              Aún no hay productos en la tienda. Vuelve pronto.
            </p>
          ) : (
            <div className="space-y-10">
              {resources.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-white/50">Recursos</h2>
                  <ul className="grid gap-4 sm:grid-cols-2">{resources.map(renderItem)}</ul>
                </section>
              )}
              {icons.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-white/50">
                    Iconos de perfil
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2">{icons.map(renderItem)}</ul>
                </section>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-white/35">
            ¿Quieres más recursos?{" "}
            <Link href="/dashboard/planes" className="font-semibold text-fuchsia-300 hover:underline">
              Mira los planes
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
