import Link from "next/link";
import JoinRewards from "@/components/JoinRewards";
import NotificationsMenu from "@/components/NotificationsMenu";
import StatsBar from "@/components/StatsBar";
import { CoinIcon } from "@/components/StatIcons";
import TreasureChestIcon from "@/components/TreasureChestIcon";
import { TOTAL_DAYS, isDayUnlocked } from "@/lib/challenge";
import { SUPPORT_EMAIL } from "@/lib/legal";
import type { SidebarNotification } from "@/lib/sidebar-data";

const card = "rounded-2xl border-2 border-white/10 bg-white/[0.03] p-4";
const cardHead = "flex items-center justify-between gap-2";
const cardTitle = "text-base font-extrabold text-white";
const cardLink =
  "text-xs font-extrabold uppercase tracking-wide text-sky-400 transition hover:text-sky-300";

// Columna derecha del panel en computadora (como la de Duolingo): estadísticas, avance del reto,
// recompensas por unirse a las comunidades, monedas y enlaces del pie.
export default function RightRail({
  completedDays,
  coins,
  lives,
  claimed,
  notifications,
}: {
  completedDays: number[];
  coins: number;
  lives: number;
  claimed: { whatsapp: boolean; skool: boolean };
  notifications: SidebarNotification[];
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
      // debajo, el panel muestra solo la barra de estadísticas arriba a la derecha. Sin altura fija
      // ni barra propia: se desplaza junto con la página.
      className="hidden min-[1400px]:flex w-[22rem] shrink-0 flex-col gap-4 px-5 py-6"
    >
      {/* Los cuatro iconos (racha, monedas, vidas y notificaciones) dentro de una tarjeta del mismo ancho que las demás. */}
      <section className="rounded-2xl border-2 border-white/10 bg-white/[0.03] p-1.5">
        <StatsBar
          completedDays={completedDays}
          coins={coins}
          lives={lives}
          size="compact"
          extra={<NotificationsMenu variant="bar" notifications={notifications} collapsed={false} />}
        />
      </section>

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

      <JoinRewards claimed={claimed} />

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
          Gana monedas con los días del reto, las comunidades y la trivia del día, y canjéalas en la
          tienda por prompts, plantillas y enlaces.
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
