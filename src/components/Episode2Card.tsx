import Link from "next/link";
import { EPISODE_2_CHECKPOINTS, EPISODE_2_LABEL, EPISODE_2_NAME } from "@/lib/challenge";
import EpisodeLockToggle from "@/components/EpisodeLockToggle";
import WorkshopUnlock from "@/components/WorkshopUnlock";

export default function Episode2Card({
  locked,
  admin,
}: {
  locked: boolean;
  admin: boolean;
}) {
  return (
    <div className={`relative mx-auto mt-5 overflow-hidden lg:mt-8 rounded-3xl border-2 border-fuchsia-400/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] px-4 pb-8 pt-8 shadow-2xl shadow-fuchsia-900/40 sm:px-6 lg:px-8 lg:pb-9 lg:pt-10 ${locked ? "min-h-[17rem]" : ""}`}>
      {admin && <EpisodeLockToggle locked={locked} />}

      <h2 className="mb-0 text-center text-base sm:text-lg lg:text-xl">
        <span className="font-bold text-fuchsia-300">{EPISODE_2_LABEL}</span>{" "}
        <span className="font-normal text-white/50">{EPISODE_2_NAME}</span>
      </h2>

      <div
        className={`mt-7 lg:mt-8 flex flex-wrap items-start justify-center gap-x-5 gap-y-6 sm:gap-x-8 ${
          locked ? "pointer-events-none select-none opacity-40 blur-[1px] grayscale" : ""
        }`}
      >
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

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-3xl bg-black/50 backdrop-blur-[1px]">
          <span className="text-3xl grayscale lg:text-4xl">🔒</span>
          <WorkshopUnlock admin={admin} />
        </div>
      )}
    </div>
  );
}
