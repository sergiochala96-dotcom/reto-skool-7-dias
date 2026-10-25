import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import StatsBar from "@/components/StatsBar";
import { CoinIcon } from "@/components/StatIcons";
import TriviaQuiz from "@/components/TriviaQuiz";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";
import { TRIVIA_REWARD, getTodayTrivia } from "@/lib/trivias";

export const metadata: Metadata = {
  title: "Trivia del día | Skooly",
};

// Trivia del día: 5 preguntas, una trivia nueva cada día; completarla da monedas de oro.
export default async function TriviaPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  const completedList = Array.from(completedDays);

  const { trivia, date } = getTodayTrivia();
  const supabase = await createClient();
  const { data: done } = await supabase
    .from("coin_transactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("reason", "trivia")
    .eq("ref", date)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={completedList}
        notifications={notifications}
        plan={plan}
      />

      <main className="min-w-0 flex-1 px-4 py-10 md:py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 hidden justify-end md:flex">
            <StatsBar completedDays={completedList} coins={coins} lives={lives} />
          </div>

          <header className="mb-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-300">Trivia del día</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">5 preguntas, {TRIVIA_REWARD} monedas</h1>
            <p className="mt-2 text-sm text-white/60">
              Cada día hay una trivia nueva. Complétala y gana{" "}
              <strong className="inline-flex items-center gap-1 text-amber-300">
                <CoinIcon className="h-4 w-4" /> {TRIVIA_REWARD} monedas de oro
              </strong>
              .
            </p>
          </header>

          {done ? (
            <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-400/[0.06] p-8 text-center">
              <p className="text-5xl">✅</p>
              <p className="mt-3 text-2xl font-extrabold text-white">¡Ya completaste la trivia de hoy!</p>
              <p className="mt-2 text-sm text-white/60">
                Hoy tocó «{trivia.title}». Vuelve mañana para una trivia nueva y más monedas.
              </p>
            </div>
          ) : (
            <TriviaQuiz
              title={trivia.title}
              emoji={trivia.emoji}
              reward={TRIVIA_REWARD}
              // Las respuestas correctas NO se envían al navegador: las devuelve el servidor al entregar.
              questions={trivia.questions.map((q) => ({ q: q.q, options: [...q.options] }))}
            />
          )}
        </div>
      </main>
    </div>
  );
}
