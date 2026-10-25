import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { detectDevice } from "@/lib/device";
import { effectivePlan, type PlanId } from "@/lib/planes";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

export type SidebarNotification = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

export type SidebarData = {
  user: User;
  nombre: string;
  avatarUrl: string | null;
  completedDays: Set<number>;
  admin: boolean;
  welcomeVideoSeen: boolean;
  notifications: SidebarNotification[];
  // Plan de la persona (standard, premium o vip).
  plan: PlanId;
  // Monedas de oro y vidas de la persona.
  coins: number;
  lives: number;
  // Misiones de inicio: si ya tocó los botones de unirse a WhatsApp y a Skool.
  startMissions: { skool: boolean; whatsapp: boolean };
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
    .select("avatar_url, welcome_video_seen, last_seen_date, last_device, joined_skool_at, joined_whatsapp_at, plan, plan_expires_at, coins, lives")
    .eq("id", user.id)
    .single();

  // Última visita: solo se guarda la FECHA y únicamente cuando cambia el día, así que es
  // como máximo una escritura pequeña por persona al día (no se acumula ningún historial).
  // El dispositivo (computadora, Android, iPhone) se actualiza solo cuando cambia.
  const today = new Date().toISOString().slice(0, 10);
  const device = detectDevice((await headers()).get("user-agent"));
  if (profile && (profile.last_seen_date !== today || profile.last_device !== device)) {
    await supabase
      .from("profiles")
      .update({ last_seen_date: today, last_device: device })
      .eq("id", user.id);
  }

  // Notificaciones del admin (más recientes primero) y cuáles ya leyó este usuario.
  const [{ data: notifs }, { data: reads }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("notification_reads").select("notification_id").eq("user_id", user.id),
  ]);
  const readIds = new Set((reads ?? []).map((r) => r.notification_id as string));
  const notifications: SidebarNotification[] = (notifs ?? []).map((n) => ({
    id: n.id as string,
    title: n.title as string,
    body: n.body as string,
    created_at: n.created_at as string,
    read: readIds.has(n.id as string),
  }));

  const nombre =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Retador";
  const avatarUrl = profile?.avatar_url ?? null;

  const startMissions = {
    skool: !!profile?.joined_skool_at,
    whatsapp: !!profile?.joined_whatsapp_at,
  };
  return {
    user,
    nombre,
    avatarUrl,
    startMissions,
    completedDays: new Set((progress ?? []).map((p) => p.day)),
    admin: isAdmin(user.email),
    welcomeVideoSeen: profile?.welcome_video_seen ?? false,
    notifications,
    plan: effectivePlan(profile?.plan, profile?.plan_expires_at),
    coins: Number(profile?.coins ?? 0),
    lives: Number(profile?.lives ?? 3),
  };
}
