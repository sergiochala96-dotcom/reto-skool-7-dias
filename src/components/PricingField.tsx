"use client";

import type { MissionField } from "@/lib/missionFields";
import { parsePricing, type PricingData, type PricingTier } from "@/lib/missionFields";

const inputBase =
  "rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-fuchsia-500 disabled:bg-gray-100 disabled:text-gray-400";

const MODELOS = [
  { value: "gratis", label: "Gratis", desc: "Gratis para unirse" },
  { value: "suscripcion", label: "Suscripción", desc: "Cobra mensual, anual o ambos" },
  {
    value: "freemium",
    label: "Freemium",
    desc: "Gratis para unirse con 1-2 niveles de actualización de pago",
  },
  { value: "niveles", label: "Niveles", desc: "2-3 niveles de pago" },
  { value: "pago_unico", label: "1 pago único", desc: "Pago único de 1 vez" },
] as const;

function emptyTier(nombre: string, activo = true, periodo: PricingTier["periodo"] = "mes"): PricingTier {
  return { nombre, activo, precio: "", periodo, beneficios: [""] };
}

function defaultTiersFor(modelo: PricingData["modelo"]): PricingTier[] {
  if (modelo === "freemium") {
    return [{ ...emptyTier("Estándar"), precio: "0" }, emptyTier("Premium"), emptyTier("VIP", false, "año")];
  }
  if (modelo === "niveles") {
    return [emptyTier("Nivel 1"), emptyTier("Nivel 2"), emptyTier("Nivel 3", false)];
  }
  return [];
}

function SubscriptionEditor({
  data,
  update,
}: {
  data: PricingData;
  update: (patch: Partial<PricingData>) => void;
}) {
  const periodos = [
    { value: "mensual", label: "Solo mensual" },
    { value: "ambos", label: "Mensual y anual" },
    { value: "anual", label: "Solo anual" },
  ] as const;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-2 text-xs font-medium text-gray-500">¿Cómo vas a cobrar?</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {periodos.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => update({ periodo: p.value })}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              data.periodo === p.value
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        {data.periodo !== "anual" && (
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Precio mensual</label>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">$</span>
              <input
                type="number"
                min={0}
                value={data.precioMensual ?? ""}
                onChange={(e) => update({ precioMensual: e.target.value })}
                className={`${inputBase} w-full py-2.5`}
              />
            </div>
          </div>
        )}
        {data.periodo !== "mensual" && data.periodo && (
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Precio anual</label>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">$</span>
              <input
                type="number"
                min={0}
                value={data.precioAnual ?? ""}
                onChange={(e) => update({ precioAnual: e.target.value })}
                className={`${inputBase} w-full py-2.5`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TiersEditor({
  modelo,
  tiers,
  updateTier,
}: {
  modelo: "freemium" | "niveles";
  tiers: PricingTier[];
  updateTier: (index: number, patch: Partial<PricingTier>) => void;
}) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => {
        const tier = tiers[i] ?? emptyTier(`Nivel ${i + 1}`);
        const isFreeFixed = modelo === "freemium" && i === 0;
        const isOptional = i === 2;
        const disabled = isOptional && !tier.activo;

        return (
          <div
            key={i}
            className={`rounded-xl border p-5 transition ${
              disabled ? "border-gray-100 bg-gray-50/60 opacity-60" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">{tier.nombre}</span>
              {isOptional && (
                <button
                  type="button"
                  onClick={() => updateTier(i, { activo: !tier.activo })}
                  aria-label="Activar nivel opcional"
                  className={`relative h-5 w-9 flex-shrink-0 rounded-full transition ${
                    tier.activo ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      tier.activo ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              )}
            </div>

            {isFreeFixed ? (
              <p className="mb-3 text-sm font-bold text-emerald-600">🏷️ Gratis</p>
            ) : (
              <div className="mb-3 flex items-center gap-1.5">
                <span className="text-gray-400">$</span>
                <input
                  type="number"
                  min={0}
                  disabled={disabled}
                  value={tier.precio}
                  onChange={(e) => updateTier(i, { precio: e.target.value })}
                  className={`${inputBase} w-16`}
                />
                <select
                  disabled={disabled}
                  value={tier.periodo}
                  onChange={(e) => updateTier(i, { periodo: e.target.value as PricingTier["periodo"] })}
                  className={`${inputBase} text-xs`}
                >
                  <option value="mes">/mes</option>
                  <option value="año">/año</option>
                  <option value="unico">único</option>
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {tier.beneficios.map((b, bi) => (
                <div key={bi} className="flex items-center gap-1.5">
                  <span className="text-fuchsia-500">•</span>
                  <input
                    disabled={disabled}
                    value={b}
                    placeholder="Ej: Acceso a Comunidad"
                    onChange={(e) => {
                      const next = [...tier.beneficios];
                      next[bi] = e.target.value;
                      updateTier(i, { beneficios: next });
                    }}
                    className={`${inputBase} w-full`}
                  />
                  {tier.beneficios.length > 1 && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        updateTier(i, { beneficios: tier.beneficios.filter((_, x) => x !== bi) })
                      }
                      aria-label="Quitar"
                      className="flex-shrink-0 text-gray-400 transition hover:text-gray-700 disabled:opacity-40"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => updateTier(i, { beneficios: [...tier.beneficios, ""] })}
              className="mt-2 text-xs font-medium text-fuchsia-600 transition hover:underline disabled:opacity-40"
            >
              + Añadir beneficio
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function PricingField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const data = parsePricing(value);

  const update = (patch: Partial<PricingData>) => {
    onChange(field.id, JSON.stringify({ ...data, ...patch }));
  };

  const selectModelo = (modelo: PricingData["modelo"]) => {
    if (modelo === data.modelo) return;
    const patch: Partial<PricingData> = { modelo };
    if (modelo === "freemium" || modelo === "niveles") {
      patch.tiers = defaultTiersFor(modelo);
    }
    update(patch);
  };

  const updateTier = (index: number, patch: Partial<PricingTier>) => {
    const tiers = [...(data.tiers ?? defaultTiersFor(data.modelo))];
    tiers[index] = { ...(tiers[index] ?? emptyTier(`Nivel ${index + 1}`)), ...patch };
    update({ tiers });
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-800">{field.label}</label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {MODELOS.map((m) => {
          const selected = data.modelo === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => selectModelo(m.value)}
              className={`rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-fuchsia-400 bg-fuchsia-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <span className="mb-1 flex items-center gap-2">
                <span
                  className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
                    selected ? "border-fuchsia-500 bg-fuchsia-500" : "border-gray-300"
                  }`}
                />
                <span className="text-sm font-semibold text-gray-900">{m.label}</span>
              </span>
              <span className="text-xs text-gray-500">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {data.modelo === "suscripcion" && <SubscriptionEditor data={data} update={update} />}

      {(data.modelo === "freemium" || data.modelo === "niveles") && (
        <TiersEditor
          modelo={data.modelo}
          tiers={data.tiers ?? defaultTiersFor(data.modelo)}
          updateTier={updateTier}
        />
      )}

      {data.modelo === "pago_unico" && (
        <div className="mt-4 max-w-xs">
          <label className="mb-1 block text-xs text-gray-500">Precio</label>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={data.precioUnico ?? ""}
              onChange={(e) => update({ precioUnico: e.target.value })}
              className={`${inputBase} w-full py-2.5`}
            />
          </div>
        </div>
      )}

      <input type="hidden" name={`field_${field.id}`} value={JSON.stringify(data)} />
    </div>
  );
}
