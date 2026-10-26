import Link from "next/link";
import { isDayUnlocked, MISSIONS, TOTAL_DAYS } from "@/lib/challenge";
import FitWidth from "@/components/FitWidth";
import MascotCashButton from "@/components/MascotCashButton";
import TreasureChestIcon from "@/components/TreasureChestIcon";

// Camino vertical con curvas del Episodio 1 para computadora: un punto por día, con su tarjeta del lado
// contrario a la curva (día en amarillo, título y, según el caso, "Completado" o el botón de empezar).
// Todo se coloca con medidas fijas (como el camino del celular) y se reduce si falta ancho.
const WIDTH = 780;
const AMPLITUDE = 92;
const SPACING = 175;
const NODE = 84;
const TOP = 56;
const CARD_W = 250;
const CARD_GAP = 24;
const OFFSETS = [0, 1, 1.4, 1, 0, -1, -1.4];
const MASCOT = 170;
const MASCOT_DAYS = [0, 4]; // junto a los días 1 y 5, que tienen el lado izquierdo libre

export default function ChallengePathDesktop({ completedDays }: { completedDays: number[] }) {
  const done = new Set(completedDays);
  const allDone = done.size >= TOTAL_DAYS;
  const firstAvailable = MISSIONS.find((m) => !done.has(m.day) && isDayUnlocked(m.day, done))?.day;

  const cx = WIDTH / 2;
  const points = MISSIONS.map((m, i) => ({
    x: OFFSETS[i] * AMPLITUDE,
    y: i * SPACING + NODE / 2 + TOP,
    mission: m,
  }));
  const chest = { x: 0, y: MISSIONS.length * SPACING + NODE / 2 + TOP };
  const height = chest.y + NODE / 2 + 70;

  const all = [...points, chest];
  const segments = all.slice(0, -1).map((a, i) => {
    const b = all[i + 1];
    const mid = (a.y + b.y) / 2;
    return {
      d: `M ${cx + a.x} ${a.y} C ${cx + a.x} ${mid}, ${cx + b.x} ${mid}, ${cx + b.x} ${b.y}`,
      active: i < points.length ? done.has(points[i].mission.day) : allDone,
    };
  });

  return (
    <FitWidth width={WIDTH} height={height}>
      <div className="relative" style={{ width: WIDTH, height }}>
        <svg width={WIDTH} height={height} className="absolute inset-0" aria-hidden>
          <defs>
            <linearGradient id="gradGoldDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
          </defs>
          {segments.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={s.active ? undefined : "2 14"}
              stroke={s.active ? "url(#gradGoldDesktop)" : "rgba(255,255,255,0.16)"}
            />
          ))}
        </svg>

        {/* La mascota va solo donde no hay tarjetas ni puntos: a la izquierda de los días 1 y 5. */}
        {MASCOT_DAYS.map((i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: 40, top: points[i].y - MASCOT / 2 + 20, width: MASCOT, height: MASCOT }}
          >
            <MascotCashButton className="h-full w-full" />
          </div>
        ))}

        {points.map((p) => {
          const m = p.mission;
          const isDone = done.has(m.day);
          const unlocked = isDayUnlocked(m.day, done);
          const isCurrent = m.day === firstAvailable;
          // Tarjeta del lado contrario a la curva (a la derecha si el punto va en el centro).
          const cardOnLeft = p.x > 0;
          const cardLeft = cardOnLeft
            ? cx + p.x - NODE / 2 - CARD_GAP - CARD_W
            : cx + p.x + NODE / 2 + CARD_GAP;
          const reward = m.day === TOTAL_DAYS ? 60 : 10;

          const node = (
            <div
              className={`relative flex items-center justify-center rounded-full text-3xl transition ${
                isDone
                  ? "bg-violet-600 text-4xl font-extrabold text-white shadow-[0_0_0_5px_var(--color-ink),0_0_0_9px_#fcd34d]"
                  : isCurrent
                  ? "animate-pulse bg-violet-500 shadow-[0_0_0_5px_var(--color-ink),0_0_0_9px_#c4b5fd]"
                  : unlocked
                  ? "bg-surface shadow-[0_0_0_5px_var(--color-ink),0_0_0_7px_rgba(255,255,255,0.25)] hover:bg-surface-2"
                  : "bg-surface opacity-70 shadow-[0_0_0_5px_var(--color-ink),0_0_0_7px_rgba(255,255,255,0.1)] grayscale"
              }`}
              style={{ width: NODE, height: NODE }}
            >
              {isDone ? "✓" : unlocked ? m.emoji : "🔒"}
              {isCurrent && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-900 shadow">
                  EMPEZAR
                </span>
              )}
            </div>
          );

          return (
            <div key={m.day}>
              <div
                className="absolute"
                style={{ left: cx + p.x - NODE / 2, top: p.y - NODE / 2, width: NODE, height: NODE }}
              >
                {unlocked ? <Link href={`/dia/${m.day}`}>{node}</Link> : node}
              </div>

              <div
                className={`absolute rounded-2xl border p-4 ${
                  isCurrent ? "border-violet-300/50 bg-surface-2" : "border-white/10 bg-surface"
                } ${!unlocked ? "opacity-60" : ""}`}
                style={{ left: cardLeft, top: p.y - 46, width: CARD_W }}
              >
                <p className="text-xs font-extrabold uppercase tracking-wide text-amber-300">Día {m.day}</p>
                <p className="mt-0.5 text-base font-extrabold leading-tight text-white">{m.title}</p>
                {isDone ? (
                  <p className="mt-2.5 text-xs font-bold text-emerald-400">
                    ✓ Completado · +{reward} monedas
                  </p>
                ) : unlocked ? (
                  <Link
                    href={`/dia/${m.day}`}
                    className="mt-3 inline-block rounded-xl bg-amber-300 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-slate-900 transition hover:bg-amber-200"
                  >
                    Empezar día {m.day}
                  </Link>
                ) : (
                  <span className="mt-3 inline-block rounded-xl bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white/40">
                    🔒 Bloqueado
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <div
          className="absolute flex flex-col items-center"
          style={{ left: cx - 60, top: chest.y - 44, width: 120 }}
        >
          {allDone ? (
            <Link
              href="/cofre"
              className="flex h-[88px] w-[88px] animate-bounce items-center justify-center drop-shadow-[0_0_18px_rgba(245,158,11,0.6)]"
            >
              <TreasureChestIcon locked={false} className="h-full w-full" />
            </Link>
          ) : (
            <div className="flex h-[88px] w-[88px] items-center justify-center opacity-70">
              <TreasureChestIcon locked className="h-full w-full" />
            </div>
          )}
          <p className={`mt-2 text-xs font-extrabold uppercase tracking-wide ${allDone ? "text-amber-300" : "text-white/40"}`}>
            Cofre
          </p>
          <p className="text-xs text-white/60">Premio final</p>
        </div>
      </div>
    </FitWidth>
  );
}
