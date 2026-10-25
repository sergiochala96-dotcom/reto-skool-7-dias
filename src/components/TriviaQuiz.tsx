"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitTrivia, type TriviaResult } from "@/app/actions";
import { CoinIcon } from "@/components/StatIcons";

type PublicQuestion = { q: string; options: string[] };

const LETTERS = ["A", "B", "C", "D"];

// Trivia del día: una pregunta a la vez; al terminar se entregan las respuestas y el servidor
// califica, da las monedas (una vez por día) y devuelve las respuestas correctas.
export default function TriviaQuiz({
  title,
  emoji,
  questions,
  reward,
}: {
  title: string;
  emoji: string;
  questions: PublicQuestion[];
  reward: number;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<TriviaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const total = questions.length;
  const isLast = step === total - 1;

  function next() {
    if (selected === null) return;
    const updated = [...answers, selected];
    setSelected(null);
    if (!isLast) {
      setAnswers(updated);
      setStep(step + 1);
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await submitTrivia(updated);
      if (r.ok) {
        setAnswers(updated);
        setResult(r);
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo enviar tu trivia. Inténtalo de nuevo.");
      }
    });
  }

  if (result?.ok) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border-2 border-amber-300/40 bg-amber-300/[0.07] p-6 text-center">
          <p className="text-5xl">{(result.score ?? 0) >= total - 1 ? "🏆" : "🎉"}</p>
          <p className="mt-2 text-2xl font-extrabold text-white">
            {result.score} de {result.total} correctas
          </p>
          {result.awarded ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black/25 px-4 py-2 text-lg font-extrabold text-amber-300">
              <CoinIcon className="h-6 w-6" /> +{result.awarded} monedas de oro
            </p>
          ) : null}
          <p className="mt-3 text-sm text-white/60">Vuelve mañana para una trivia nueva.</p>
        </div>

        <ol className="space-y-3">
          {questions.map((q, i) => {
            const mine = answers[i];
            const good = result.correct?.[i];
            const ok = mine === good;
            return (
              <li
                key={i}
                className={`rounded-2xl border-2 p-4 ${
                  ok ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-red-400/40 bg-red-400/[0.06]"
                }`}
              >
                <p className="font-bold text-white">
                  {i + 1}. {q.q}
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Tu respuesta:{" "}
                  <span className={ok ? "font-bold text-emerald-300" : "font-bold text-red-300"}>
                    {q.options[mine]}
                  </span>
                </p>
                {!ok && good !== undefined && (
                  <p className="mt-1 text-sm text-white/70">
                    Correcta: <span className="font-bold text-emerald-300">{q.options[good]}</span>
                  </p>
                )}
                <p className="mt-2 text-xs leading-snug text-white/50">{result.explanations?.[i]}</p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const q = questions[step];

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
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-white/60">
          {step + 1}/{total}
        </span>
      </div>

      <p className="text-sm font-bold uppercase tracking-wide text-fuchsia-300">
        {emoji} {title}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold leading-snug text-white">{q.q}</h2>

      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            disabled={pending}
            className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-base font-semibold transition ${
              selected === i
                ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                : "border-white/15 bg-white/[0.04] text-white/85 hover:bg-white/10"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                selected === i ? "bg-fuchsia-500 text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {LETTERS[i]}
            </span>
            {option}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}

      <button
        type="button"
        onClick={next}
        disabled={selected === null || pending}
        className="mt-6 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-emerald-400 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40"
      >
        {pending ? "Enviando..." : isLast ? `Terminar y ganar ${reward} monedas` : "Continuar"}
      </button>
    </div>
  );
}
