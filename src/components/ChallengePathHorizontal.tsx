import Link from "next/link";
import {
  CURRENT_EPISODE_LABEL,
  CURRENT_EPISODE_NAME,
  isDayUnlocked,
  MISSIONS,
  TOTAL_DAYS,
} from "@/lib/challenge";
import TreasureChestIcon from "@/components/TreasureChestIcon";
import MascotCashButton from "@/components/MascotCashButton";

export default function ChallengePathHorizontal({
  completedDays,
}: {
  completedDays: number[];
}) {
  const done = new Set(completedDays);
  const allDone = done.size >= TOTAL_DAYS;
  const isUnlocked = (day: number) => isDayUnlocked(day, done);
  const firstAvailable = MISSIONS.find((m) => !done.has(m.day) && isUnlocked(m.day))?.day;

  return (
    <div className="mx-auto mb-5 hidden md:block lg:mb-8">
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/10 bg-surface px-6 pb-5 pt-7 shadow-2xl shadow-black/40 lg:px-8 lg:pb-9 lg:pt-10">
        <h2 className="mb-0 text-center text-lg lg:text-xl">
          <span className="font-bold text-violet-300">{CURRENT_EPISODE_LABEL}</span>{" "}
          <span className="font-normal text-white/50">{CURRENT_EPISODE_NAME}</span>
        </h2>

        <div className="flex items-center gap-6 overflow-x-auto pt-5 lg:pt-8">
          {/* La mascota solo aparece en pantallas anchas, para dejarle el espacio al camino. */}
          <MascotCashButton className="hidden h-28 w-28 min-[1600px]:block" />

          {/* El camino se reparte el ancho disponible (los tramos se estiran entre 24 y 40 px), así
              no aparece barra de desplazamiento. */}
          <div className="flex min-w-0 flex-1 items-start">
            {MISSIONS.map((mission) => {
              const isDone = done.has(mission.day);
              const unlocked = isUnlocked(mission.day);
              const isCurrent = mission.day === firstAvailable;

              const node = (
                <div
                  className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 text-xl shadow-lg transition lg:h-14 lg:w-14 lg:text-2xl ${
                    isDone
                      ? "border-amber-300 bg-gradient-to-br from-violet-500 to-amber-400"
                      : isCurrent
                      ? "animate-pulse border-violet-300 bg-violet-500"
                      : unlocked
                      ? "border-white/30 bg-white/10 hover:bg-white/20"
                      : "border-white/10 bg-white/5 grayscale"
                  }`}
                >
                  {isDone ? "✓" : unlocked ? mission.emoji : "🔒"}
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow">
                      EMPEZAR
                    </span>
                  )}
                </div>
              );

              const label = (
                <div className="-mx-2 mt-3 w-[4.5rem] text-center">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      isDone ? "text-amber-300" : isCurrent ? "text-violet-300" : "text-white/40"
                    }`}
                  >
                    Día {mission.day}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-white/60">
                    {mission.title}
                  </p>
                </div>
              );

              return (
                <div key={mission.day} className="flex min-w-0 flex-1 items-start">
                  <div className="flex w-14 flex-shrink-0 flex-col items-center">
                    {unlocked ? <Link href={`/dia/${mission.day}`}>{node}</Link> : node}
                    {label}
                  </div>
                  <div
                    className={`mt-7 h-1.5 min-w-7 max-w-10 flex-1 rounded-full ${
                      isDone
                        ? "bg-gradient-to-r from-violet-500 to-amber-400"
                        : "bg-white/10"
                    }`}
                  />
                </div>
              );
            })}

            <div
              className={`mt-7 h-1.5 min-w-7 max-w-10 flex-1 rounded-full ${
                allDone ? "bg-gradient-to-r from-amber-400 to-yellow-300" : "bg-white/10"
              }`}
            />

            <div className="flex w-20 flex-shrink-0 flex-col items-center">
              {allDone ? (
                <Link
                  href="/cofre"
                  className="flex h-16 w-16 flex-shrink-0 animate-bounce items-center justify-center drop-shadow-[0_0_18px_rgba(245,158,11,0.6)] lg:h-16 lg:w-16"
                >
                  <TreasureChestIcon locked={false} className="h-full w-full" />
                </Link>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center opacity-70 lg:h-16 lg:w-16">
                  <TreasureChestIcon locked className="h-full w-full" />
                </div>
              )}
              <div className="-mx-3 mt-3 w-20 text-center">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    allDone ? "text-amber-300" : "text-white/40"
                  }`}
                >
                  Cofre
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-white/60">
                  Premio final
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
