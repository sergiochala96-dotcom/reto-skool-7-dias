"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { MissionField, MissionSection, Answers } from "@/lib/missionFields";
import { countRequiredFields } from "@/lib/missionFields";
import type { MissionState } from "@/app/actions";
import PricingField from "@/components/PricingField";

const inputBase =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-fuchsia-400";

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
      <p className="whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs leading-relaxed text-gray-700">
        {field.promptText}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:brightness-105"
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

function LinkField({ field }: { field: MissionField }) {
  return (
    <div className="rounded-xl border border-amber-300/30 bg-amber-400/5 p-4">
      <p className="mb-1 text-sm font-semibold text-amber-200">{field.label}</p>
      {field.helper && <p className="mb-3 text-xs text-white/50">{field.helper}</p>}
      <a
        href={field.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:brightness-105"
      >
        {field.buttonText ?? "Abrir enlace"}
      </a>
    </div>
  );
}

function ListField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string[] | undefined;
  onChange: (id: string, value: string[]) => void;
}) {
  const minRows = field.minItems ?? 1;
  // value puede venir de una respuesta antigua guardada como texto plano (antes de
  // que este campo fuera de tipo "list"): si no es un array, se ignora y se parte
  // de filas vacías en vez de romper el .map de abajo.
  const items = Array.isArray(value) && value.length > 0 ? value : Array(minRows).fill("");

  const setItem = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(field.id, next);
  };

  const addItem = () => onChange(field.id, [...items, ""]);
  const removeItem = (index: number) => onChange(field.id, items.filter((_, i) => i !== index));

  const canAddMore = !field.maxItems || items.length < field.maxItems;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/80">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-white/40">{field.helper}</p>}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {field.badgeLabel ? (
              <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-fuchsia-500/20 px-2.5 py-1 text-xs font-semibold text-fuchsia-200">
                {field.badgeLabel} {i + 1}
              </span>
            ) : (
              <span className="text-fuchsia-400">•</span>
            )}
            <input
              name={`field_${field.id}`}
              value={item}
              maxLength={field.itemMaxLength}
              placeholder={field.itemPlaceholders?.[i] ?? field.itemPlaceholder}
              onChange={(e) => setItem(i, e.target.value)}
              className={`${inputBase} py-2`}
            />
            {i >= minRows && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Quitar"
                className="flex-shrink-0 rounded-lg px-2 py-1 text-white/30 transition hover:bg-white/10 hover:text-white/70"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      {canAddMore && (
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm font-medium text-fuchsia-300 hover:underline"
        >
          {field.addLabel ?? "+ Añadir"}
        </button>
      )}
    </div>
  );
}

function RangeField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string[] | undefined;
  onChange: (id: string, value: string[]) => void;
}) {
  const [min, max] = Array.isArray(value) && value.length === 2 ? value : ["", ""];

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/80">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-white/40">{field.helper}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className="mb-1 block text-xs text-white/40">Mínimo</span>
          <input
            type="number"
            min={0}
            name={`field_${field.id}`}
            value={min}
            onChange={(e) => onChange(field.id, [e.target.value, max])}
            className={inputBase}
          />
        </div>
        <div className="flex-1">
          <span className="mb-1 block text-xs text-white/40">Máximo</span>
          <input
            type="number"
            min={0}
            name={`field_${field.id}`}
            value={max}
            onChange={(e) => onChange(field.id, [min, e.target.value])}
            className={inputBase}
          />
        </div>
      </div>
    </div>
  );
}

function SliderField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const min = field.sliderMin ?? 0;
  const max = field.sliderMax ?? 100;
  const current = value !== undefined && value !== "" ? Number(value) : min;
  const percent = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const mood = field.moodMap?.find((m) => current <= m.max)?.emoji;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/80">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-white/40">{field.helper}</p>}
      <div className="rounded-xl border border-black/10 bg-white px-4 pb-4 pt-12">
        <div className="relative">
          <div
            className="pointer-events-none absolute -top-11 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ left: `${percent}%` }}
          >
            <span className="whitespace-nowrap rounded-full bg-fuchsia-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
              {current} {field.sliderUnit ?? ""}
            </span>
            {mood && <span className="text-2xl leading-none">{mood}</span>}
          </div>
          <input
            type="range"
            name={`field_${field.id}`}
            min={min}
            max={max}
            step={field.sliderStep ?? 1}
            value={current}
            onChange={(e) => onChange(field.id, e.target.value)}
            className="slider-big w-full accent-fuchsia-500"
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <style jsx>{`
        .slider-big {
          height: 8px;
        }
        .slider-big::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: #d946ef;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          cursor: pointer;
        }
        .slider-big::-moz-range-thumb {
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: #d946ef;
          border: 4px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          cursor: pointer;
        }
      `}</style>
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
  if (field.type === "prompt") return <PromptField field={field} />;
  if (field.type === "info") return <InfoField field={field} />;
  if (field.type === "link") return <LinkField field={field} />;
  if (field.type === "list")
    return <ListField field={field} value={value as string[]} onChange={onChange} />;
  if (field.type === "range")
    return <RangeField field={field} value={value as string[]} onChange={onChange} />;
  if (field.type === "slider")
    return <SliderField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "pricing")
    return <PricingField field={field} value={value as string} onChange={onChange} />;

  const textValue = (value as string) ?? "";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/80">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-white/40">{field.helper}</p>}

      {field.type === "text" && (
        <input
          name={`field_${field.id}`}
          value={textValue}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={inputBase}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          min={0}
          name={`field_${field.id}`}
          value={textValue}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={inputBase}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          name={`field_${field.id}`}
          value={textValue}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          onChange={(e) => onChange(field.id, e.target.value)}
          rows={4}
          className={`${inputBase} resize-y`}
        />
      )}

      {field.maxLength && (
        <p className="mt-1 text-right text-[11px] text-white/30">
          {textValue.length}/{field.maxLength}
        </p>
      )}

      {field.type === "select" && field.display === "dropdown" && (
        <select
          name={`field_${field.id}`}
          value={textValue}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={inputBase}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {(field.type === "yesno" || (field.type === "select" && field.display !== "dropdown")) && (
        <div>
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
            <input type="hidden" name={`field_${field.id}`} value={textValue} />
          </div>
          {(() => {
            const selectedOption = field.options?.find((opt) => opt.value === textValue);
            return selectedOption?.description ? (
              <p className="mt-2 rounded-lg bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-100">
                {selectedOption.description}
              </p>
            ) : null;
          })()}
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
          {section.image && (
            <div className="relative mb-5 w-full overflow-hidden rounded-xl border border-white/10">
              <Image
                src={section.image}
                alt={section.heading}
                width={1200}
                height={675}
                className="h-auto w-full object-contain"
              />
            </div>
          )}
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
        className={`w-full rounded-xl px-4 py-3 font-semibold shadow-lg transition disabled:opacity-60 ${
          allDone
            ? "bg-amber-300 text-slate-900 shadow-amber-400/30 hover:brightness-105"
            : "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-fuchsia-500/30 hover:brightness-110"
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
