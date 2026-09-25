import { getSidebarData } from "@/lib/sidebar-data";
import { TOTAL_DAYS, WELCOME_VIDEO_URL } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import ChallengePath from "@/components/ChallengePath";
import ChallengePathHorizontal from "@/components/ChallengePathHorizontal";
import Avatar from "@/components/Avatar";
import SkoolyLogo from "@/components/SkoolyLogo";
import DayIntroVideo from "@/components/DayIntroVideo";

export default async function DashboardPage() {
  const { nombre, user, avatarUrl, admin, completedDays, welcomeVideoSeen } =
    await getSidebarData();
  const completedList = Array.from(completedDays);
  const completedCount = completedList.length;

  if (!welcomeVideoSeen) {
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ welcome_video_seen: true })
      .eq("id", user.id);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      {!welcomeVideoSeen && <DayIntroVideo src={WELCOME_VIDEO_URL} />}
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={completedList}
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-2xl md:max-w-7xl">
          <div className="mb-8 text-center md:mb-10">
            <div className="mb-3 flex justify-center">
              <Avatar avatarUrl={avatarUrl} nombre={nombre} size={72} editable />
            </div>
            <p className="text-sm text-white/50 md:text-xl">Hola, {nombre} 👋</p>
            <h1 className="text-2xl font-bold text-white md:mt-1 md:text-5xl md:font-extrabold">
              Tu progreso en <SkoolyLogo />
            </h1>
            <p className="mt-1 text-sm text-white/60 md:mt-3 md:text-xl">
              {completedCount}/{TOTAL_DAYS} días completados
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:mt-6">
              <p className="text-sm text-white/60 md:text-base">
                Si aún no has creado tu Skool, hazlo con este botón:
              </p>
              <a
                href="https://www.skool.com/signup?ref=182fe0d3c1db4272a1f3e479073168be"
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:brightness-105 md:text-base"
              >
                Crear mi Skool
              </a>
            </div>
          </div>

          <ChallengePathHorizontal completedDays={completedList} />
          <div className="md:hidden">
            <ChallengePath completedDays={completedList} />
          </div>
        </div>
      </main>
    </div>
  );
}
