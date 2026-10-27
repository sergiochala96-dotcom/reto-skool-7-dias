import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions";
import InstallAppRow from "@/components/InstallAppRow";
import ProfileForm from "@/components/ProfileForm";
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
    <>

      <main className="min-w-0 flex-1 px-4 py-10 md:px-6 md:py-5">
        {/* Estadísticas en la esquina superior derecha de la pantalla. */}
        <div className="mb-2 hidden justify-end md:flex">
          <StatsBar completedDays={completedList} coins={coins} lives={lives} />
        </div>

        <div className="mx-auto max-w-xl">
          <header className="mb-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-violet-300">Perfil</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">Tu perfil</h1>
          </header>
          <ProfileForm nombre={nombre} email={user.email ?? ""} avatarUrl={avatarUrl} />

          <InstallAppRow />

          <Link
            href="/dashboard?guia=1"
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border-2 border-white/15 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/10"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-2xl">🧭</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-white">Ver la guía de inicio</span>
              <span className="block text-xs text-white/55">Los 3 pasos para empezar, otra vez.</span>
            </span>
          </Link>

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
    </>
  );
}
