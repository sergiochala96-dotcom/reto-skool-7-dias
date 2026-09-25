import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDayIntroVideo, getMission, TOTAL_DAYS } from "@/lib/challenge";
import { getMissionSections, type Answers } from "@/lib/missionFields";
import { saveMissionAnswers } from "@/app/actions";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import MissionForm from "@/components/MissionForm";
import DayIntroVideo from "@/components/DayIntroVideo";

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
  const introVideo = getDayIntroVideo(day);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      {introVideo && <DayIntroVideo key={day} src={introVideo} />}
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
      />

      <main className="flex-1 px-4 py-10 lg:px-10">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <Link
            href="/dashboard"
            aria-label="Volver al inicio"
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ←
          </Link>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl lg:p-10">
            <MissionForm
              day={day}
              totalDays={TOTAL_DAYS}
              emoji={mission.emoji}
              title={mission.title}
              intro={mission.intro}
              completed={done}
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
