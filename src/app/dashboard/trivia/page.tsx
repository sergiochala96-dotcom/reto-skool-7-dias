import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import StatsBar from "@/components/StatsBar";
import { CoinIcon, HeartIcon } from "@/components/StatIcons";
import TriviaQuiz from "@/components/TriviaQuiz";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";
import { TRIVIA_REWARD, getTodayTrivia } from "@/lib/trivias";

export const metadata: Metadata = {
  title: "Trivia del día | Skooly",
};

// Trivia del día: 5 preguntas, una trivia nueva cada día (a las 6:00 a. m. de Colombia). Cada
// respuesta fallada cuesta una vida; sin vidas no se puede terminar y se pierden las monedas.
export default async function TriviaPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();
  const completedList = Array.from(completedDays);

  const { trivia, date } = getTodayTrivia();
  const supabase = await createClient();
  const { data: attempt } = await supabase
    .from("trivia_attempts")
    .select("answers, wrong, status")
    .eq("user_id", user.id)
    .eq("play_date", date)
    .maybeSingle();

  const answered = (attempt?.answers as number[] | undefined)?.length ?? 0;
  const status = (attempt?.status as "in_progress" | "completed" | "failed" | undefined) ?? "in_progress";
  const outOfLives = lives <= 0;

  let body: React.ReactNode;
  if (status === "completed") {
    const wrong = attempt?.wrong ?? 0;
    body = (
      <div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-400/[0.06] p-8 text-center">
        <p className="text-5xl">✅</p>
        <p className="mt-3 text-2xl font-extrabold text-white">¡Ya completaste la trivia de hoy!</p>
        <p className="mt-2 text-sm text-white/60">
          Acertaste {trivia.questions.length - wrong} de {trivia.questions.length} en «{trivia.title}». Vuelve
          mañana, desde las 6:00 a. m., para una trivia nueva.
        </p>
      </div>
    );
  } else if (status === "failed" || outOfLives) {
    body = (
      <div className="rounded-2xl border-2 border-red-400/40 bg-red-400/[0.06] p-8 text-center">
        <p className="text-5xl">💔</p>
        <p className="mt-3 text-2xl font-extrabold text-white">Sin vidas por hoy</p>
        <p className="mt-2 text-sm text-white/70">
          {status === "failed"
            ? `Te quedaste sin vidas durante la trivia, así que hoy no ganas las ${TRIVIA_REWARD} monedas. `
            : "No te quedan vidas para jugar la trivia de hoy. "}
          Tus vidas vuelven a 3 mañana a las 6:00 a. m. (hora de Colombia).
        </p>
      </div>
    );
  } else {
    body = (
      <TriviaQuiz
        title={trivia.title}
        emoji={trivia.emoji}
        reward={TRIVIA_REWARD}
        initialStep={answered}
        initialLives={lives}
        initialWrong={attempt?.wrong ?? 0}
        // Las respuestas correctas NO se envían al navegador: el servidor revela cada una al responder.
        questions={trivia.questions.map((q) => ({ q: q.q, options: [...q.options] }))}
      />
    );
  }

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
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Completa la trivia y gana{" "}
              <strong className="inline-flex items-center gap-1 text-amber-300">
                <CoinIcon className="h-4 w-4" /> {TRIVIA_REWARD} monedas de oro
              </strong>
              . Cada respuesta fallada te quita una{" "}
              <HeartIcon className="inline h-4 w-4 align-text-bottom" /> vida; si te quedas sin vidas, no
              puedes terminar y pierdes las monedas. Las vidas vuelven a 3 todos los días a las 6:00 a. m.
            </p>
          </header>

          {body}
        </div>
      </main>
    </div>
  );
}
