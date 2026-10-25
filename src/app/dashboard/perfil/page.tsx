import type { Metadata } from "next";
import ProfileForm from "@/components/ProfileForm";
import Sidebar from "@/components/Sidebar";
import StatsBar from "@/components/StatsBar";
import { getSidebarData } from "@/lib/sidebar-data";

export const metadata: Metadata = {
  title: "Perfil | Skooly",
};

// Perfil: cambiar la foto y el nombre (el correo está bloqueado).
export default async function PerfilPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  const completedList = Array.from(completedDays);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={completedList}
        notifications={notifications}
        plan={plan}
      />

      <main className="min-w-0 flex-1 px-4 py-10 md:py-6">
        <div className="mx-auto max-w-xl">
          <div className="mb-2 hidden justify-end md:flex">
            <StatsBar completedDays={completedList} coins={coins} lives={lives} />
          </div>
          <header className="mb-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-fuchsia-300">Perfil</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">Tu perfil</h1>
          </header>
          <ProfileForm nombre={nombre} email={user.email ?? ""} avatarUrl={avatarUrl} />
        </div>
      </main>
    </div>
  );
}
