import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOTAL_DAYS } from "@/lib/challenge";
import TreasureChest from "@/components/TreasureChest";

export default async function CofrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("day")
    .eq("user_id", user.id);

  const completedCount = new Set((progress ?? []).map((p) => p.day)).size;
  if (completedCount < TOTAL_DAYS) redirect("/dashboard");

  const nombre =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Retador";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-16">
      <Link
        href="/dashboard"
        className="mb-10 self-start text-sm text-white/60 hover:text-white"
      >
        ← Volver al panel
      </Link>
      <TreasureChest nombre={nombre} />
    </main>
  );
}
