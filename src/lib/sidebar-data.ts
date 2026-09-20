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

  // Solo confiamos en fotos subidas por nuestra propia función (bucket de
  // Storage). Google (u otros proveedores OAuth) también escriben su propio
  // "avatar_url" en user_metadata, pero ese dominio no está permitido para
  // el optimizador de imágenes y no fue elegido por el usuario en la app.
  const rawAvatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const supabaseStoragePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/`;
  const avatarUrl =
    rawAvatarUrl && rawAvatarUrl.startsWith(supabaseStoragePrefix)
      ? rawAvatarUrl
      : null;

  return {
    user,
    nombre,
    avatarUrl,
    completedDays: new Set((progress ?? []).map((p) => p.day)),
    admin: isAdmin(user.email),
  };
}
