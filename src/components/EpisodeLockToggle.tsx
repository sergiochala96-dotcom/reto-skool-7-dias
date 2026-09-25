import { toggleEpisodeLock } from "@/app/actions";

export default function EpisodeLockToggle({
  episode,
  locked,
}: {
  episode: number;
  locked: boolean;
}) {
  const action = toggleEpisodeLock.bind(null, episode);

  return (
    <form action={action} className="absolute right-4 top-4 z-20">
      <button
        type="submit"
        title={
          locked ? `Desbloquear Episodio ${episode}` : `Bloquear Episodio ${episode}`
        }
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
          locked
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
            : "border-red-400/40 bg-red-400/10 text-red-300 hover:bg-red-400/20"
        }`}
      >
        {locked ? "🔓 Desbloquear" : "🔒 Bloquear"}
      </button>
    </form>
  );
}
