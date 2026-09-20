"use client";

import type { MissionField } from "@/lib/missionFields";
import { parseOffer, type Bono, type OfferData } from "@/lib/missionFields";

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-500";

const selectBase =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-fuchsia-500";

function emptyBono(): Bono {
  return { nombre: "", incluye: "", valor: "" };
}

function BonosEditor({
  bonos,
  update,
}: {
  bonos: Bono[];
  update: (bonos: Bono[]) => void;
}) {
  const items = bonos.length >= 2 ? bonos : [emptyBono(), emptyBono()];

  const updateBono = (index: number, patch: Partial<Bono>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    update(next);
  };

  const addBono = () => update([...items, emptyBono()]);
  const removeBono = (index: number) => update(items.filter((_, i) => i !== index));

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-1 text-sm font-semibold text-gray-900">Bonos</p>
      <p className="mb-3 text-xs text-gray-500">Escribe mínimo 2 bonos que hagan tu oferta irresistible</p>
      <div className="flex flex-col gap-3">
        {items.map((bono, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="whitespace-nowrap rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">
                Bono {i + 1}
              </span>
              {i >= 2 && (
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
  );
}

export default function OfferField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const data = parseOffer(value);

  const update = (patch: Partial<OfferData>) => {
    onChange(field.id, JSON.stringify({ ...data, ...patch }));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}

      <div className="flex flex-col gap-4">
        <BonosEditor bonos={data.bonos ?? []} update={(bonos) => update({ bonos })} />

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-900">Garantía</p>
          <p className="mb-3 text-xs text-gray-500">
            ¿Qué riesgo le quitas a tu miembro al unirse?
          </p>
          <select
            value={data.garantiaTipo ?? ""}
            onChange={(e) => update({ garantiaTipo: e.target.value as OfferData["garantiaTipo"] })}
            className={selectBase}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="incondicional">Incondicional (&quot;devolución sin preguntas&quot;)</option>
            <option value="condicional">Condicional (&quot;si cumples X, garantizamos Y&quot;)</option>
            <option value="resultado">Basada en resultado (&quot;logras X o seguimos trabajando gratis&quot;)</option>
            <option value="sin_garantia">Sin garantía</option>
          </select>
          {data.garantiaTipo && data.garantiaTipo !== "sin_garantia" && (
            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-500">
                Redacta tu garantía en una frase
              </label>
              <input
                value={data.garantiaTexto ?? ""}
                placeholder="Ej: Si en 14 días no ves resultados, te devolvemos tu dinero."
                onChange={(e) => update({ garantiaTexto: e.target.value })}
                className={inputBase}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-900">Escasez</p>
          <p className="mb-3 text-xs text-gray-500">¿Tu oferta tiene un límite de cupos?</p>
          <select
            value={data.escasezTipo ?? ""}
            onChange={(e) => update({ escasezTipo: e.target.value as OfferData["escasezTipo"] })}
            className={selectBase}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="cupos">Cupos limitados</option>
            <option value="primeros_n">Solo para primeros N miembros</option>
            <option value="sin_escasez">Sin escasez por ahora</option>
          </select>
          {(data.escasezTipo === "cupos" || data.escasezTipo === "primeros_n") && (
            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-500">Número de cupos</label>
              <input
                type="number"
                min={0}
                value={data.escasezNumero ?? ""}
                onChange={(e) => update({ escasezNumero: e.target.value })}
                className={inputBase}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-900">Urgencia</p>
          <p className="mb-3 text-xs text-gray-500">¿Qué pasa si no actúan ahora?</p>
          <select
            value={data.urgenciaTipo ?? ""}
            onChange={(e) => update({ urgenciaTipo: e.target.value as OfferData["urgenciaTipo"] })}
            className={selectBase}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="precio_sube">Precio sube después de fecha límite</option>
            <option value="bono_se_pierde">Bono se pierde después de fecha límite</option>
            <option value="sin_urgencia">Sin urgencia por ahora</option>
          </select>
          {(data.urgenciaTipo === "precio_sube" || data.urgenciaTipo === "bono_se_pierde") && (
            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-500">Fecha límite</label>
              <input
                type="date"
                value={data.urgenciaFecha ?? ""}
                onChange={(e) => update({ urgenciaFecha: e.target.value })}
                className={inputBase}
              />
            </div>
          )}
        </div>
      </div>

      <input type="hidden" name={`field_${field.id}`} value={JSON.stringify(data)} />
    </div>
  );
}
