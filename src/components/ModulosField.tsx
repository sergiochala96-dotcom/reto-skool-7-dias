"use client";

import type { MissionField } from "@/lib/missionFields";
import { parseModulos, type ModuloCard, type ModulosData } from "@/lib/missionFields";

function emptyModulo(): ModuloCard {
  return { titulo: "", descripcion: "" };
}

function ModuloCardEditor({
  index,
  modulo,
  onChange,
}: {
  index: number;
  modulo: ModuloCard;
  onChange: (patch: Partial<ModuloCard>) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Portada: placeholder decorativo lila, no editable */}
      <div className="relative h-44 w-full overflow-hidden bg-violet-100">
        <svg
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="400" height="160" fill="#EDE9FE" />
          <circle cx="55" cy="42" r="22" fill="#FFFFFF" fillOpacity="0.55" />
          <path
            d="M0,95 C70,45 140,145 210,95 C280,45 330,125 400,85 L400,160 L0,160 Z"
            fill="#DDD6FE"
          />
        </svg>
        <span className="absolute left-3 top-3 rounded-full bg-gray-700/80 px-3 py-1.5 text-xs font-bold text-white">
          Borrador
        </span>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500">
          ⋯
        </span>
      </div>

      {/* Contenido editable */}
      <div className="p-6">
        <input
          value={modulo.titulo}
          maxLength={50}
          placeholder="Edita el Título"
          onChange={(e) => onChange({ titulo: e.target.value })}
          className="w-full border-none bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400"
        />
        <textarea
          value={modulo.descripcion}
          maxLength={200}
          placeholder="Edita la descripción"
          onChange={(e) => onChange({ descripcion: e.target.value })}
          rows={3}
          className="mt-2 w-full resize-none border-none bg-transparent text-base font-light text-gray-500 outline-none placeholder:text-gray-400"
        />
        <p className="mt-2 text-right text-xs text-gray-400">
          {modulo.titulo.length}/50 · {modulo.descripcion.length}/200
        </p>
        <div className="mt-3 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
          0%
        </div>
      </div>
    </div>
  );
}

export default function ModulosField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const data = parseModulos(value);
  const modulos = data.modulos ?? [];
  const items = modulos.length >= 2 ? modulos.slice(0, 2) : [emptyModulo(), emptyModulo()];

  const update = (index: number, patch: Partial<ModuloCard>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    const payload: ModulosData = { modulos: next };
    onChange(field.id, JSON.stringify(payload));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((modulo, i) => (
          <ModuloCardEditor
            key={i}
            index={i}
            modulo={modulo}
            onChange={(patch) => update(i, patch)}
          />
        ))}
      </div>

      <input type="hidden" name={`field_${field.id}`} value={JSON.stringify({ modulos: items })} />
    </div>
  );
}
