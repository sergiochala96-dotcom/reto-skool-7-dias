"use client";

import type { MissionField } from "@/lib/missionFields";
import { parseTerminos, type TerminosData } from "@/lib/missionFields";

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-500";

const selectBase =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-fuchsia-500";

export default function TerminosField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const data = parseTerminos(value);

  const update = (patch: Partial<TerminosData>) => {
    onChange(field.id, JSON.stringify({ ...data, ...patch }));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="mb-1 text-sm font-semibold text-gray-900">Garantía</p>
          <p className="mb-3 text-xs text-gray-500">
            ¿Qué riesgo le quitas a tu miembro al unirse?
          </p>
          <select
            value={data.garantiaTipo ?? ""}
            onChange={(e) => update({ garantiaTipo: e.target.value as TerminosData["garantiaTipo"] })}
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
            onChange={(e) => update({ escasezTipo: e.target.value as TerminosData["escasezTipo"] })}
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
            onChange={(e) => update({ urgenciaTipo: e.target.value as TerminosData["urgenciaTipo"] })}
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
