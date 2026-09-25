import { EPISODE_2_CHECKPOINTS, EPISODE_2_LABEL, EPISODE_2_NAME } from "@/lib/challenge";
import EpisodeLockToggle from "@/components/EpisodeLockToggle";

export default function Episode2Card({
  locked,
  admin,
}: {
  locked: boolean;
  admin: boolean;
}) {
  return (
    <div className="relative mx-auto mt-5 overflow-hidden rounded-3xl border-2 border-fuchsia-400/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] px-4 pb-8 pt-8 shadow-2xl shadow-fuchsia-900/40 sm:px-6 lg:px-8 lg:pb-10 lg:pt-12">
      {admin && <EpisodeLockToggle episode={2} locked={locked} />}

      <h2 className="mb-0 text-center text-base sm:text-lg lg:text-xl">
        <span className="font-bold text-fuchsia-300">{EPISODE_2_LABEL}</span>{" "}
        <span className="font-normal text-white/50">{EPISODE_2_NAME}</span>
      </h2>

      <div
        className={`mt-7 flex flex-wrap items-start justify-center gap-x-5 gap-y-6 sm:gap-x-8 ${
          locked ? "pointer-events-none select-none opacity-40 blur-[1px] grayscale" : ""
        }`}
      >
        {EPISODE_2_CHECKPOINTS.map((cp) => (
          <div key={cp.id} className="flex w-20 flex-col items-center sm:w-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-xl shadow-lg sm:h-16 sm:w-16 sm:text-2xl">
              {cp.emoji}
            </div>
            <p className="mt-3 line-clamp-2 text-center text-[11px] leading-tight text-white/60">
              {cp.title}
            </p>
          </div>
        ))}
      </div>

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-3xl bg-black/50 backdrop-blur-[1px]">
          <span className="text-4xl grayscale">🔒</span>
          <span className="text-lg font-semibold text-white/70 lg:text-xl">
            Episodio 2: Próximamente
          </span>
        </div>
      )}
    </div>
  );
}
