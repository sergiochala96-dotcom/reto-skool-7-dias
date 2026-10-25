import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import StatsBar from "@/components/StatsBar";
import TriviaCalendar from "@/components/TriviaCalendar";
import TriviaQuiz from "@/components/TriviaQuiz";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";
import { TRIVIA_REWARD, getTodayTrivia } from "@/lib/trivias";

export const metadata: Metadata = {
  title: "Trivia del día | Skooly",
};

// Trivia del día: 5 preguntas, una trivia nueva cada día (a las 6:00 a. m., GMT-5). Cada
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

  // Días de este mes en que completó la trivia (para el calendario de la racha).
  const monthStart = `${date.slice(0, 7)}-01`;
  const { data: monthRows } = await supabase
    .from("trivia_attempts")
    .select("play_date")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("play_date", monthStart)
    .lte("play_date", date);
  const completedDates = (monthRows ?? []).map((r) => r.play_date as string);

  const answered = (attempt?.answers as number[] | undefined)?.length ?? 0;
  const status = (attempt?.status as "in_progress" | "completed" | "failed" | undefined) ?? "in_progress";
  const outOfLives = lives <= 0;

  // Tarjeta de "hoy ya no se puede jugar" (completada o sin vidas); la muestra TriviaQuiz fuera de una partida.
  let blocked: React.ReactNode = null;
  if (status === "completed") {
    const wrong = attempt?.wrong ?? 0;
    blocked = (
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
    blocked = (
      <div className="rounded-2xl border-2 border-red-400/40 bg-red-400/[0.06] p-8 text-center">
        <p className="text-5xl">💔</p>
        <p className="mt-3 text-2xl font-extrabold text-white">Sin vidas por hoy</p>
        <p className="mt-2 text-sm text-white/70">
          {status === "failed"
            ? `Te quedaste sin vidas durante la trivia, así que hoy no ganas las ${TRIVIA_REWARD} monedas. `
            : "No te quedan vidas para jugar la trivia de hoy. "}
          Tus vidas se reinician a 3 mañana a las 6:00 a. m. (GMT-5).
        </p>
      </div>
    );
  }

  const body = (
    <TriviaQuiz
      title={trivia.title}
      emoji={trivia.emoji}
      reward={TRIVIA_REWARD}
      initialStep={answered}
      initialLives={lives}
      initialWrong={attempt?.wrong ?? 0}
      blocked={blocked}
      // Las respuestas correctas NO se envían al navegador: el servidor revela cada una al responder.
      questions={trivia.questions.map((q) => ({ q: q.q, options: [...q.options] }))}
    />
  );

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
        coins={coins}
        lives={lives}
      />

      <main className="min-w-0 flex-1 px-4 py-10 md:px-6 md:py-5">
        {/* Estadísticas en la esquina superior derecha de la pantalla. */}
        <div className="mb-2 hidden justify-end md:flex">
          <StatsBar completedDays={completedList} coins={coins} lives={lives} />
        </div>

        <div className="mx-auto max-w-2xl md:max-w-5xl">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-white">Trivia del día</h1>
          </header>

          {/* Computadora: la tarjeta de la trivia a la izquierda y el calendario a la derecha. */}
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-6">
            <div>{body}</div>
            <TriviaCalendar today={date} completedDates={completedDates} className="mt-8 md:mt-0" />
          </div>
        </div>
      </main>
    </div>
  );
}
