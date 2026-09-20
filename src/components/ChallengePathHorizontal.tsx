import Link from "next/link";
import { MISSIONS, TOTAL_DAYS } from "@/lib/challenge";

export default function ChallengePathHorizontal({
  completedDays,
}: {
  completedDays: number[];
}) {
  const done = new Set(completedDays);
  const allDone = done.size >= TOTAL_DAYS;
  const firstAvailable = MISSIONS.find(
    (m) => !done.has(m.day) && (m.day === 1 || done.has(m.day - 1))
  )?.day;

  return (
    <div className="mx-auto mb-12 hidden overflow-x-auto md:block">
      <div className="flex items-center justify-center px-4 py-8">
        {MISSIONS.map((mission, i) => {
          const isDone = done.has(mission.day);
          const unlocked = mission.day === 1 || done.has(mission.day - 1);
          const isCurrent = mission.day === firstAvailable;

          const node = (
            <div
              className={`group relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 text-xl shadow-lg transition lg:h-16 lg:w-16 lg:text-2xl ${
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
              <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white/80 opacity-0 transition group-hover:opacity-100">
                Día {mission.day}: {mission.title}
              </span>
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow">
                  EMPEZAR
                </span>
              )}
            </div>
          );

          return (
            <div key={mission.day} className="flex flex-shrink-0 items-center">
              {unlocked ? <Link href={`/dia/${mission.day}`}>{node}</Link> : node}
              <div
                className={`h-1.5 w-6 flex-shrink-0 rounded-full sm:w-8 lg:w-12 ${
                  isDone
                    ? "bg-gradient-to-r from-fuchsia-500 to-amber-400"
                    : "bg-white/10"
                }`}
              />
            </div>
          );
        })}

        {allDone ? (
          <Link
            href="/cofre"
            className="flex h-16 w-16 flex-shrink-0 animate-bounce items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-400 to-yellow-300 text-2xl shadow-xl shadow-amber-500/30 lg:h-20 lg:w-20 lg:text-3xl"
          >
            🎁
          </Link>
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-white/10 bg-white/5 text-xl grayscale lg:h-20 lg:w-20 lg:text-2xl">
            🔒
          </div>
        )}
      </div>
    </div>
  );
}
