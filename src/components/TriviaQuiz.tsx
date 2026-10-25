"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { answerTrivia, type TriviaAnswerResult } from "@/app/actions";
import { CoinIcon, HeartIcon } from "@/components/StatIcons";
import { MAX_LIVES } from "@/lib/lives";

type PublicQuestion = { q: string; options: string[] };
type Final = { status: "completed" | "failed"; awarded: number };
type Feedback = { correct: boolean; correctIndex: number; explanation: string; picked: number };

const LETTERS = ["A", "B", "C", "D"];

function Hearts({ lives }: { lives: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${lives} vidas`}>
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <HeartIcon key={i} className={`h-7 w-7 transition ${i < lives ? "" : "opacity-20 grayscale"}`} />
      ))}
    </div>
  );
}

// Trivia del día. Cada pregunta se califica en el servidor al instante: si fallas pierdes una vida y
// ves la respuesta correcta. Sin vidas no puedes terminar y pierdes las monedas.
export default function TriviaQuiz({
  title,
  emoji,
  questions,
  reward,
  initialStep,
  initialLives,
  initialWrong,
}: {
  title: string;
  emoji: string;
  questions: PublicQuestion[];
  reward: number;
  initialStep: number;
  initialLives: number;
  initialWrong: number;
}) {
  const [step, setStep] = useState(initialStep);
  const [lives, setLives] = useState(initialLives);
  const [wrong, setWrong] = useState(initialWrong);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingFinal, setPendingFinal] = useState<Final | null>(null);
  const [final, setFinal] = useState<Final | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const total = questions.length;

  function check() {
    if (selected === null) return;
    setError(null);
    const picked = selected;
    startTransition(async () => {
      const r: TriviaAnswerResult = await answerTrivia(picked);
      if (!r.ok) {
        setError(r.error ?? "No se pudo comprobar tu respuesta. Inténtalo de nuevo.");
        return;
      }
      setLives(r.lives ?? lives);
      setWrong(r.wrong ?? wrong);
      const end: Final | null =
        r.status === "completed" || r.status === "failed"
          ? { status: r.status, awarded: r.awarded ?? 0 }
          : null;
      if (r.correct === undefined || r.correctIndex === undefined) {
        // Ya no tenía vidas: la trivia terminó sin monedas.
        setFinal(end ?? { status: "failed", awarded: 0 });
        router.refresh();
        return;
      }
      setFeedback({
        correct: r.correct,
        correctIndex: r.correctIndex,
        explanation: r.explanation ?? "",
        picked,
      });
      setPendingFinal(end);
      router.refresh();
    });
  }

  function next() {
    if (pendingFinal) {
      setFinal(pendingFinal);
      return;
    }
    setFeedback(null);
    setSelected(null);
    setStep(step + 1);
  }

  if (final?.status === "completed") {
    return (
      <div className="rounded-2xl border-2 border-amber-300/40 bg-amber-300/[0.07] p-8 text-center">
        <p className="text-5xl">{wrong === 0 ? "🏆" : "🎉"}</p>
        <p className="mt-2 text-2xl font-extrabold text-white">¡Trivia completada!</p>
        <p className="mt-1 text-white/70">
          Acertaste {total - wrong} de {total}
        </p>
        {final.awarded > 0 && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black/25 px-4 py-2 text-lg font-extrabold text-amber-300">
            <CoinIcon className="h-6 w-6" /> +{final.awarded} monedas de oro
          </p>
        )}
        <div className="mt-4 flex justify-center">
          <Hearts lives={lives} />
        </div>
        <p className="mt-4 text-sm text-white/60">Vuelve mañana (a partir de las 6:00 a. m.) para una trivia nueva.</p>
      </div>
    );
  }

  if (final?.status === "failed") {
    return (
      <div className="rounded-2xl border-2 border-red-400/40 bg-red-400/[0.06] p-8 text-center">
        <p className="text-5xl">💔</p>
        <p className="mt-2 text-2xl font-extrabold text-white">Te quedaste sin vidas</p>
        <p className="mt-2 text-white/70">
          No puedes terminar la trivia de hoy y pierdes las {reward} monedas. Tus vidas vuelven a 3
          mañana a las 6:00 a. m. (hora de Colombia).
        </p>
        <div className="mt-4 flex justify-center">
          <Hearts lives={0} />
        </div>
      </div>
    );
  }

  const q = questions[step];
  const showing = feedback !== null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-3 flex-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all"
            style={{ width: `${((step + (showing ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-white/60">
          {step + 1}/{total}
        </span>
        <Hearts lives={lives} />
      </div>

      <p className="text-sm font-bold uppercase tracking-wide text-fuchsia-300">
        {emoji} {title}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold leading-snug text-white">{q.q}</h2>

      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((option, i) => {
          let style = "border-white/15 bg-white/[0.04] text-white/85 hover:bg-white/10";
          let badge = "bg-white/10 text-white/60";
          if (showing) {
            if (i === feedback.correctIndex) {
              style = "border-emerald-400 bg-emerald-500/20 text-white";
              badge = "bg-emerald-500 text-white";
            } else if (i === feedback.picked) {
              style = "border-red-400 bg-red-500/20 text-white";
              badge = "bg-red-500 text-white";
            } else {
              style = "border-white/10 bg-white/[0.02] text-white/40";
            }
          } else if (selected === i) {
            style = "border-fuchsia-400 bg-fuchsia-500/20 text-white";
            badge = "bg-fuchsia-500 text-white";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              disabled={pending || showing}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-base font-semibold transition ${style}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${badge}`}>
                {LETTERS[i]}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {showing && (
        <div
          role="status"
          className={`mt-5 rounded-2xl border-2 p-4 ${
            feedback.correct ? "border-emerald-400/50 bg-emerald-400/10" : "border-red-400/50 bg-red-400/10"
          }`}
        >
          <p className={`text-lg font-extrabold ${feedback.correct ? "text-emerald-300" : "text-red-300"}`}>
            {feedback.correct ? "¡Correcto!" : "Incorrecto, perdiste una vida 💔"}
          </p>
          {feedback.explanation && <p className="mt-1 text-sm leading-snug text-white/70">{feedback.explanation}</p>}
        </div>
      )}

      {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}

      {showing ? (
        <button
          type="button"
          onClick={next}
          className={`mt-6 w-full rounded-2xl border-b-4 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition active:translate-y-0.5 active:border-b-2 ${
            feedback.correct
              ? "border-emerald-700 bg-emerald-500 hover:bg-emerald-400"
              : "border-red-800 bg-red-500 hover:bg-red-400"
          }`}
        >
          {pendingFinal ? "Ver resultado" : "Continuar"}
        </button>
      ) : (
        <button
          type="button"
          onClick={check}
          disabled={selected === null || pending}
          className="mt-6 w-full rounded-2xl border-b-4 border-purple-900 bg-gradient-to-b from-fuchsia-500 to-purple-600 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-110 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-none disabled:bg-white/10 disabled:text-white/40"
        >
          {pending ? "Comprobando..." : "Comprobar"}
        </button>
      )}
    </div>
  );
}
