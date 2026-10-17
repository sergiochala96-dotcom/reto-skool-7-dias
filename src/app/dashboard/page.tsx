import { getSidebarData } from "@/lib/sidebar-data";
import { TOTAL_DAYS, WELCOME_VIDEO_URL } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import ChallengePath from "@/components/ChallengePath";
import ChallengePathHorizontal from "@/components/ChallengePathHorizontal";
import Episode2Card from "@/components/Episode2Card";
import Avatar from "@/components/Avatar";
import SkoolyLogo from "@/components/SkoolyLogo";
import DayIntroVideo from "@/components/DayIntroVideo";
import MetaRegistrationEvent from "@/components/MetaRegistrationEvent";
import StartMissions from "@/components/StartMissions";

export default async function DashboardPage() {
  const {
    nombre,
    user,
    avatarUrl,
    admin,
    completedDays,
    welcomeVideoSeen,
    notifications,
    startMissions,
    startUnlocked,
  } = await getSidebarData();
  const completedList = Array.from(completedDays);
  const completedCount = completedList.length;

  const supabase = await createClient();

  if (!welcomeVideoSeen) {
    await supabase
      .from("profiles")
      .update({ welcome_video_seen: true })
      .eq("id", user.id);
  }

  // El Episodio 2 está bloqueado para todos. Solo el admin lo abre, usuario por usuario
  // desde el panel de admin (o en su propia cuenta con el botón de prueba):
  // episode2_locked_override = false => desbloqueado.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("episode2_locked_override")
    .eq("id", user.id)
    .single();
  const episode2Locked = profileRow?.episode2_locked_override !== false;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      {!welcomeVideoSeen && (
        <DayIntroVideo src={WELCOME_VIDEO_URL} closable={false} large />
      )}
      <MetaRegistrationEvent
        userId={user.id}
        isNew={Date.now() - new Date(user.created_at).getTime() < 15 * 60 * 1000}
      />
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={completedList}
        notifications={notifications}
        startUnlocked={startUnlocked}
      />

      <main className="flex-1 px-4 py-10 md:py-5">
        <div className="mx-auto max-w-2xl md:max-w-7xl">
          <div className="mb-8 text-center md:mb-9">
            <div className="mb-3 flex justify-center md:mb-2">
              <Avatar avatarUrl={avatarUrl} nombre={nombre} size={64} editable />
            </div>
            <p className="text-sm text-white/50 md:text-lg">Hola, {nombre} 👋</p>
            <h1 className="text-2xl font-bold text-white md:mt-0.5 md:text-4xl md:font-extrabold">
              Tu progreso en <SkoolyLogo />
            </h1>
            <p className="mt-1 text-sm text-white/60 md:mt-1.5 md:text-lg">
              {completedCount}/{TOTAL_DAYS} días completados
            </p>
          </div>

          <StartMissions initial={startMissions} startUnlocked={startUnlocked} />

          <ChallengePathHorizontal completedDays={completedList} startUnlocked={startUnlocked} />
          <div className="md:hidden">
            <ChallengePath completedDays={completedList} startUnlocked={startUnlocked} />
          </div>

          <Episode2Card locked={episode2Locked} admin={admin} />
        </div>
      </main>
    </div>
  );
}
