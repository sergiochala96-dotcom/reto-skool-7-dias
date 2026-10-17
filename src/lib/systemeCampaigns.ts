import { SKOOL_COMMUNITY_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";
import { createTag, listTags, systemeApi } from "@/lib/systeme";
import { listAll, type AutomationRule } from "@/lib/systemeAutomations";
import { WELCOME_TAG } from "@/lib/syncSysteme";

// Crea en Systeme.io una CAMPAÑA de correos con esperas entre pasos, y sus dos reglas:
//   - etiqueta agregada  -> suscribir a la campaña
//   - etiqueta eliminada -> cancelar la suscripción (si la persona vuelve, se corta la escalera)
// Solo CREA cosas nuevas (nunca edita ni borra nada existente) y es seguro repetirlo: si la
// campaña (mismo nombre), sus pasos (mismo asunto) o las reglas ya existen, los reutiliza.
// Los saludos van sin nombre a propósito: en reactivación suena más natural.

const LOGIN_URL = "https://skool.neobrandclub.com/login";
// Enlace del correo de bienvenida: si la persona ya tiene la sesión abierta entra directo a su
// panel, y si no, el sistema la manda al inicio de sesión.
const DASHBOARD_URL = "https://skool.neobrandclub.com/dashboard";

type StepSpec = {
  subject: string;
  previewText: string;
  bodyHtml: string;
  delay: { value: number; unit: "minute" | "hour" | "day" }; // espera respecto al paso anterior
  comment: string;
};

type CampaignSpec = {
  tag: string;
  campaignName: string;
  description: string;
  steps: StepSpec[];
};

export const CAMPAIGN_SPECS: Record<string, CampaignSpec> = {
  // Se agrega a los 7 días sin entrar: correo ya, +8 días (día 15) y +15 días (día 30).
  sin_conexion: {
    tag: "sin_conexion",
    campaignName: "[App] Reactivación: sin conexión (días 7, 15 y 30)",
    description: "Se activa al agregar la etiqueta sin_conexion. Se cancela si la persona vuelve.",
    steps: [
      {
        subject: "¿Seguimos con tu Skool?",
        previewText: "Tu progreso sigue guardado",
        comment: "Día 7",
        delay: { value: 0, unit: "minute" },
        bodyHtml: `
<p>Hola,</p>
<p>Hace una semana que no te veo por Skooly. Pasa, la vida se mete en el camino.</p>
<p>Lo bueno es que <strong>tu progreso sigue guardado exactamente donde lo dejaste</strong>. Tu siguiente misión te toma unos 15 minutos.</p>
<p><strong><a href="${LOGIN_URL}">Retomar mi reto aquí</a></strong></p>
<p>Sergio</p>
`.trim(),
      },
      {
        subject: "Una pregunta rápida",
        previewText: "Respóndeme con una letra",
        comment: "Día 15",
        delay: { value: 8, unit: "day" },
        bodyHtml: `
<p>Hola,</p>
<p>Quiero entender qué te frenó. Respóndeme este correo con una letra:</p>
<p><strong>A)</strong> No he tenido tiempo<br><strong>B)</strong> No sé por dónde seguir<br><strong>C)</strong> No era lo que esperaba</p>
<p>Con tu respuesta te ayudo personalmente. Y si prefieres retomar solo, aquí tienes tu acceso:</p>
<p><strong><a href="${LOGIN_URL}">Entrar a Skooly</a></strong></p>
<p>Sergio</p>
`.trim(),
      },
      {
        subject: "Última nota antes de dejarte tranquilo",
        previewText: "Tu cuenta queda abierta cuando quieras",
        comment: "Día 30",
        delay: { value: 15, unit: "day" },
        bodyHtml: `
<p>Hola,</p>
<p>No quiero llenarte la bandeja, así que este es mi último mensaje sobre esto.</p>
<p>Tu cuenta y tu progreso siguen ahí para cuando quieras retomar. Y si Skooly no es para ti en este momento, no pasa nada.</p>
<p><strong><a href="${LOGIN_URL}">Retomar cuando quieras</a></strong></p>
<p>Un abrazo,<br>Sergio</p>
`.trim(),
      },
    ],
  },

  // Un solo correo, un día después de que se agrega la etiqueta.
  sin_empezar: {
    tag: "reto_sin_empezar",
    campaignName: "[App] Activación: sin empezar (1 día después)",
    description: "Se activa al agregar la etiqueta reto_sin_empezar. Se cancela si la persona empieza.",
    steps: [
      {
        subject: "¿Qué te frenó para empezar?",
        previewText: "Son dos misiones rápidas y se abre tu Día 1",
        comment: "1 día después",
        delay: { value: 1, unit: "day" },
        bodyHtml: `
<p>Hola, ¿cómo vas?</p>
<p>Vi que creaste tu cuenta en Skooly pero todavía no empezaste. Es normal: uno se apunta con ilusión y la semana se complica.</p>
<p>Te cuento algo: <strong>empezar toma pocos minutos.</strong> Primero van dos misiones rápidas (unirte a la comunidad en Skool y a la de WhatsApp) y con eso se abre tu Día 1: unas preguntas sobre tu nicho y a quién quieres ayudar.</p>
<p><strong><a href="${LOGIN_URL}">Entrar y empezar</a></strong></p>
<p>Y si algo te frenó, respóndeme este correo. Lo leo yo.</p>
<p>Sergio</p>
`.trim(),
      },
    ],
  },

  // Correo de bienvenida: llega 2 minutos después de que la persona se registra (la app le pone
  // la etiqueta "bienvenida" en ese momento). Un solo correo; la etiqueta no se quita nunca.
  bienvenida: {
    tag: WELCOME_TAG,
    campaignName: "[App] Bienvenida (2 minutos después del registro)",
    description: "Se activa al agregar la etiqueta bienvenida, que la app pone al crear la cuenta.",
    steps: [
      {
        subject: "Bienvenido a Skooly, ya estás dentro",
        previewText: "Guarda este enlace para entrar cuando quieras",
        comment: "Bienvenida",
        delay: { value: 2, unit: "minute" },
        bodyHtml: `
<p>Hola {first_name}, ¿cómo vas?</p>
<p>Gracias por registrarte. Ya estás dentro de <strong>Skooly</strong>, la app con la que vas a crear tu comunidad de Skool paso a paso.</p>
<p>Guarda este enlace para entrar cuando quieras. Si ya tienes la sesión abierta, te lleva directo a tu panel:</p>
<p><strong><a href="${DASHBOARD_URL}">Entrar a mi panel de Skooly</a></strong></p>
<p>Esto es lo que te espera:</p>
<p>✅ 7 misiones diarias, paso a paso<br>✅ Prompts de IA listos para copiar y pegar<br>✅ Una comunidad lista para lanzar al terminar el reto</p>
<p>Tu primera misión es el Día 1 y te toma unos 10 minutos.</p>
<p>Una cosa más: para no perderte ningún aviso del reto ni las novedades de Skool, únete también a nuestras comunidades:</p>
<p>👉 <a href="${WHATSAPP_COMMUNITY_URL}">Unirme al boletín de Skool en WhatsApp</a><br>👉 <a href="${SKOOL_COMMUNITY_URL}">Unirme gratis al curso en Skool</a></p>
<p>Nos vemos dentro,</p>
<p>Sergio Chala<br>Skooly · Neobrand Academy</p>
`.trim(),
      },
    ],
  },
};

type Campaign = { id: number; name?: string };
type Step = { id: number; content?: { subject?: string }; state?: { isActive?: boolean } };

export type CampaignResult = {
  ok: boolean;
  lines?: string[];
  error?: string;
};

export async function createCampaignAutomation(key: string): Promise<CampaignResult> {
  const spec = CAMPAIGN_SPECS[key];
  if (!spec) return { ok: false, error: "Campaña desconocida." };
  const lines: string[] = [];

  try {
    // 1) Etiqueta (debe existir; si no, se crea).
    const tags = await listTags();
    const tagId = tags.get(spec.tag) ?? (await createTag(spec.tag));

    // 2) Campaña (se reutiliza si ya existe una con el mismo nombre).
    const campaigns = await listAll<Campaign>("/api/mailing/campaigns");
    let campaign = campaigns.find((c) => c.name === spec.campaignName);
    lines.push(
      campaign ? `Campaña #${campaign.id} (ya existía, se reutilizó)` : "Campaña: se crea ahora"
    );
    if (!campaign) {
      campaign = await systemeApi<Campaign>("/api/mailing/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: spec.campaignName, description: spec.description }),
      });
      lines[lines.length - 1] = `Campaña #${campaign.id} (creada)`;
    }

    // 3) Pasos, encadenados: cada uno se activa después del anterior con su espera.
    const existing = await listAll<Step>(`/api/mailing/campaigns/${campaign.id}/steps`);
    let previousId: number | null = null;
    for (const s of spec.steps) {
      let step = existing.find((e) => e.content?.subject === s.subject);
      if (step) {
        lines.push(`Paso "${s.subject}" (#${step.id}, ya existía)`);
      } else {
        step = await systemeApi<Step>(`/api/mailing/campaigns/${campaign.id}/steps`, {
          method: "POST",
          body: JSON.stringify({
            comment: s.comment,
            content: {
              subject: s.subject,
              previewText: s.previewText,
              editorType: "classic",
              bodyHtml: s.bodyHtml,
            },
            activation: {
              afterStepId: previousId,
              delay: s.delay,
              sendAtLocalTime: null,
              skipWeekdays: [],
            },
          }),
        });
        lines.push(
          `Paso "${s.subject}" (#${step.id}, creado; espera ${s.delay.value} ${s.delay.unit}${
            step.state?.isActive === false ? "; INACTIVO" : ""
          })`
        );
      }
      previousId = step.id;
    }

    // 4) Reglas: etiqueta agregada -> suscribir; etiqueta eliminada -> cancelar.
    const rules = await listAll<AutomationRule>("/api/automation/rules");
    const hasRule = (trigger: string, action: string) =>
      rules.some(
        (r) =>
          (r.triggers ?? []).some((t) => t.type === trigger && t.details?.tagId === tagId) &&
          (r.actions ?? []).some(
            (a) =>
              a.type === action &&
              (a.details as { campaignId?: number | null } | undefined)?.campaignId === campaign!.id
          )
      );

    for (const [trigger, action, label] of [
      ["tag_added", "subscribe_to_campaign", "Regla: etiqueta agregada → suscribir"],
      ["tag_removed", "unsubscribe_from_campaign", "Regla: etiqueta eliminada → cancelar"],
    ] as const) {
      if (hasRule(trigger, action)) {
        lines.push(`${label} (ya existía)`);
        continue;
      }
      const rule = await systemeApi<AutomationRule>("/api/automation/rules", {
        method: "POST",
        body: JSON.stringify({
          triggers: [{ type: trigger, details: { tagId } }],
          actions: [{ type: action, details: { campaignId: campaign.id } }],
        }),
      });
      lines.push(
        `${label} (#${rule.id}, creada, ${rule.state?.isActive === false ? "INACTIVA" : "ACTIVA"})`
      );
    }

    return { ok: true, lines };
  } catch (e) {
    return {
      ok: false,
      lines,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// Actualiza el asunto, la vista previa y el texto de los pasos de campaña ya creados.
// Los pasos se reconocen por su comentario ("Día 7", "Día 15"...), que no cambia aunque se
// edite el asunto. NO toca las esperas, el orden ni las reglas.
export async function updateCampaignSteps(keys: string[]): Promise<CampaignResult> {
  const lines: string[] = [];
  try {
    const campaigns = await listAll<Campaign>("/api/mailing/campaigns");
    for (const key of keys) {
      const spec = CAMPAIGN_SPECS[key];
      if (!spec) {
        lines.push(`${key}: campaña desconocida`);
        continue;
      }
      const campaign = campaigns.find((c) => c.name === spec.campaignName);
      if (!campaign) {
        lines.push(`${spec.campaignName}: no se encontró la campaña`);
        continue;
      }
      const steps = await listAll<Step & { comment?: string | null }>(
        `/api/mailing/campaigns/${campaign.id}/steps`
      );
      for (const s of spec.steps) {
        const step = steps.find((e) => e.comment === s.comment) ?? steps.find((e) => e.content?.subject === s.subject);
        if (!step) {
          lines.push(`${s.comment}: no se encontró el paso "${s.subject}"`);
          continue;
        }
        await systemeApi(`/api/mailing/campaign-steps/${step.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({
            comment: s.comment,
            content: { subject: s.subject, previewText: s.previewText, bodyHtml: s.bodyHtml },
          }),
        });
        lines.push(`${spec.tag} · ${s.comment}: paso #${step.id} actualizado`);
      }
    }
    return { ok: true, lines };
  } catch (e) {
    return { ok: false, lines, error: e instanceof Error ? e.message : String(e) };
  }
}
