"use client";

import type { MissionField } from "@/lib/missionFields";
import { parseModulos, type ModuloCard, type ModulosData } from "@/lib/missionFields";
import CourseCardMockup from "@/components/CourseCardMockup";

function emptyModulo(): ModuloCard {
  return { titulo: "", descripcion: "" };
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
          <CourseCardMockup
            key={i}
            titulo={modulo.titulo}
            descripcion={modulo.descripcion}
            onTituloChange={(v) => update(i, { titulo: v })}
            onDescripcionChange={(v) => update(i, { descripcion: v })}
          />
        ))}
      </div>

      <input type="hidden" name={`field_${field.id}`} value={JSON.stringify({ modulos: items })} />
    </div>
  );
}
