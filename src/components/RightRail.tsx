import Image from "next/image";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import { CoinIcon } from "@/components/StatIcons";
import TreasureChestIcon from "@/components/TreasureChestIcon";
import { TOTAL_DAYS, isDayUnlocked } from "@/lib/challenge";
import { SUPPORT_EMAIL } from "@/lib/legal";
import type { PlanId } from "@/lib/planes";

const card = "rounded-2xl border-2 border-white/10 bg-white/[0.03] p-4";
const cardHead = "flex items-center justify-between gap-2";
const cardTitle = "text-base font-extrabold text-white";
const cardLink =
  "text-xs font-extrabold uppercase tracking-wide text-sky-400 transition hover:text-sky-300";

// Columna derecha del panel en computadora (como la de Duolingo): estadísticas, invitación a un
// plan superior, avance del reto, monedas y enlaces del pie.
export default function RightRail({
  completedDays,
  coins,
  lives,
  plan,
}: {
  completedDays: number[];
  coins: number;
  lives: number;
  plan: PlanId;
}) {
  const done = new Set(completedDays);
  const count = done.size;
  const allDone = count >= TOTAL_DAYS;
  const nextDay =
    Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).find(
      (d) => !done.has(d) && isDayUnlocked(d, done)
    ) ?? 1;

  const footerLink = "transition hover:text-white/80";

  return (
    <aside
      // Solo en pantallas de 1400 px o más (el centro necesita espacio para el camino del reto); por
      // debajo, el panel muestra solo la barra de estadísticas arriba a la derecha.
      className="hidden min-[1400px]:flex sticky top-0 h-screen w-[22rem] shrink-0 flex-col gap-4 overflow-y-auto px-5 py-6"
    >
      <StatsBar completedDays={completedDays} coins={coins} lives={lives} />

      {plan !== "vip" && (
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-md bg-gradient-to-r from-fuchsia-500 to-violet-500 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white">
                {plan === "standard" ? "Premium" : "VIP"}
              </span>
              <p className="mt-2 text-lg font-extrabold leading-tight text-white">
                {plan === "standard" ? "Conoce Skooly Premium" : "Pasa a Skooly VIP"}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-white/65">
                {plan === "standard"
                  ? "Abre el Episodio 2 con prompts, estrategias antichurn y más recursos nuevos."
                  : "Clases en vivo semanales y acceso a la membresía de Skool."}
              </p>
            </div>
            <Image
              src="/mascota-skooly.png"
              alt=""
              width={72}
              height={72}
              className="h-[4.5rem] w-[4.5rem] shrink-0 object-contain"
            />
          </div>
          <Link
            href="/dashboard/planes"
            className="mt-4 block rounded-2xl border-b-4 border-purple-900 bg-gradient-to-b from-fuchsia-500 to-purple-600 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
          >
            {plan === "standard" ? "Ver Skooly Premium" : "Ver Skooly VIP"}
          </Link>
        </section>
      )}

      <section className={card}>
        <div className={cardHead}>
          <h2 className={cardTitle}>Días del reto completados</h2>
          <Link href={allDone ? "/cofre" : `/dia/${nextDay}`} className={cardLink}>
            {allDone ? "Ver cofre" : "Seguir"}
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-extrabold text-white">
              {count} <span className="text-base font-bold text-white/50">de {TOTAL_DAYS}</span>
            </p>
            <div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_DAYS} aria-valuenow={count}>
              {Array.from({ length: TOTAL_DAYS }, (_, i) => (
                <span
                  key={i}
                  className={`h-3 flex-1 rounded-full ${
                    i < count ? "bg-gradient-to-r from-amber-300 to-orange-400" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
          <TreasureChestIcon locked={!allDone} className="h-12 w-12 shrink-0" />
        </div>
        <p className="mt-3 text-xs leading-snug text-white/50">
          {allDone
            ? "¡Lo lograste! Tu Cofre del Tesoro te espera."
            : "Completa los 7 días para abrir el Cofre del Tesoro."}
        </p>
      </section>

      <section className={card}>
        <div className={cardHead}>
          <h2 className={cardTitle}>Monedas de oro</h2>
          <Link href="/dashboard/tienda" className={cardLink}>
            Tienda
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <CoinIcon className="h-12 w-12 shrink-0" />
          <div>
            <p className="text-2xl font-extrabold text-amber-300">{coins}</p>
            <p className="text-xs text-white/50">monedas coleccionadas</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-snug text-white/50">
          Gana monedas completando días y canjéalas en la tienda por prompts, plantillas y enlaces.
        </p>
      </section>

      <nav
        aria-label="Enlaces"
        className="mt-auto flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2 text-[11px] font-bold uppercase tracking-wide text-white/35"
      >
        <Link href="/terminos" className={footerLink}>
          Términos
        </Link>
        <Link href="/privacidad" className={footerLink}>
          Privacidad
        </Link>
        <Link href="/reembolsos" className={footerLink}>
          Reembolsos
        </Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className={footerLink}>
          Soporte
        </a>
      </nav>
    </aside>
  );
}
