import { toggleEpisode2LockOverride } from "@/app/actions";

export default function EpisodeLockToggle({ locked }: { locked: boolean }) {
  return (
    <form action={toggleEpisode2LockOverride} className="absolute right-4 top-4 z-20">
      <button
        type="submit"
        title={
          locked
            ? "Desbloquear Episodio 2 (solo en mi cuenta, para pruebas)"
            : "Bloquear Episodio 2 (solo en mi cuenta, para pruebas)"
        }
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
          locked
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
            : "border-red-400/40 bg-red-400/10 text-red-300 hover:bg-red-400/20"
        }`}
      >
        {locked ? "🔓 Desbloquear (test)" : "🔒 Bloquear (test)"}
      </button>
    </form>
  );
}
