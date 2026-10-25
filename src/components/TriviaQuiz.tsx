"use client";

import { useState, useTransition, type ReactNode } from "react";
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
// Primero se muestra una tarjeta de confirmación; al empezar, en computadora la trivia ocupa toda la
// pantalla (en celular sigue en la página).
// `blocked` es la tarjeta que arma el servidor cuando hoy ya no se puede jugar (completada o sin
// vidas). Se muestra solo fuera de una partida: así, aunque la página se vuelva a pedir al servidor
// al responder, la última pregunta y el resultado no desaparecen a mitad de la partida.
export default function TriviaQuiz({
  title,
  emoji,
  questions,
  reward,
  initialStep,
  initialLives,
  initialWrong,
  blocked,
}: {
  title: string;
  emoji: string;
  questions: PublicQuestion[];
  reward: number;
  initialStep: number;
  initialLives: number;
  initialWrong: number;
  blocked?: ReactNode;
}) {
  // Paso previo: confirmar que quiere empezar. Si ya había respondido preguntas hoy, sigue donde iba.
  const [started, setStarted] = useState(initialStep > 0 && !blocked);
  const [step, setStep] = useState(initialStep);
  const [lives, setLives] = useState(initialLives);
  const [wrong, setWrong] = useState(initialWrong);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // Opciones ya falladas en la pregunta actual (hay que volver a intentarla) y aviso de reintento.
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [retry, setRetry] = useState(false);
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
      if (r.status === "failed") {
        // Se quedó sin vidas: la trivia terminó sin monedas.
        setFinal(end ?? { status: "failed", awarded: 0 });
        router.refresh();
        return;
      }
      if (r.correct === false) {
        // Falló: pierde una vida y repite esta misma pregunta (sin ver la respuesta correcta).
        setWrongPicks((p) => [...p, picked]);
        setSelected(null);
        setRetry(true);
        router.refresh();
        return;
      }
      if (r.correct === undefined || r.correctIndex === undefined) {
        setError("No se pudo comprobar tu respuesta. Inténtalo de nuevo.");
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
    setWrongPicks([]);
    setRetry(false);
    setStep(step + 1);
  }

  // Sale de la partida y vuelve a la página (con la tarjeta del servidor ya actualizada).
  function leave() {
    setStarted(false);
    router.refresh();
  }

  // En computadora la partida ocupa toda la pantalla, con una X arriba a la derecha para salir.
  function shell(children: ReactNode) {
    return (
      <div className="md:fixed md:inset-0 md:z-[90] md:overflow-y-auto md:bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_70%)] md:px-6 md:py-10">
        <button
          type="button"
          onClick={leave}
          aria-label="Salir de la trivia"
          className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl font-bold leading-none text-white transition hover:bg-white/20 md:fixed md:right-6 md:top-6 md:flex"
        >
          ×
        </button>
        <div className="md:mx-auto md:flex md:min-h-full md:max-w-2xl md:flex-col md:justify-center">
          {children}
        </div>
      </div>
    );
  }

  if (!started) {
    if (blocked) return <>{blocked}</>;
    return (
      <div className="rounded-3xl border-2 border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
        <p className="text-6xl">{emoji}</p>
        <p className="mt-3 text-sm font-bold uppercase tracking-wide text-fuchsia-300">{title}</p>
        <h2 className="mt-1 text-2xl font-extrabold leading-snug text-white">
          ¿Listo para la trivia de hoy?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/65">
          Responde {total} preguntas y gana{" "}
          <strong className="inline-flex items-center gap-1 text-amber-300">
            <CoinIcon className="h-4 w-4" /> {reward} monedas de oro
          </strong>
          . Cada respuesta fallada te quita una vida.
        </p>
        <div className="mt-4 flex justify-center">
          <Hearts lives={lives} />
        </div>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-6 w-full rounded-2xl border-b-4 border-purple-900 bg-gradient-to-b from-fuchsia-500 to-purple-600 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-110 active:translate-y-0.5 active:border-b-2"
        >
          Empezar trivia
        </button>
      </div>
    );
  }

  if (final?.status === "completed") {
    return shell(
      <div className="rounded-2xl border-2 border-amber-300/40 bg-amber-300/[0.07] p-8 text-center">
        <p className="text-5xl">{wrong === 0 ? "🏆" : "🎉"}</p>
        <p className="mt-2 text-2xl font-extrabold text-white">¡Trivia completada!</p>
        <p className="mt-1 text-white/70">
          {wrong === 0
            ? "Las respondiste todas sin ningún error"
            : `Completaste las ${total} preguntas con ${wrong} ${wrong === 1 ? "error" : "errores"}`}
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
        <button
          type="button"
          onClick={leave}
          className="mt-6 hidden w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2 md:block"
        >
          Volver
        </button>
      </div>
    );
  }

  if (final?.status === "failed") {
    return shell(
      <div className="rounded-2xl border-2 border-red-400/40 bg-red-400/[0.06] p-8 text-center">
        <p className="text-5xl">💔</p>
        <p className="mt-2 text-2xl font-extrabold text-white">Te quedaste sin vidas</p>
        <p className="mt-2 text-white/70">
          No puedes terminar la trivia de hoy y pierdes las {reward} monedas. Tus vidas se reinician a
          3 mañana a las 6:00 a. m. (GMT-5).
        </p>
        <div className="mt-4 flex justify-center">
          <Hearts lives={0} />
        </div>
        <button
          type="button"
          onClick={leave}
          className="mt-6 hidden w-full rounded-2xl border-b-4 border-red-800 bg-red-500 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-red-400 active:translate-y-0.5 active:border-b-2 md:block"
        >
          Volver
        </button>
      </div>
    );
  }

  const q = questions[step];
  const showing = feedback !== null;

  return shell(
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
          } else if (wrongPicks.includes(i)) {
            style = "border-red-400/60 bg-red-500/10 text-white/45 line-through";
            badge = "bg-red-500/70 text-white";
          } else if (selected === i) {
            style = "border-fuchsia-400 bg-fuchsia-500/20 text-white";
            badge = "bg-fuchsia-500 text-white";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelected(i);
                setRetry(false);
              }}
              disabled={pending || showing || wrongPicks.includes(i)}
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

      {retry && !showing && (
        <div role="status" className="mt-5 rounded-2xl border-2 border-red-400/50 bg-red-400/10 p-4">
          <p className="text-lg font-extrabold text-red-300">Incorrecto, perdiste una vida 💔</p>
          <p className="mt-1 text-sm leading-snug text-white/70">
            Inténtalo de nuevo: tienes que acertar esta misma pregunta para pasar a la siguiente.
          </p>
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
