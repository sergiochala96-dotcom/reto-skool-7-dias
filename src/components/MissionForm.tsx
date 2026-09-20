"use client";

import { useActionState, useState } from "react";
import type { MissionField, MissionSection, Answers } from "@/lib/missionFields";
import { countRequiredFields } from "@/lib/missionFields";
import type { MissionState } from "@/app/actions";

function PromptField({ field }: { field: MissionField }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(field.promptText ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard no disponible: no hacemos nada, el usuario puede seleccionar el texto a mano
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-fuchsia-400/30 bg-fuchsia-500/5 p-4">
      <p className="mb-2 text-sm font-semibold text-fuchsia-200">💡 {field.label}</p>
      <p className="whitespace-pre-wrap rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed text-white/70">
        {field.promptText}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 rounded-lg border border-fuchsia-400/30 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 transition hover:bg-fuchsia-400/10"
      >
        {copied ? "Copiado ✓" : "📋 Copiar prompt"}
      </button>
    </div>
  );
}

function InfoField({ field }: { field: MissionField }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-1 text-sm font-semibold text-white/70">ℹ️ {field.label}</p>
      <p className="text-sm text-white/50">{field.infoText}</p>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | string[] | undefined;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const baseInput =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400";

  if (field.type === "prompt") return <PromptField field={field} />;
  if (field.type === "info") return <InfoField field={field} />;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/80">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-white/40">{field.helper}</p>}

      {field.type === "text" && (
        <input
          name={`field_${field.id}`}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInput}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          min={0}
          name={`field_${field.id}`}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={baseInput}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          name={`field_${field.id}`}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          rows={4}
          className={`${baseInput} resize-y`}
        />
      )}

      {(field.type === "select" || field.type === "yesno") && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(field.id, opt.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                    : "border-white/15 text-white/60 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <input type="hidden" name={`field_${field.id}`} value={(value as string) ?? ""} />
        </div>
      )}

      {field.type === "multiselect" && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            const selected = arr.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = selected ? arr.filter((v) => v !== opt.value) : [...arr, opt.value];
                  onChange(field.id, next);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                    : "border-white/15 text-white/60 hover:bg-white/5"
                }`}
              >
                {selected ? "✓ " : ""}
                {opt.label}
              </button>
            );
          })}
          {(Array.isArray(value) ? value : []).map((v) => (
            <input key={v} type="hidden" name={`field_${field.id}`} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MissionForm({
  day,
  totalDays,
  sections,
  initialAnswers,
  saveAction,
}: {
  day: number;
  totalDays: number;
  sections: MissionSection[];
  initialAnswers: Answers;
  saveAction: (state: MissionState, formData: FormData) => Promise<MissionState>;
}) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [state, formAction, pending] = useActionState<MissionState, FormData>(
    saveAction,
    undefined
  );

  const { total, done } = countRequiredFields(day, answers);
  const allDone = total > 0 && done >= total;

  const handleChange = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {total > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/50">
            <span>Progreso de la misión</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {sections.map((section) => (
        <section key={section.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fuchsia-300">
            {section.heading}
          </h2>
          <div className="flex flex-col gap-5">
            {section.fields
              .filter((f) => !f.showIf || answers[f.showIf.field] === f.showIf.equals)
              .map((field) => (
                <FieldInput
                  key={field.id}
                  field={field}
                  value={answers[field.id]}
                  onChange={handleChange}
                />
              ))}
          </div>
        </section>
      ))}

      {state?.saved && (
        <p className="rounded-lg bg-emerald-500/15 px-4 py-2.5 text-sm text-emerald-200">
          Guardado ✓ — te faltan {state.missing} de {state.total} campos para completar este día.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`w-full rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition disabled:opacity-60 ${
          allDone
            ? "bg-gradient-to-r from-emerald-500 to-fuchsia-500 shadow-emerald-500/30 hover:brightness-110"
            : "bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-fuchsia-500/30 hover:brightness-110"
        }`}
      >
        {pending
          ? "Guardando..."
          : allDone
          ? `🎉 Completar Día ${day}${day < totalDays ? " y desbloquear el siguiente" : ""}`
          : `Guardar avance (${done}/${total})`}
      </button>
    </form>
  );
}
