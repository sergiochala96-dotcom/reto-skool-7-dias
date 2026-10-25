import Link from "next/link";
import { EPISODE_2_CHECKPOINTS, EPISODE_2_LABEL, EPISODE_2_NAME } from "@/lib/challenge";
import EpisodeLockToggle from "@/components/EpisodeLockToggle";

// Camino vertical con curvas del celular (como el del Episodio 1, pero en azul).
const AMPLITUDE = 55;
const SPACING = 150;
const NODE = 76;
const TOP_BUFFER = 12;
const OFFSETS = [0, 1.2, 0, -1.2]; // zigzag por sección

function Episode2Path({ locked }: { locked: boolean }) {
  const points = EPISODE_2_CHECKPOINTS.map((cp, i) => ({
    x: OFFSETS[i % OFFSETS.length] * AMPLITUDE,
    y: i * SPACING + NODE / 2 + TOP_BUFFER,
    cp,
  }));
  const width = AMPLITUDE * 2 * 1.2 + NODE + 100;
  const height = points[points.length - 1].y + NODE / 2 + 56;
  const cx = width / 2;

  const segments = points.slice(0, -1).map((a, i) => {
    const b = points[i + 1];
    const midY = (a.y + b.y) / 2;
    return `M ${cx + a.x} ${a.y} C ${cx + a.x} ${midY}, ${cx + b.x} ${midY}, ${cx + b.x} ${b.y}`;
  });

  return (
    <div className="mt-6 overflow-x-auto md:hidden">
      <div className="relative mx-auto" style={{ width, height }}>
        <svg width={width} height={height} className="absolute inset-0" aria-hidden>
          {segments.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray="2 14"
              stroke="rgba(125,211,252,0.35)"
            />
          ))}
        </svg>

        {points.map((p) => (
          <Link
            key={p.cp.id}
            href={`/episodio-2/${p.cp.id}`}
            tabIndex={locked ? -1 : undefined}
            className="absolute flex flex-col items-center"
            style={{
              left: cx + p.x - NODE / 2 - 26,
              top: p.y - NODE / 2,
              width: NODE + 52,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full border-4 border-sky-300 bg-gradient-to-br from-sky-500 to-blue-700 text-3xl shadow-lg transition active:scale-95"
              style={{ width: NODE, height: NODE }}
            >
              {p.cp.emoji}
            </div>
            <div className="mt-2 w-28 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-300">
                Sección {EPISODE_2_CHECKPOINTS.indexOf(p.cp) + 1}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-white/70">{p.cp.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// El Episodio 2 lo ve todo el mundo. Si la persona no tiene plan Premium (ni acceso abierto a mano),
// se muestra borroso con un candado y el botón para ver los planes.
export default function Episode2Card({
  locked,
  admin,
}: {
  locked: boolean;
  admin: boolean;
}) {
  return (
    <div
      className={`relative mx-auto mt-5 overflow-hidden rounded-3xl border-2 border-sky-400/40 bg-gradient-to-br from-[#10315e] to-[#0c1b3d] px-4 pb-8 pt-8 shadow-2xl shadow-sky-900/40 max-md:mx-4 max-md:max-w-2xl sm:px-6 md:border-fuchsia-400/30 md:from-[#2a1150] md:to-[#1a0b2e] md:shadow-fuchsia-900/40 lg:mt-8 lg:px-8 lg:pb-9 lg:pt-10 ${
        locked ? "min-h-[17rem]" : ""
      }`}
    >
      {admin && <EpisodeLockToggle locked={locked} />}

      <h2 className="mb-0 text-center text-base sm:text-lg lg:text-xl">
        <span className="font-bold text-sky-300 md:text-fuchsia-300">{EPISODE_2_LABEL}</span>{" "}
        <span className="font-normal text-white/60 md:text-white/50">{EPISODE_2_NAME}</span>
      </h2>

      <div className={locked ? "pointer-events-none select-none opacity-40 blur-[1px] grayscale" : ""}>
        {/* Celular: camino vertical con curvas. */}
        <Episode2Path locked={locked} />

        {/* Computadora: fila de puntos. */}
        <div className="mt-7 flex flex-wrap items-start justify-center gap-x-5 gap-y-6 max-md:hidden sm:gap-x-8 lg:mt-8">
          {EPISODE_2_CHECKPOINTS.map((cp) => (
            // Con el episodio abierto, cada punto lleva a su sección de contenido.
            <Link
              key={cp.id}
              href={`/episodio-2/${cp.id}`}
              tabIndex={locked ? -1 : undefined}
              className="group flex w-24 flex-col items-center sm:w-28"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-fuchsia-300/50 bg-white/10 text-xl shadow-lg transition group-hover:scale-110 group-hover:border-fuchsia-300 sm:h-16 sm:w-16 sm:text-2xl lg:h-14 lg:w-14">
                {cp.emoji}
              </div>
              <p className="mt-3 line-clamp-2 text-center text-[11px] font-semibold leading-tight text-white/80 group-hover:text-white">
                {cp.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-3xl bg-black/50 px-6 text-center backdrop-blur-[1px]">
          <span className="text-3xl grayscale lg:text-4xl">🔒</span>
          <p className="text-base font-semibold leading-snug text-white/80 lg:text-lg">
            Desbloquea el Episodio 2 con el
            <br />
            <span className="font-extrabold text-white">plan Premium</span>
          </p>
          <Link
            href="/dashboard/planes"
            className="mt-1 rounded-full bg-purple-200 px-8 py-2.5 text-base font-extrabold text-purple-900 shadow-lg transition hover:bg-purple-100 active:scale-[0.98]"
          >
            Desbloquear
          </Link>
        </div>
      )}
    </div>
  );
}
