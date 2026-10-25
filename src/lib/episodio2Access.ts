import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSidebarData, type SidebarData } from "@/lib/sidebar-data";

// Datos del menú lateral + comprobación de que la persona puede ver el Episodio 2:
// el admin, quien tiene plan Premium o VIP, o quien recibió el acceso a mano desde el panel de
// admin (episode2_locked_override = false). Cualquier otra persona va a la pantalla de planes.
export async function requireEpisode2Access(): Promise<SidebarData> {
  const data = await getSidebarData();
  if (data.admin || data.plan !== "standard") return data;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("episode2_locked_override")
    .eq("id", data.user.id)
    .single();
  if (profile?.episode2_locked_override !== false) redirect("/dashboard/planes");
  return data;
}
