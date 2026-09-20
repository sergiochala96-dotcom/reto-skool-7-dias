import Link from "next/link";
import { MISSIONS, TOTAL_DAYS } from "@/lib/challenge";

const AMPLITUDE = 100;
const SPACING = 140;
const NODE = 76;
const OFFSETS = [0, 1, 1.4, 1, 0, -1, -1.4]; // patrón zigzag por día

export default function ChallengePath({
  completedDays,
}: {
  completedDays: number[];
}) {
  const done = new Set(completedDays);
  const allDone = done.size >= TOTAL_DAYS;
  const firstAvailable = MISSIONS.find(
    (m) => !done.has(m.day) && (m.day === 1 || done.has(m.day - 1))
  )?.day;

  const points = MISSIONS.map((m, i) => ({
    x: OFFSETS[i] * AMPLITUDE,
    y: i * SPACING + NODE / 2,
    mission: m,
  }));
  const chestPoint = {
    x: 0,
    y: MISSIONS.length * SPACING + NODE / 2,
  };

  const width = AMPLITUDE * 2 * 1.4 + NODE + 40;
  const height = chestPoint.y + NODE;
  const cx = width / 2;

  const segments: { d: string; active: boolean }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const midY = (a.y + b.y) / 2;
    segments.push({
      d: `M ${cx + a.x} ${a.y} C ${cx + a.x} ${midY}, ${cx + b.x} ${midY}, ${cx + b.x} ${b.y}`,
      active: done.has(a.mission.day),
    });
  }
  {
    const a = points[points.length - 1];
    const midY = (a.y + chestPoint.y) / 2;
    segments.push({
      d: `M ${cx + a.x} ${a.y} C ${cx + a.x} ${midY}, ${cx + chestPoint.x} ${midY}, ${cx + chestPoint.x} ${chestPoint.y}`,
      active: allDone,
    });
  }

  return (
    <div className="mx-auto max-w-2xl overflow-x-auto pb-8">
      <div className="relative mx-auto" style={{ width, height: height + 40 }}>
        <svg
          width={width}
          height={height + 40}
          className="absolute inset-0"
          aria-hidden
        >
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={s.active ? undefined : "2 14"}
              stroke={s.active ? "url(#gradGold)" : "rgba(255,255,255,0.15)"}
            />
          ))}
          <defs>
            <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {points.map((p) => {
          const isDone = done.has(p.mission.day);
          const unlocked = p.mission.day === 1 || done.has(p.mission.day - 1);
          const isCurrent = p.mission.day === firstAvailable;

          const node = (
            <div
              className={`group relative flex items-center justify-center rounded-full border-4 text-3xl shadow-lg transition ${
                isDone
                  ? "border-amber-300 bg-gradient-to-br from-fuchsia-500 to-amber-400"
                  : isCurrent
                  ? "animate-pulse border-fuchsia-300 bg-gradient-to-br from-fuchsia-500 to-purple-600"
                  : unlocked
                  ? "border-white/30 bg-white/10 hover:bg-white/20"
                  : "border-white/10 bg-white/5 grayscale"
              }`}
              style={{ width: NODE, height: NODE }}
            >
              {isDone ? "✓" : unlocked ? p.mission.emoji : "🔒"}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white/80 opacity-0 transition group-hover:opacity-100">
                Día {p.mission.day}: {p.mission.title}
              </span>
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow">
                  EMPEZAR
                </span>
              )}
            </div>
          );

          return (
            <div
              key={p.mission.day}
              className="absolute"
              style={{
                left: cx + p.x - NODE / 2,
                top: p.y - NODE / 2,
              }}
            >
              {unlocked ? <Link href={`/dia/${p.mission.day}`}>{node}</Link> : node}
            </div>
          );
        })}

        <div
          className="absolute"
          style={{
            left: cx + chestPoint.x - NODE / 2,
            top: chestPoint.y - NODE / 2,
          }}
        >
          {allDone ? (
            <Link
              href="/cofre"
              className="flex animate-bounce items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-400 to-yellow-300 text-4xl shadow-xl shadow-amber-500/30"
              style={{ width: NODE + 16, height: NODE + 16 }}
            >
              🎁
            </Link>
          ) : (
            <div
              className="flex items-center justify-center rounded-full border-4 border-white/10 bg-white/5 text-3xl grayscale"
              style={{ width: NODE + 16, height: NODE + 16 }}
            >
              🔒
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
