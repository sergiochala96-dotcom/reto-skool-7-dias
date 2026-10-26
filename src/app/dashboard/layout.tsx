import Sidebar from "@/components/Sidebar";
import { getSidebarData } from "@/lib/sidebar-data";

// El menú (lateral en computadora; barras de arriba y abajo en celular) vive aquí y no en cada
// página: al pasar de Inicio a Trivia, Tienda, etc. el menú se queda quieto y solo cambia el
// contenido. Los datos se comparten con la página (getSidebarData se lee una sola vez por petición).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();

  return (
    <div className="flex min-h-screen flex-col bg-ink md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
        notifications={notifications}
        plan={plan}
        coins={coins}
        lives={lives}
      />
      {children}
    </div>
  );
}
