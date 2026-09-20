import { getSidebarData } from "@/lib/sidebar-data";
import { TOTAL_DAYS } from "@/lib/challenge";
import Sidebar from "@/components/Sidebar";
import ChallengePath from "@/components/ChallengePath";
import ChallengePathHorizontal from "@/components/ChallengePathHorizontal";

export default async function DashboardPage() {
  const { nombre, user, admin, completedDays } = await getSidebarData();
  const completedList = Array.from(completedDays);
  const completedCount = completedList.length;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        admin={admin}
        completedDays={completedList}
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-2xl md:max-w-6xl">
          <div className="mb-8 text-center">
            <p className="text-sm text-white/50">Hola, {nombre} 👋</p>
            <h1 className="text-2xl font-bold text-white">
              Tu progreso en Skooly
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {completedCount}/{TOTAL_DAYS} días completados
            </p>
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
