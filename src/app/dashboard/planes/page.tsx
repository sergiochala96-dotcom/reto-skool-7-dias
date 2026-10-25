import type { Metadata } from "next";
import { Heading, PlansGrid } from "@/components/PlanesSection";
import Sidebar from "@/components/Sidebar";
import { getSidebarData } from "@/lib/sidebar-data";
import "../../ventas.css";

export const metadata: Metadata = {
  title: "Planes | Skooly",
};

// Pantalla interna con solo los planes, con la misma identidad que la portada.
export default async function PlanesPanelPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan } =
    await getSidebarData();

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0614] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
        notifications={notifications}
        plan={plan}
      />

      <main className="ventas min-w-0 flex-1 px-4 py-14 sm:py-20">
        <div className="v-glow v-glow-violet left-1/2 top-0 h-[28rem] w-[44rem] -translate-x-1/2" />
        <div className="v-glow v-glow-blue -right-40 top-1/2 h-[24rem] w-[24rem]" />

        <div className="relative mx-auto max-w-6xl">
          <Heading
            eyebrow="Planes"
            title="Elige cómo quieres avanzar"
            text="Empieza gratis. Si quieres seguir después del reto o ir acompañado, tienes más opciones."
          />
          <div className="mt-16">
            <PlansGrid current={plan} userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
