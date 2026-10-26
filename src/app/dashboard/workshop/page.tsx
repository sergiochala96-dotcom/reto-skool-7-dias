import type { Metadata } from "next";
import Image from "next/image";
import StatsBar from "@/components/StatsBar";
import { WorkshopCountdown, WorkshopCta } from "@/components/WorkshopLive";
import { WORKSHOP_SOLD_PERCENT } from "@/lib/captacion";
import { getSidebarData } from "@/lib/sidebar-data";

export const metadata: Metadata = {
  title: "Workshop en vivo | Skooly",
};

// Página del workshop en vivo: qué es, cuándo es, cuántos cupos quedan y el botón para unirse.
export default async function WorkshopPage() {
  const { completedDays, coins, lives } = await getSidebarData();

  return (
    <>
      <main className="min-w-0 flex-1 px-4 pb-10 pt-6 md:px-6 md:py-5">
        {/* Estadísticas en la esquina superior derecha de la pantalla. */}
        <div className="mb-2 hidden justify-end md:flex">
          <StatsBar completedDays={Array.from(completedDays)} coins={coins} lives={lives} />
        </div>

        <div className="mx-auto max-w-4xl">
          <header className="mb-6 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-red-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> En vivo
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white md:text-4xl">
              Workshop para crear y lanzar tu Skool
            </h1>
            <p className="mt-2 text-white/60">Segunda edición del reto de Skool</p>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <section className="flex flex-col justify-center rounded-3xl border border-white/10 bg-surface p-6">
              <Image
                src="/mascota-workshop-envivo.png"
                alt="Skooly señalando una videollamada en vivo"
                width={1672}
                height={941}
                unoptimized
                className="mx-auto h-auto w-full max-w-sm"
              />
            </section>

            <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-surface p-6">
              <WorkshopCountdown />
              <WorkshopCta />
            </section>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-surface p-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-amber-300">Cuándo es</h2>
              <p className="mt-2 text-2xl font-extrabold text-white">28 y 29 de octubre</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                Miércoles 28 y jueves 29, en vivo. Empieza el miércoles a las 8:00 p. m. (hora de Colombia,
                GMT-5).
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-surface p-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-amber-300">Cupos</h2>
              <p className="mt-2 text-2xl font-extrabold text-white">30 cupos disponibles</p>
              <div
                role="progressbar"
                aria-label="Cupos vendidos"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={WORKSHOP_SOLD_PERCENT}
                className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                  style={{ width: `${WORKSHOP_SOLD_PERCENT}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/50">{WORKSHOP_SOLD_PERCENT}% de los cupos vendidos</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
