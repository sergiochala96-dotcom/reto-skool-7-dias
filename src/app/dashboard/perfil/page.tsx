import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions";
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
        coins={coins}
        lives={lives}
      />

      <main className="min-w-0 flex-1 px-4 py-10 md:px-6 md:py-5">
        {/* Estadísticas en la esquina superior derecha de la pantalla. */}
        <div className="mb-2 hidden justify-end md:flex">
          <StatsBar completedDays={completedList} coins={coins} lives={lives} />
        </div>

        <div className="mx-auto max-w-xl">
          <header className="mb-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-fuchsia-300">Perfil</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">Tu perfil</h1>
          </header>
          <ProfileForm nombre={nombre} email={user.email ?? ""} avatarUrl={avatarUrl} />

          {/* En el celular el menú lateral no existe: aquí quedan la administración y cerrar sesión. */}
          {admin && (
            <div className="mt-6 rounded-2xl border-2 border-amber-300/20 bg-amber-400/[0.05] p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-300">Administración</p>
              <div className="mt-2 flex flex-col">
                {[
                  ["/admin", "🛠️ Panel de admin"],
                  ["/admin/origen", "📈 Origen del tráfico"],
                  ["/admin/notificaciones", "✉️ Escribir notificaciones"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-lg px-2 py-2.5 text-sm font-semibold text-amber-200/90 transition hover:bg-white/5"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-2xl border-2 border-white/15 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white/80 transition hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
