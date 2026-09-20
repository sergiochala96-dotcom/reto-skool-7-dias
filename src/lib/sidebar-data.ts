import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

export type SidebarData = {
  user: User;
  nombre: string;
  completedDays: Set<number>;
  admin: boolean;
};

export async function getSidebarData(): Promise<SidebarData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("day")
    .eq("user_id", user.id);

  const nombre =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Retador";

  return {
    user,
    nombre,
    completedDays: new Set((progress ?? []).map((p) => p.day)),
    admin: isAdmin(user.email),
  };
}
