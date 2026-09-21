"use client";

import type { MissionField } from "@/lib/missionFields";
import { parseBonos, type Bono, type BonosData } from "@/lib/missionFields";

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-500";

function emptyBono(): Bono {
  return { nombre: "", incluye: "", valor: "" };
}

export default function BonosField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const data = parseBonos(value);
  const bonos = data.bonos ?? [];
  const items = bonos.length >= 1 ? bonos : [emptyBono()];

  const update = (next: Bono[]) => {
    const patch: BonosData = { bonos: next };
    onChange(field.id, JSON.stringify(patch));
  };

  const updateBono = (index: number, patch: Partial<Bono>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    update(next);
  };

  const addBono = () => update([...items, emptyBono()]);
  const removeBono = (index: number) => update(items.filter((_, i) => i !== index));

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-1 text-sm font-semibold text-gray-900">Bonos</p>
        <p className="mb-3 text-xs text-gray-500">Escribe al menos 1 bono que haga tu oferta irresistible</p>
        <div className="flex flex-col gap-3">
          {items.map((bono, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="whitespace-nowrap rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">
                  Bono {i + 1}
                </span>
                {i >= 1 && (
                  <button
                    type="button"
                    onClick={() => removeBono(i)}
                    aria-label="Quitar bono"
                    className="text-gray-400 transition hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="mb-1 block text-[11px] text-gray-500">Nombre del bono</label>
                  <input
                    value={bono.nombre}
                    placeholder="Ej: Plantillas de contenido"
                    onChange={(e) => updateBono(i, { nombre: e.target.value })}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-gray-500">Qué incluye</label>
                  <input
                    value={bono.incluye}
                    placeholder="Ej: 30 plantillas editables en Canva"
                    onChange={(e) => updateBono(i, { incluye: e.target.value })}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-gray-500">
                    Por qué es valioso / urgente resolverlo
                  </label>
                  <input
                    value={bono.valor}
                    placeholder="Ej: Ahorra horas de diseño desde el día 1"
                    onChange={(e) => updateBono(i, { valor: e.target.value })}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBono}
          className="mt-3 text-sm font-medium text-fuchsia-600 hover:underline"
        >
          + Añadir bono
        </button>
      </div>

      <input type="hidden" name={`field_${field.id}`} value={JSON.stringify({ bonos: items })} />
    </div>
  );
}
