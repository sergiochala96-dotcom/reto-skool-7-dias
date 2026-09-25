import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

export type SidebarData = {
  user: User;
  nombre: string;
  avatarUrl: string | null;
  completedDays: Set<number>;
  admin: boolean;
  welcomeVideoSeen: boolean;
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

  // La foto se lee de la tabla profiles (no de user_metadata): al iniciar
  // sesión con Google, Supabase re-sincroniza user_metadata con los datos
  // de Google en cada login y sobreescribía la foto que el usuario había
  // subido. profiles.avatar_url solo lo escribe nuestra propia función.
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, welcome_video_seen")
    .eq("id", user.id)
    .single();

  const nombre =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Retador";
  const avatarUrl = profile?.avatar_url ?? null;

  return {
    user,
    nombre,
    avatarUrl,
    completedDays: new Set((progress ?? []).map((p) => p.day)),
    admin: isAdmin(user.email),
    welcomeVideoSeen: profile?.welcome_video_seen ?? false,
  };
}
