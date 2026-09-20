import Image from "next/image";
import Link from "next/link";
import { MISSIONS, TOTAL_DAYS } from "@/lib/challenge";
import TreasureChestIcon from "@/components/TreasureChestIcon";

export default function ChallengePathHorizontal({
  completedDays,
}: {
  completedDays: number[];
}) {
  const done = new Set(completedDays);
  const allDone = done.size >= TOTAL_DAYS;
  const currentMission = MISSIONS.find(
    (m) => !done.has(m.day) && (m.day === 1 || done.has(m.day - 1))
  );
  const firstAvailable = currentMission?.day;

  return (
    <div className="mx-auto mb-12 hidden md:block">
      <h2 className="mb-6 text-center text-3xl font-extrabold text-white lg:text-4xl">
        {allDone
          ? "¡Reto completado! 🏆"
          : `Episodio ${currentMission?.day}: ${currentMission?.title}`}
      </h2>

      <div className="relative overflow-hidden rounded-3xl border-2 border-fuchsia-400/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] p-6 shadow-2xl shadow-fuchsia-900/40 lg:p-8">
        <div className="flex items-center gap-6 overflow-x-auto">
          <Image
            src="/mascota-skooly.png"
            alt="Mascota Skooly"
            width={160}
            height={160}
            className="hidden h-32 w-32 flex-shrink-0 object-contain drop-shadow-[0_0_25px_rgba(217,70,239,0.35)] lg:block lg:h-40 lg:w-40"
          />

          <div className="flex items-start">
            {MISSIONS.map((mission, i) => {
              const isDone = done.has(mission.day);
              const unlocked = mission.day === 1 || done.has(mission.day - 1);
              const isCurrent = mission.day === firstAvailable;

              const node = (
                <div
                  className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 text-xl shadow-lg transition lg:h-16 lg:w-16 lg:text-2xl ${
                    isDone
                      ? "border-amber-300 bg-gradient-to-br from-fuchsia-500 to-amber-400"
                      : isCurrent
                      ? "animate-pulse border-fuchsia-300 bg-gradient-to-br from-fuchsia-500 to-purple-600"
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
                <div className="mt-3 w-20 text-center">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      isDone ? "text-amber-300" : isCurrent ? "text-fuchsia-300" : "text-white/40"
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
                <div key={mission.day} className="flex flex-shrink-0 items-start">
                  <div className="flex flex-col items-center">
                    {unlocked ? <Link href={`/dia/${mission.day}`}>{node}</Link> : node}
                    {label}
                  </div>
                  <div
                    className={`mt-7 h-1.5 w-6 flex-shrink-0 rounded-full sm:w-8 lg:mt-8 lg:w-10 ${
                      isDone
                        ? "bg-gradient-to-r from-fuchsia-500 to-amber-400"
                        : "bg-white/10"
                    }`}
                  />
                </div>
              );
            })}

            <div
              className={`mt-7 h-1.5 w-6 flex-shrink-0 rounded-full sm:w-8 lg:mt-8 lg:w-10 ${
                allDone ? "bg-gradient-to-r from-amber-400 to-yellow-300" : "bg-white/10"
              }`}
            />

            <div className="flex flex-col items-center">
              {allDone ? (
                <Link
                  href="/cofre"
                  className="flex h-16 w-16 flex-shrink-0 animate-bounce items-center justify-center drop-shadow-[0_0_18px_rgba(245,158,11,0.6)] lg:h-20 lg:w-20"
                >
                  <TreasureChestIcon locked={false} className="h-full w-full" />
                </Link>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center opacity-70 lg:h-20 lg:w-20">
                  <TreasureChestIcon locked className="h-full w-full" />
                </div>
              )}
              <div className="mt-3 w-20 text-center">
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
