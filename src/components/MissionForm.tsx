"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import type { MissionField, MissionSection, Answers } from "@/lib/missionFields";
import { countFieldsAnswered, countRequiredFields } from "@/lib/missionFields";
import type { MissionState } from "@/app/actions";
import PricingField from "@/components/PricingField";
import BonosField from "@/components/BonosField";
import TerminosField from "@/components/TerminosField";
import ModulosField from "@/components/ModulosField";
import TemarioField from "@/components/TemarioField";
import PlatformIcon from "@/components/PlatformIcon";
import CalendarMockup from "@/components/CalendarMockup";
import { playSuccessDing, playVictoryFanfare } from "@/lib/successSound";

const inputBase =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-fuchsia-500";

const blackButton =
  "rounded-full bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-black";

function boxGridCols(count: number): string {
  if (count <= 3) return "grid-cols-3";
  if (count === 4) return "grid-cols-2 sm:grid-cols-4";
  return "grid-cols-2 sm:grid-cols-3";
}

const PROMPT_VAR_STORAGE_PREFIX = "skooly_promptvar_";
const PROMPT_VAR_CHANGE_EVENT = "skooly-promptvar-change";

function PromptField({ field }: { field: MissionField }) {
  const [copied, setCopied] = useState(false);
  const [vars, setVars] = useState<Record<string, string>>(() =>
    Object.fromEntries((field.promptVars ?? []).map((v) => [v.id, ""]))
  );
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  // Al montar, recupera valores compartidos (ej. el nicho) que se hayan guardado
  // desde CUALQUIER otro prompt de la app, para no tener que volver a escribirlos.
  useEffect(() => {
    setVars((prev) => {
      const next = { ...prev };
      for (const v of field.promptVars ?? []) {
        try {
          const stored = localStorage.getItem(`${PROMPT_VAR_STORAGE_PREFIX}${v.id}`);
          if (stored) next[v.id] = stored;
        } catch {
          // localStorage no disponible: se queda vacío y el usuario lo escribe a mano
        }
      }
      return next;
    });
  }, [field.promptVars]);

  // Si otro prompt visible en la misma página (ej. en "Ver todas las respuestas")
  // actualiza una variable compartida, se refleja aquí también en vivo.
  useEffect(() => {
    const ids = new Set((field.promptVars ?? []).map((v) => v.id));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; value: string }>).detail;
      if (detail && ids.has(detail.id)) {
        setVars((prev) => ({ ...prev, [detail.id]: detail.value }));
      }
    };
    window.addEventListener(PROMPT_VAR_CHANGE_EVENT, handler);
    return () => window.removeEventListener(PROMPT_VAR_CHANGE_EVENT, handler);
  }, [field.promptVars]);

  const setVar = (id: string, value: string) => {
    setVars((prev) => ({ ...prev, [id]: value }));
    try {
      localStorage.setItem(`${PROMPT_VAR_STORAGE_PREFIX}${id}`, value);
    } catch {
      // localStorage no disponible: el valor solo vive en este prompt
    }
    window.dispatchEvent(
      new CustomEvent(PROMPT_VAR_CHANGE_EVENT, { detail: { id, value } })
    );
  };

  const resolvedText = (field.promptText ?? "").replace(/\{\{(\w+)\}\}/g, (_, id: string) => {
    const value = vars[id]?.trim();
    if (value) return value;
    const v = field.promptVars?.find((pv) => pv.id === id);
    return `[${v?.label ?? id}]`;
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard no disponible: no hacemos nada, el usuario puede seleccionar el texto a mano
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-fuchsia-300 bg-fuchsia-50 p-4">
      <p className="mb-2 text-sm font-semibold text-fuchsia-700">💡 {field.label}</p>

      {field.promptVars && field.promptVars.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {field.promptVars.map((v) => {
            const value = vars[v.id] ?? "";
            const isLocked = value.trim().length > 0 && !editing[v.id] && !v.noLock;
            return (
              <div key={v.id}>
                <label className="mb-1 block text-xs font-medium text-fuchsia-700">
                  {v.label}
                </label>
                {isLocked ? (
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5">
                    <span className="text-sm text-gray-700">{value}</span>
                    <button
                      type="button"
                      onClick={() => setEditing((prev) => ({ ...prev, [v.id]: true }))}
                      aria-label={`Editar ${v.label}`}
                      title={`Editar ${v.label}`}
                      className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <input
                    value={value}
                    placeholder={v.placeholder}
                    autoFocus={!!editing[v.id]}
                    onChange={(e) => setVar(v.id, e.target.value)}
                    onBlur={() => {
                      if (value.trim()) {
                        setEditing((prev) => ({ ...prev, [v.id]: false }));
                      }
                    }}
                    className={`${inputBase} bg-white`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs leading-relaxed text-gray-700">
        {resolvedText}
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

function LinkField({
  field,
  confirmValue,
  onChange,
}: {
  field: MissionField;
  confirmValue?: string;
  onChange: (id: string, value: string) => void;
}) {
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

  const checked = confirmValue === "si";

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-sm font-semibold text-gray-900">{field.label}</p>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <a href={field.url} target="_blank" rel="noopener noreferrer" className={`inline-block ${blackButton}`}>
          {field.buttonText ?? "Abrir enlace"}
        </a>
        {field.confirm && (
          <button
            type="button"
            onClick={() => onChange(field.confirm!.id, checked ? "" : "si")}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
              checked
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-gray-300 bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold ${
                checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white"
              }`}
            >
              {checked ? "✓" : ""}
            </span>
            {field.confirm.label}
          </button>
        )}
      </div>
      {field.confirm && (
        <input type="hidden" name={`field_${field.confirm.id}`} value={checked ? "si" : ""} />
      )}
    </div>
  );
}

function CheckField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const checked = value === "si";
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-2 text-xs text-gray-500">{field.helper}</p>}
      <button
        type="button"
        onClick={() => onChange(field.id, checked ? "" : "si")}
        className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition ${
          checked ? "border-emerald-400 bg-emerald-50" : "border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        <span
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 text-lg font-bold ${
            checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white text-transparent"
          }`}
        >
          ✓
        </span>
        <span className={`text-sm font-semibold ${checked ? "text-emerald-700" : "text-gray-600"}`}>
          {checked ? "¡Listo!" : "Marcar como hecho"}
        </span>
      </button>
      <input type="hidden" name={`field_${field.id}`} value={checked ? "si" : ""} />
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
      {field.examples && field.examples.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {field.examples.map((ex, i) => (
            <span
              key={i}
              className="rounded-full bg-gray-400 px-3 py-1.5 text-xs font-medium text-white"
            >
              Ej: {ex}
            </span>
          ))}
        </div>
      )}
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

function CelebrationModal({
  day,
  totalDays,
  totalXp,
  onClose,
}: {
  day: number;
  totalDays: number;
  totalXp: number;
  onClose: () => void;
}) {
  const isLastDay = day >= totalDays;

  return (
    <div
      className="celebration-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="celebration-card relative flex w-full max-w-2xl flex-col items-center rounded-3xl bg-gradient-to-b from-[#3b0764] to-[#0f0721] p-8 text-center shadow-2xl sm:p-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>

        <Image
          src="/celebracion-dia.png"
          alt="¡Felicidades!"
          width={1254}
          height={1254}
          className="h-48 w-48 object-contain sm:h-64 sm:w-64"
        />

        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
          ¡Completaste el Día {day}!
        </h2>

        <div className="mt-8 flex w-full gap-4">
          <div className="flex-1 rounded-2xl border-2 border-amber-400 bg-amber-400/10 px-4 py-4 sm:py-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300 sm:text-sm">
              Exp total
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-3xl font-extrabold text-amber-300 sm:text-4xl">
              ⚡ {totalXp}
            </p>
          </div>
          <div className="flex-1 rounded-2xl border-2 border-emerald-400 bg-emerald-400/10 px-4 py-4 sm:py-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-300 sm:text-sm">
              Increíble
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-3xl font-extrabold text-emerald-300 sm:text-4xl">
              🎯 100%
            </p>
          </div>
        </div>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-white/20 px-4 py-4 text-base font-bold text-white/80 transition hover:bg-white/10"
          >
            Volver al Día {day}
          </button>
          <Link
            href={isLastDay ? "/cofre" : `/dia/${day + 1}`}
            className="flex-1 rounded-xl bg-amber-400 px-4 py-4 text-center text-base font-bold text-black shadow-lg shadow-amber-400/30 transition hover:brightness-105"
          >
            {isLastDay ? "Ir al Cofre del Tesoro" : `Continuar al Día ${day + 1}`}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .celebration-backdrop {
          animation: celebration-fade 0.2s ease-out both;
        }
        .celebration-card {
          animation: celebration-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes celebration-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes celebration-pop {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function FieldInput({
  field,
  value,
  answers,
  onChange,
}: {
  field: MissionField;
  value: string | string[] | undefined;
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const [showNoPopup, setShowNoPopup] = useState(false);

  if (field.type === "prompt") return <PromptField field={field} />;
  if (field.type === "info") return <InfoField field={field} />;
  if (field.type === "link")
    return (
      <LinkField
        field={field}
        confirmValue={field.confirm ? (answers[field.confirm.id] as string) : undefined}
        onChange={onChange}
      />
    );
  if (field.type === "check")
    return <CheckField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "list")
    return <ListField field={field} value={value as string[]} onChange={onChange} />;
  if (field.type === "range")
    return <RangeField field={field} value={value as string[]} onChange={onChange} />;
  if (field.type === "slider")
    return <SliderField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "pricing")
    return <PricingField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "bonos")
    return <BonosField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "terminos")
    return <TerminosField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "modulos")
    return <ModulosField field={field} value={value as string} onChange={onChange} />;
  if (field.type === "temario")
    return <TemarioField field={field} value={value as string} answers={answers} onChange={onChange} />;

  const textValue = (value as string) ?? "";

  if (field.type === "text" && field.inlineBadge) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-700">
            {field.badgeLabel ?? field.label}
          </span>
          <input
            name={`field_${field.id}`}
            value={textValue}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={`${inputBase} flex-1`}
          />
        </div>
        {field.helper && <p className="mt-1.5 text-xs text-gray-500">{field.helper}</p>}
      </div>
    );
  }

  if (field.emphasis && (field.type === "text" || field.type === "textarea")) {
    return (
      <div className="rounded-xl bg-[#2a1150] p-4">
        <p className="text-lg font-extrabold text-white sm:text-xl">{field.label}</p>
        <p className="mb-3 mt-0.5 text-xs font-semibold text-white/60">
          Escríbelo a continuación
        </p>
        {field.helper && <p className="mb-2 text-xs text-white/70">{field.helper}</p>}
        {field.type === "textarea" ? (
          <textarea
            name={`field_${field.id}`}
            value={textValue}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            onChange={(e) => onChange(field.id, e.target.value)}
            rows={4}
            className={`${inputBase} resize-y`}
          />
        ) : (
          <input
            name={`field_${field.id}`}
            value={textValue}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={inputBase}
          />
        )}
        {field.maxLength && (
          <p className="mt-1 text-right text-[11px] text-white/50">
            {textValue.length}/{field.maxLength}
          </p>
        )}
      </div>
    );
  }

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

      {field.type === "select" && (field.display === "icon-cards" || field.display === "boxes") && (
        <div>
          <div className={`grid gap-2 ${boxGridCols(field.options?.length ?? 0)}`}>
            {field.options?.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(field.id, opt.value)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition ${
                    selected
                      ? "border-fuchsia-400 bg-fuchsia-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  {opt.icon && (
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        selected ? "bg-fuchsia-100 text-fuchsia-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <PlatformIcon id={opt.icon} className="h-6 w-6" />
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      selected ? "text-fuchsia-700" : "text-gray-500"
                    }`}
                  >
                    {opt.label}
                  </span>
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

      {field.type === "select" && field.display !== "dropdown" && field.display !== "icon-cards" && field.display !== "boxes" && (
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

      {field.type === "yesno" && (
        <div className="grid grid-cols-2 gap-2">
          {field.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(field.id, opt.value);
                  if (opt.value === "no" && field.noPopup) setShowNoPopup(true);
                }}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                  selected
                    ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-700"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <input type="hidden" name={`field_${field.id}`} value={textValue} />
        </div>
      )}

      {showNoPopup && field.noPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowNoPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10"
          >
            <button
              type="button"
              onClick={() => setShowNoPopup(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <Image
              src="/mascota-no-skool.png"
              alt="Skooly"
              width={1254}
              height={1254}
              className="mx-auto h-48 w-48 object-contain sm:h-56 sm:w-56"
            />
            <p className="mb-6 mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
              {field.noPopup.message}
            </p>
            <a
              href={field.noPopup.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-105"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6">
                <path d="M16.001 3C9.373 3 4 8.373 4 15.001c0 2.386.638 4.622 1.751 6.552L4 29l7.633-1.719A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.629 28 15.001 28 8.373 22.629 3 16.001 3zm6.995 17.06c-.297.836-1.476 1.532-2.415 1.732-.643.137-1.482.246-4.306-.925-3.615-1.497-5.938-5.163-6.119-5.404-.176-.242-1.464-1.949-1.464-3.716s.925-2.634 1.253-2.997c.297-.33.65-.412.867-.412.217 0 .434.002.624.011.2.009.469-.076.734.559.271.65.921 2.243.999 2.406.078.163.13.354.026.57-.104.217-.156.352-.309.541-.153.19-.322.423-.46.568-.156.163-.318.34-.137.667.182.326.808 1.334 1.734 2.161 1.191 1.063 2.196 1.392 2.522 1.549.326.156.517.13.708-.078.19-.208.816-.951 1.034-1.278.217-.326.434-.271.734-.163.3.109 1.9.897 2.226 1.06.326.163.543.244.624.38.081.136.081.786-.216 1.622z" />
              </svg>
              {field.noPopup.buttonLabel}
            </a>
          </div>
        </div>
      )}

      {field.type === "multiselect" && (
        <div className={`grid gap-2 ${boxGridCols(field.options?.length ?? 0)}`}>
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
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition ${
                  selected
                    ? "border-fuchsia-400 bg-fuchsia-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                {selected && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
                {opt.icon && (
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      selected ? "bg-fuchsia-100 text-fuchsia-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <PlatformIcon id={opt.icon} className="h-6 w-6" />
                  </span>
                )}
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    selected ? "text-fuchsia-700" : "text-gray-500"
                  }`}
                >
                  {opt.label}
                </span>
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
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isSliding, setIsSliding] = useState(false);
  const [xpPop, setXpPop] = useState(false);
  const [sectionCelebrate, setSectionCelebrate] = useState<string | null>(null);
  const [showAllExpanded, setShowAllExpanded] = useState(false);
  const [celebration, setCelebration] = useState<{ total: number } | null>(null);

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

  // Popup de celebración cuando el día se completa por primera vez.
  useEffect(() => {
    if (state?.dayComplete) {
      setCelebration({ total: state.total });
      playVictoryFanfare();

      const duration = 1500;
      const end = Date.now() + duration;
      const colors = ["#f59e0b", "#facc15", "#e879f9", "#a855f7"];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors });
    }
  }, [state]);

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
      const sectionId = currentSection.id;
      setSectionCelebrate(sectionId);
      const t = setTimeout(() => {
        setSectionCelebrate((prev) => (prev === sectionId ? null : prev));
      }, 1300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, currentStat?.done, currentStat?.total]);

  const isLastStep = currentStep === sections.length - 1;
  const currentStepIncomplete = !!currentStat && currentStat.total > 0 && currentStat.done < currentStat.total;

  const goToStep = (target: number) => {
    if (isSliding || target === currentStep || target < 0 || target >= sections.length) return;
    setSlideDirection(target > currentStep ? 1 : -1);
    setIsSliding(true);
    setTimeout(() => {
      setCurrentStep(target);
      setIsSliding(false);
    }, 220);
  };
  const goNext = () => goToStep(currentStep + 1);
  const goPrev = () => goToStep(currentStep - 1);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex-shrink-0 text-4xl sm:text-5xl">{emoji}</span>
          <span className="flex-shrink-0 rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-fuchsia-700">
            Día {day}
          </span>
          <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        </div>
        {allDone && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex-shrink-0 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-black shadow-md transition hover:brightness-105"
          >
            {showAllExpanded ? "Ocultar todas las respuestas" : "Ver todas las respuestas"}
          </button>
        )}
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
        const mascotElement = !showAllExpanded && section.mascot && (
          <Image
            key="mascot"
            src={section.mascot}
            alt=""
            width={1484}
            height={1060}
            className="mx-auto h-auto w-full max-w-xs object-contain sm:max-w-sm"
          />
        );
        const fieldsList = visibleFields.flatMap((field) => {
          const fieldEl = (
            <FieldInput
              key={field.id}
              field={field}
              value={answers[field.id]}
              answers={answers}
              onChange={handleChange}
            />
          );
          if (section.mascotAfterField === field.id && mascotElement) {
            return [fieldEl, mascotElement];
          }
          return [fieldEl];
        });
        const isActive = showAllExpanded || index === currentStep;
        const celebrating = isActive && sectionCelebrate === section.id;
        const slideAnimClass =
          !showAllExpanded && isActive
            ? isSliding
              ? slideDirection === 1
                ? "slide-out-left"
                : "slide-out-right"
              : slideDirection === 1
              ? "slide-in-right"
              : "slide-in-left"
            : "";

        return (
          <section
            key={section.id}
            className={`relative rounded-2xl border p-5 transition lg:p-7 ${
              isActive ? "" : "hidden"
            } ${slideAnimClass} ${celebrating ? "border-emerald-400 bg-emerald-50/60" : "border-gray-200 bg-gray-50"}`}
          >
            {celebrating && (
              <span className="absolute -top-3 right-4 animate-bounce rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                ✓ ¡Sección completa!
              </span>
            )}
            {!section.mascotAfterField && mascotElement && (
              <div className="mb-4">{mascotElement}</div>
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
          {state.missing === 0
            ? "🎉 ¡Día completado! Guardado ✓"
            : `Guardado ✓ — te faltan ${state.missing} de ${state.total} campos para completar este día.`}
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
                disabled={isSliding}
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ← Anterior
              </button>
            )}
            {!isLastStep ? (
              <button
                type="button"
                onClick={goNext}
                disabled={currentStepIncomplete || isSliding}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold shadow-lg transition ${
                  currentStepIncomplete
                    ? "cursor-not-allowed bg-gray-200 text-gray-400 shadow-none"
                    : "bg-gray-900 text-white shadow-black/20 hover:bg-black"
                }`}
              >
                Siguiente →
              </button>
            ) : (
              submitButton
            )}
          </div>

          {sections.length > 1 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-base font-bold text-gray-700">
                  Paso {currentStep + 1} de {sections.length}
                </span>
                <span className="truncate pl-3 text-xs text-gray-400">{currentSection?.heading}</span>
              </div>
              <div className="flex gap-2">
                {sections.map((s, i) => {
                  const stat = sectionStats[i];
                  const complete = stat.total > 0 && stat.done >= stat.total;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goToStep(i)}
                      disabled={isSliding}
                      aria-label={`Ir a ${s.heading}`}
                      className={`h-2.5 flex-1 rounded-full transition disabled:cursor-not-allowed ${
                        complete ? "bg-emerald-400" : "bg-gray-700"
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

    {celebration && (
      <CelebrationModal
        day={day}
        totalDays={totalDays}
        totalXp={celebration.total}
        onClose={() => setCelebration(null)}
      />
    )}

    <style jsx>{`
      @keyframes slide-in-right {
        from {
          opacity: 0;
          transform: translateX(32px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slide-in-left {
        from {
          opacity: 0;
          transform: translateX(-32px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slide-out-left {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-32px);
        }
      }
      @keyframes slide-out-right {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(32px);
        }
      }
      :global(.slide-in-right) {
        animation: slide-in-right 0.22s ease-out;
      }
      :global(.slide-in-left) {
        animation: slide-in-left 0.22s ease-out;
      }
      :global(.slide-out-left) {
        animation: slide-out-left 0.22s ease-in forwards;
      }
      :global(.slide-out-right) {
        animation: slide-out-right 0.22s ease-in forwards;
      }
    `}</style>
    </div>
  );
}
