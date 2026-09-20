import { notFound, redirect } from "next/navigation";
import { getMission, TOTAL_DAYS } from "@/lib/challenge";
import { completeDay, uncompleteDay } from "@/app/actions";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";

export default async function DiaPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const day = Number(numero);
  const mission = getMission(day);
  if (!mission) notFound();

  const { nombre, user, avatarUrl, admin, completedDays } = await getSidebarData();

  const unlocked = day === 1 || completedDays.has(day - 1);
  if (!unlocked) redirect("/dashboard");

  const done = completedDays.has(day);
  const completeDayWithDay = completeDay.bind(null, day);
  const uncompleteDayWithDay = uncompleteDay.bind(null, day);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-4">
              <span className="text-5xl">{mission.emoji}</span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                  Día {mission.day} de {TOTAL_DAYS}
                </p>
                <h1 className="text-2xl font-bold text-white">{mission.title}</h1>
              </div>
            </div>

            <section className="mt-6">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-fuchsia-300">
                Objetivo
              </h2>
              <p className="text-white/80">{mission.objetivo}</p>
            </section>

            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fuchsia-300">
                Tareas
              </h2>
              <ul className="space-y-2">
                {mission.tareas.map((t, i) => (
                  <li key={i} className="flex gap-2 text-white/80">
                    <span className="text-fuchsia-400">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-fuchsia-300">
                Entregable
              </h2>
              <p className="text-white/80">{mission.entregable}</p>
            </section>

            <div className="mt-8">
              {done ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400/15 px-4 py-3 font-semibold text-emerald-300">
                    ✓ Misión completada
                  </div>
                  <form action={uncompleteDayWithDay}>
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                    >
                      Desmarcar como completada
                    </button>
                  </form>
                </div>
              ) : (
                <form action={completeDayWithDay}>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110"
                  >
                    Marcar misión como completada
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
