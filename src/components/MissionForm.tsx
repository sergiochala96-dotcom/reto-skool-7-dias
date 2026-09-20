"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MissionField, MissionSection, Answers } from "@/lib/missionFields";
import { countFieldsAnswered, countRequiredFields } from "@/lib/missionFields";
import type { MissionState } from "@/app/actions";
import PricingField from "@/components/PricingField";
import OfferField from "@/components/OfferField";
import PlatformIcon from "@/components/PlatformIcon";
import CalendarMockup from "@/components/CalendarMockup";
import { playSuccessDing } from "@/lib/successSound";

const inputBase =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-fuchsia-500";

const blackButton =
  "rounded-full bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-black";

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
    <div className="rounded-xl border border-dashed border-fuchsia-300 bg-fuchsia-50 p-4">
      <p className="mb-2 text-sm font-semibold text-fuchsia-700">💡 {field.label}</p>
      <p className="whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs leading-relaxed text-gray-700">
        {field.promptText}
      </p>
      <button type="button" onClick={copy} className={`mt-3 ${blackButton}`}>
        {copied ? "Copiado ✓" : "📋 Copiar prompt"}
      </button>
    </div>
  );
}

function InfoField({ field }: { field: MissionField }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-sm font-semibold text-gray-800">ℹ️ {field.label}</p>
      <p className="text-sm text-gray-500">{field.infoText}</p>
    </div>
  );
}

function LinkField({ field }: { field: MissionField }) {
  if (field.emphasis) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="mb-1 text-base font-semibold text-gray-900">{field.label}</p>
        {field.helper && <p className="mb-4 text-sm text-gray-500">{field.helper}</p>}
        <a
          href={field.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full max-w-md rounded-full bg-amber-400 px-8 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-400/40 transition hover:brightness-105"
        >
          {field.buttonText ?? "Abrir enlace"}
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-sm font-semibold text-gray-900">{field.label}</p>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}
      <a href={field.url} target="_blank" rel="noopener noreferrer" className={`inline-block ${blackButton}`}>
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
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-gray-500">{field.helper}</p>}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {field.badgeLabel ? (
              <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">
                {field.badgeLabel} {i + 1}
              </span>
            ) : (
              <span className="text-fuchsia-500">•</span>
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
                className="flex-shrink-0 rounded-lg px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
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
          className="mt-2 text-sm font-medium text-fuchsia-600 hover:underline"
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
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-gray-500">{field.helper}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className="mb-1 block text-xs text-gray-500">Mínimo</span>
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
          <span className="mb-1 block text-xs text-gray-500">Máximo</span>
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

const MOOD_COLOR_CLASSES: Record<string, string> = {
  red: "text-red-600",
  orange: "text-orange-500",
  green: "text-emerald-600",
};

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
  const mood = field.moodMap?.find((m) => current <= m.max);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-gray-500">{field.helper}</p>}
      <div className="rounded-xl border border-gray-200 bg-white px-4 pb-4 pt-5">
        {mood && (
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="text-6xl leading-none">{mood.emoji}</span>
            <span className={`mt-2 text-base font-bold ${MOOD_COLOR_CLASSES[mood.color]}`}>
              {mood.text}
            </span>
          </div>
        )}
        <div className="relative mt-7">
          <div
            className="pointer-events-none absolute -top-9 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${percent}%` }}
          >
            <span className="whitespace-nowrap rounded-full bg-gray-900 px-3 py-1 text-sm font-bold text-white shadow-lg">
              {current} {field.sliderUnit ?? ""}
            </span>
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
        <div className="mt-1 flex justify-between text-[11px] text-gray-400">
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
  if (field.type === "offer")
    return <OfferField field={field} value={value as string} onChange={onChange} />;

  const textValue = (value as string) ?? "";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-gray-500">{field.helper}</p>}

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
        <p className="mt-1 text-right text-[11px] text-gray-400">
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

      {field.type === "select" && field.display === "icon-cards" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {field.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(field.id, opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                  selected
                    ? "border-fuchsia-400 bg-fuchsia-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    selected ? "bg-fuchsia-100 text-fuchsia-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {opt.icon && <PlatformIcon id={opt.icon} className="h-6 w-6" />}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    selected ? "text-fuchsia-700" : "text-gray-400"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
          <input type="hidden" name={`field_${field.id}`} value={textValue} />
        </div>
      )}

      {(field.type === "yesno" ||
        (field.type === "select" && field.display !== "dropdown" && field.display !== "icon-cards")) && (
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
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
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
              <div className="mt-3 rounded-xl border-2 border-violet-300 bg-violet-50 px-4 py-3">
                <p className="text-base font-bold leading-snug text-violet-800">
                  {selectedOption.description}
                </p>
              </div>
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
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
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
  emoji,
  title,
  intro,
  completed,
  sections,
  initialAnswers,
  saveAction,
}: {
  day: number;
  totalDays: number;
  emoji: string;
  title: string;
  intro: string;
  completed: boolean;
  sections: MissionSection[];
  initialAnswers: Answers;
  saveAction: (state: MissionState, formData: FormData) => Promise<MissionState>;
}) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [state, formAction, pending] = useActionState<MissionState, FormData>(
    saveAction,
    undefined
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [xpPop, setXpPop] = useState(false);
  const [sectionCelebrate, setSectionCelebrate] = useState(false);
  const [showAllExpanded, setShowAllExpanded] = useState(false);

  const { total, done } = countRequiredFields(day, answers);
  const allDone = total > 0 && done >= total;

  const handleChange = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // "+1 XP" cada vez que sube el número de campos completados del día.
  const prevDoneRef = useRef(done);
  useEffect(() => {
    if (done > prevDoneRef.current) {
      setXpPop(true);
      playSuccessDing();
      const t = setTimeout(() => setXpPop(false), 900);
      prevDoneRef.current = done;
      return () => clearTimeout(t);
    }
    prevDoneRef.current = done;
  }, [done]);

  const sectionStats = sections.map((s) => countFieldsAnswered(s.fields, answers));
  const currentSection = sections[currentStep];
  const currentStat = sectionStats[currentStep];

  // Festejo cuando la sección que se está viendo queda completa.
  const celebratedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (
      currentSection &&
      currentStat &&
      currentStat.total > 0 &&
      currentStat.done >= currentStat.total &&
      !celebratedRef.current.has(currentSection.id)
    ) {
      celebratedRef.current.add(currentSection.id);
      setSectionCelebrate(true);
      const t = setTimeout(() => setSectionCelebrate(false), 1300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, currentStat?.done, currentStat?.total]);

  const isLastStep = currentStep === sections.length - 1;
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, sections.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const toggleExpanded = () => {
    setShowAllExpanded((prev) => {
      const next = !prev;
      if (!next) setCurrentStep(0);
      return next;
    });
  };

  const submitButton = (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-black disabled:opacity-60"
    >
      {pending
        ? "Guardando..."
        : allDone
        ? `🎉 Completar Día ${day}${day < totalDays ? " y desbloquear el siguiente" : ""}`
        : `Guardar avance (${done}/${total})`}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Día {day} de {totalDays}
          </p>
          {allDone && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="rounded-lg border-2 border-fuchsia-300 bg-white px-3 py-1.5 text-xs font-bold text-fuchsia-700 shadow-sm transition hover:bg-fuchsia-50"
            >
              {showAllExpanded ? `Ocultar Respuestas Día ${day}` : `Todas Respuestas Día ${day}`}
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-4">
          <span className="text-5xl">{emoji}</span>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      <p className="text-gray-600">{intro}</p>

      {completed && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700">
          ✓ Misión completada
        </div>
      )}

    <form action={formAction} className="flex flex-col gap-6">
      {total > 0 && (
        <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-500">
            <span>⭐ Progreso de la misión</span>
            <span>
              {done}/{total} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 transition-all"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
          {xpPop && (
            <span className="pointer-events-none absolute -top-3 right-3 animate-bounce rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
              +1 XP
            </span>
          )}
        </div>
      )}

      {sections.map((section, index) => {
        const visibleFields = section.fields.filter(
          (f) => !f.showIf || answers[f.showIf.field] === f.showIf.equals
        );
        const sectionImage = section.image && (
          <div className="relative mb-5 w-full overflow-hidden rounded-xl border border-gray-200">
            <Image
              src={section.image}
              alt={section.heading}
              width={section.imageWidth ?? 1200}
              height={section.imageHeight ?? 675}
              className="h-auto w-full object-contain"
            />
          </div>
        );
        const fieldsList = visibleFields.map((field) => (
          <FieldInput key={field.id} field={field} value={answers[field.id]} onChange={handleChange} />
        ));
        const isActive = showAllExpanded || index === currentStep;
        const celebrating = isActive && sectionCelebrate;

        return (
          <section
            key={section.id}
            className={`relative rounded-2xl border p-5 transition lg:p-7 ${
              isActive ? "" : "hidden"
            } ${celebrating ? "border-emerald-400 bg-emerald-50/60" : "border-gray-200 bg-gray-50"}`}
          >
            {celebrating && (
              <span className="absolute -top-3 right-4 animate-bounce rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                ✓ ¡Sección completa!
              </span>
            )}
            {section.imagePosition === "above-heading" && sectionImage}
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fuchsia-600">
              {section.heading}
            </h2>
            {section.imagePosition !== "above-heading" && sectionImage}
            {section.layout === "split-calendar" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <CalendarMockup />
                <div className="flex flex-col gap-5">{fieldsList}</div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">{fieldsList}</div>
            )}
          </section>
        );
      })}

      {state?.saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Guardado ✓ — te faltan {state.missing} de {state.total} campos para completar este día.
        </p>
      )}

      {showAllExpanded ? (
        <div className="flex gap-3">{submitButton}</div>
      ) : (
        <>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                ← Anterior
              </button>
            )}
            {!isLastStep ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-black"
              >
                Siguiente →
              </button>
            ) : (
              submitButton
            )}
          </div>

          {sections.length > 1 && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
                <span>
                  Paso {currentStep + 1} de {sections.length}
                </span>
                <span className="truncate pl-3 text-gray-400">{currentSection?.heading}</span>
              </div>
              <div className="flex gap-1.5">
                {sections.map((s, i) => {
                  const stat = sectionStats[i];
                  const complete = stat.total > 0 && stat.done >= stat.total;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentStep(i)}
                      aria-label={`Ir a ${s.heading}`}
                      className={`h-2 flex-1 rounded-full transition ${
                        complete ? "bg-emerald-400" : i === currentStep ? "bg-fuchsia-400" : "bg-gray-200"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </form>
    </div>
  );
}
