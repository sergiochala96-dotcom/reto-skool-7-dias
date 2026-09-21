import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSidebarData } from "@/lib/sidebar-data";
import Sidebar from "@/components/Sidebar";
import { MISSIONS, TOTAL_DAYS } from "@/lib/challenge";
import {
  getMissionSections,
  parseBonos,
  parseTerminos,
  parsePricing,
  type Answers,
  type MissionField,
  type PricingTier,
} from "@/lib/missionFields";

const MODELO_LABELS: Record<string, string> = {
  gratis: "Gratis",
  suscripcion: "Suscripción",
  freemium: "Freemium",
  niveles: "Niveles",
  pago_unico: "1 pago único",
};

const GARANTIA_LABELS: Record<string, string> = {
  incondicional: "Incondicional",
  condicional: "Condicional",
  resultado: "Basada en resultado",
  sin_garantia: "Sin garantía",
};

const ESCASEZ_LABELS: Record<string, string> = {
  cupos: "Cupos limitados",
  primeros_n: "Solo para primeros N miembros",
  sin_escasez: "Sin escasez",
};

const URGENCIA_LABELS: Record<string, string> = {
  precio_sube: "Precio sube después de la fecha límite",
  bono_se_pierde: "Bono se pierde después de la fecha límite",
  sin_urgencia: "Sin urgencia",
};

function formatBonos(value: string | undefined): string {
  const data = parseBonos(value);
  const bonos = (data.bonos ?? []).filter((b) => b.nombre.trim());
  return bonos.map((b, i) => `Bono ${i + 1}: ${b.nombre} — ${b.incluye} (${b.valor})`).join("\n");
}

function formatTerminos(value: string | undefined): string {
  const data = parseTerminos(value);
  const parts: string[] = [];

  if (data.garantiaTipo) {
    const label = GARANTIA_LABELS[data.garantiaTipo] ?? data.garantiaTipo;
    parts.push(`Garantía: ${label}${data.garantiaTexto ? ` — ${data.garantiaTexto}` : ""}`);
  }
  if (data.escasezTipo) {
    const label = ESCASEZ_LABELS[data.escasezTipo] ?? data.escasezTipo;
    parts.push(`Escasez: ${label}${data.escasezNumero ? ` (${data.escasezNumero} cupos)` : ""}`);
  }
  if (data.urgenciaTipo) {
    const label = URGENCIA_LABELS[data.urgenciaTipo] ?? data.urgenciaTipo;
    parts.push(`Urgencia: ${label}${data.urgenciaFecha ? ` — ${data.urgenciaFecha}` : ""}`);
  }

  return parts.join("\n");
}

function formatTier(t: PricingTier): string {
  const precio =
    t.precio && t.precio !== "0"
      ? `$${t.precio}${t.periodo === "unico" ? "" : `/${t.periodo}`}`
      : "Gratis";
  const beneficios = t.beneficios.filter(Boolean).join(", ");
  return `${t.nombre}: ${precio}${beneficios ? ` — ${beneficios}` : ""}`;
}

function formatPricing(value: string | undefined): string {
  const data = parsePricing(value);
  if (!data.modelo) return "";
  const parts = [MODELO_LABELS[data.modelo] ?? data.modelo];

  if (data.modelo === "suscripcion") {
    if (data.periodo !== "anual" && data.precioMensual) parts.push(`$${data.precioMensual}/mes`);
    if (data.periodo !== "mensual" && data.precioAnual) parts.push(`$${data.precioAnual}/año`);
  }
  if (data.modelo === "pago_unico" && data.precioUnico) parts.push(`$${data.precioUnico}`);
  if (data.modelo === "freemium" || data.modelo === "niveles") {
    (data.tiers ?? [])
      .filter((t) => t.activo)
      .forEach((t) => parts.push(formatTier(t)));
  }
  return parts.join("\n");
}

function formatAnswer(field: MissionField, value: string | string[]): string {
  const labelFor = (v: string) => field.options?.find((o) => o.value === v)?.label ?? v;
  if (field.type === "pricing") return formatPricing(value as string);
  if (field.type === "bonos") return formatBonos(value as string);
  if (field.type === "terminos") return formatTerminos(value as string);
  if (field.type === "range" && Array.isArray(value)) return value.join(" - ");
  if (Array.isArray(value)) return value.filter(Boolean).map(labelFor).join(", ");
  return labelFor(value);
}

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { nombre, user, avatarUrl, admin, completedDays } = await getSidebarData();
  if (!admin) redirect("/dashboard");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, created_at")
    .eq("id", userId)
    .single();
  if (!profile) notFound();

  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("day")
    .eq("user_id", userId);

  const { data: answerRows } = await supabase
    .from("mission_answers")
    .select("day, answers")
    .eq("user_id", userId);

  const doneDays = new Set((progress ?? []).map((p) => p.day));
  const answersByDay = new Map<number, Answers>(
    (answerRows ?? []).map((r) => [r.day, (r.answers ?? {}) as Answers])
  );

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
      />

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <a href="/admin" className="text-sm text-fuchsia-300 hover:underline">
            ← Volver a usuarios
          </a>

          <header className="mb-8 mt-4">
            <p className="text-sm text-white/50">Respuestas de</p>
            <h1 className="text-2xl font-bold text-white">
              {profile.display_name ?? profile.email}
            </h1>
            <p className="text-sm text-white/40">{profile.email}</p>
          </header>

          <div className="space-y-6">
            {MISSIONS.map((m) => {
              const sections = getMissionSections(m.day);
              const answers = answersByDay.get(m.day) ?? {};
              const isDone = doneDays.has(m.day);
              const fields = sections
                .flatMap((s) => s.fields)
                .filter((f) => f.type !== "info" && f.type !== "prompt" && f.type !== "link");
              const answeredFields = fields.filter((f) => {
                const v = answers[f.id];
                if (f.type === "pricing") return formatPricing(v as string) !== "";
                if (f.type === "bonos") return formatBonos(v as string) !== "";
                if (f.type === "terminos") return formatTerminos(v as string) !== "";
                if (Array.isArray(v)) return v.some((x) => x !== "");
                return v !== undefined && v !== "";
              });

              return (
                <div key={m.day} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <span>{m.emoji}</span> Día {m.day}: {m.title}
                    </h2>
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
                        isDone
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {isDone ? "Completado" : "Pendiente"}
                    </span>
                  </div>

                  {answeredFields.length === 0 ? (
                    <p className="text-sm text-white/40">Sin respuestas todavía.</p>
                  ) : (
                    <div className="space-y-3">
                      {answeredFields.map((f) => {
                        const v = answers[f.id];
                        const display = formatAnswer(f, v);
                        return (
                          <div key={f.id}>
                            <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-300/80">
                              {f.label}
                            </p>
                            <p className="whitespace-pre-wrap text-sm text-white/80">{display}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            {doneDays.size}/{TOTAL_DAYS} días completados
          </p>
        </div>
      </main>
    </div>
  );
}
