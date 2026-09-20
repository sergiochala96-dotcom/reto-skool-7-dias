import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMission, TOTAL_DAYS } from "@/lib/challenge";
import { getMissionSections, type Answers } from "@/lib/missionFields";
import { saveMissionAnswers } from "@/app/actions";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import MissionForm from "@/components/MissionForm";

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
  const saveAction = saveMissionAnswers.bind(null, day);

  const supabase = await createClient();
  const { data: answerRow } = await supabase
    .from("mission_answers")
    .select("answers")
    .eq("user_id", user.id)
    .eq("day", day)
    .maybeSingle();

  const initialAnswers = (answerRow?.answers ?? {}) as Answers;
  const sections = getMissionSections(day);

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
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
          >
            ← Volver al inicio
          </Link>

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

            <p className="mb-6 text-white/70">{mission.intro}</p>

            {done && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-400/15 px-4 py-3 font-semibold text-emerald-300">
                ✓ Misión completada
              </div>
            )}

            <MissionForm
              day={day}
              totalDays={TOTAL_DAYS}
              sections={sections}
              initialAnswers={initialAnswers}
              saveAction={saveAction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
