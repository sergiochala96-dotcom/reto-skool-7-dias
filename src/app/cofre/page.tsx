import { redirect } from "next/navigation";
import { TOTAL_DAYS } from "@/lib/challenge";
import TreasureChest from "@/components/TreasureChest";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";

export default async function CofrePage() {
  const { nombre, user, admin, completedDays } = await getSidebarData();

  if (completedDays.size < TOTAL_DAYS) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        admin={admin}
        completedDays={Array.from(completedDays)}
      />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <TreasureChest nombre={nombre} />
      </main>
    </div>
  );
}
