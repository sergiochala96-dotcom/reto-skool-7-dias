import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MISSIONS, TOTAL_DAYS } from "@/lib/challenge";
import { signOut } from "@/app/actions";
import { isAdmin } from "@/lib/admin";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("day")
    .eq("user_id", user.id);

  const completedDays = new Set((progress ?? []).map((p) => p.day));
  const completedCount = completedDays.size;
  const allDone = completedCount >= TOTAL_DAYS;
  const nombre =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Retador";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">Hola, {nombre} 👋</p>
            <h1 className="text-2xl font-bold text-white">Skooly</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin(user.email) && (
              <Link
                href="/admin"
                className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-400/20"
              >
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/70">Progreso</span>
            <span className="font-semibold text-white">
              {completedCount}/{TOTAL_DAYS} días
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all duration-700"
              style={{ width: `${(completedCount / TOTAL_DAYS) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MISSIONS.map((mission) => {
            const done = completedDays.has(mission.day);
            const unlocked = mission.day === 1 || completedDays.has(mission.day - 1);
            const card = (
              <div
                className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
                  done
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : unlocked
                    ? "border-fuchsia-400/40 bg-white/5 hover:border-fuchsia-400/70 hover:bg-white/10"
                    : "border-white/10 bg-white/[0.03] opacity-50"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">{mission.emoji}</span>
                  {done ? (
                    <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                      Completado ✓
                    </span>
                  ) : unlocked ? (
                    <span className="rounded-full bg-fuchsia-400/20 px-2 py-1 text-xs font-semibold text-fuchsia-300">
                      Disponible
                    </span>
                  ) : (
                    <span className="text-lg">🔒</span>
                  )}
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                  Día {mission.day}
                </p>
                <h2 className="mt-1 font-semibold text-white">{mission.title}</h2>
              </div>
            );

            return unlocked ? (
              <Link key={mission.day} href={`/dia/${mission.day}`}>
                {card}
              </Link>
            ) : (
              <div key={mission.day} className="cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          {allDone ? (
            <Link
              href="/cofre"
              className="flex items-center justify-center gap-3 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 p-5 font-semibold text-amber-200 shadow-lg shadow-amber-500/10 transition hover:brightness-110"
            >
              <span className="text-3xl">🗝️</span>
              ¡Completaste el reto! Abre el Cofre del Tesoro
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/40">
              <span className="text-3xl grayscale">🔒</span>
              El Cofre del Tesoro se desbloquea al completar los 7 días
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
