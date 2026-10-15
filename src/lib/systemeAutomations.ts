import { createTag, listTags, systemeApi } from "@/lib/systeme";

// Crea en Systeme.io automatizaciones de UN solo correo:
//   cuando se agrega la etiqueta X -> se envía el correo Y.
// Solo CREA cosas nuevas (nunca edita ni borra nada existente) y es seguro repetirlo:
// si el correo (mismo asunto) o la regla ya existen, los reutiliza en vez de duplicarlos.
// Personalización: {first_name} es el nombre de la persona (sintaxis de Systeme.io).

type AutomationSpec = {
  tag: string;
  subject: string;
  previewText: string;
  bodyHtml: string;
};

const BUTTON_STYLE =
  "background:#fbbf24;color:#000000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;";

export const AUTOMATION_SPECS: Record<string, AutomationSpec> = {
  completado: {
    tag: "reto_completado",
    subject: "Lo lograste: tu Skool ya está armado",
    previewText: "Tu comunidad ya está lista para recibir gente",
    bodyHtml: `
<p>Hola {first_name},</p>
<p>Terminaste los 7 días del reto. En serio, felicitaciones: la mayoría se queda en la intención y tú lo hiciste.</p>
<p>Ya tienes tu comunidad armada: su identidad, la fachada, los niveles y el mapa de ruta. <strong>Lo más importante ahora es no dejarla quieta.</strong> Invita a tus primeras personas y publica tu mensaje de bienvenida esta misma semana.</p>
<p>Y no olvides abrir tu <strong>Cofre del Tesoro</strong>: es tu premio por haber terminado.</p>
<p style="text-align:center;margin:28px 0;"><a href="https://skool.neobrandclub.com/cofre" style="${BUTTON_STYLE}">Abrir mi Cofre del Tesoro</a></p>
<p>Cuéntame cómo va tu comunidad: respóndeme este correo, que lo leo yo.</p>
<p>Sergio</p>
`.trim(),
  },
  casi_listo: {
    tag: "reto_casi_listo",
    subject: "Te falta muy poco para terminar",
    previewText: "Un par de misiones y tu Skool queda listo",
    bodyHtml: `
<p>Hola {first_name},</p>
<p>Vi que ya vas por el final del reto. Y justo ese tramo es donde mucha gente se frena, aunque ya hizo lo más difícil.</p>
<p><strong>Te faltan solo 1 o 2 misiones</strong>, unos 15 minutos cada una. Al terminarlas, tu Skool queda armado y desbloqueas tu Cofre del Tesoro.</p>
<p style="text-align:center;margin:28px 0;"><a href="https://skool.neobrandclub.com/login" style="${BUTTON_STYLE}">Terminar mi reto</a></p>
<p>Si te trabaste en alguna misión, respóndeme este correo y lo resolvemos.</p>
<p>Sergio</p>
`.trim(),
  },
};

type Page<T> = { items?: T[]; hasMore?: boolean };
type AutomationEmail = { id: number; content?: { subject?: string } };
export type AutomationRule = {
  id: number;
  triggers?: { type: string; details?: { tagId?: number | null } }[];
  actions?: { type: string; details?: { automationEmailId?: number | null } }[];
  state?: { isActive?: boolean };
};

export async function listAll<T extends { id: number }>(path: string): Promise<T[]> {
  const all: T[] = [];
  let after: number | undefined;
  for (let i = 0; i < 10; i++) {
    const qs = new URLSearchParams({ limit: "100", order: "asc" });
    if (after) qs.set("startingAfter", String(after));
    const page = await systemeApi<Page<T>>(`${path}?${qs}`);
    const items = page?.items ?? [];
    all.push(...items);
    if (!page?.hasMore || items.length === 0) break;
    after = items[items.length - 1].id;
  }
  return all;
}

export type AutomationResult = {
  ok: boolean;
  tagId?: number;
  emailId?: number;
  ruleId?: number;
  emailReused?: boolean;
  ruleReused?: boolean;
  isActive?: boolean | null;
  error?: string;
};

export async function createAutomation(key: string): Promise<AutomationResult> {
  const spec = AUTOMATION_SPECS[key];
  if (!spec) return { ok: false, error: "Automatización desconocida." };
  const TAG = spec.tag;
  const EMAIL = spec;
  try {
    // 1) La etiqueta (si no existiera, se crea).
    const tags = await listTags();
    const tagId = tags.get(TAG) ?? (await createTag(TAG));

    // 2) El correo: se reutiliza si ya existe uno con el mismo asunto.
    const emails = await listAll<AutomationEmail>("/api/mailing/automation-emails");
    let email = emails.find((e) => e.content?.subject === EMAIL.subject);
    const emailReused = !!email;
    if (!email) {
      email = await systemeApi<AutomationEmail>("/api/mailing/automation-emails", {
        method: "POST",
        body: JSON.stringify({
          content: {
            subject: EMAIL.subject,
            previewText: EMAIL.previewText,
            editorType: "classic",
            bodyHtml: EMAIL.bodyHtml,
          },
        }),
      });
    }

    // 3) La regla: etiqueta agregada -> enviar ese correo (no se duplica).
    const rules = await listAll<AutomationRule>("/api/automation/rules");
    let rule = rules.find(
      (r) =>
        (r.triggers ?? []).some((t) => t.type === "tag_added" && t.details?.tagId === tagId) &&
        (r.actions ?? []).some(
          (a) => a.type === "send_email" && a.details?.automationEmailId === email!.id
        )
    );
    const ruleReused = !!rule;
    if (!rule) {
      rule = await systemeApi<AutomationRule>("/api/automation/rules", {
        method: "POST",
        body: JSON.stringify({
          triggers: [{ type: "tag_added", details: { tagId } }],
          actions: [{ type: "send_email", details: { automationEmailId: email.id } }],
        }),
      });
    }

    return {
      ok: true,
      tagId,
      emailId: email.id,
      ruleId: rule.id,
      emailReused,
      ruleReused,
      isActive: rule.state?.isActive ?? null,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// Actualiza el asunto, la vista previa y el texto de un correo ya creado (se busca por su
// asunto). No cambia nada más (ni la regla ni la etiqueta).
export type UpdateResult = { ok: boolean; lines: string[]; error?: string };

export async function updateAutomationEmails(keys: string[]): Promise<UpdateResult> {
  const lines: string[] = [];
  try {
    const emails = await listAll<AutomationEmail>("/api/mailing/automation-emails");
    for (const key of keys) {
      const spec = AUTOMATION_SPECS[key];
      if (!spec) {
        lines.push(`${key}: automatización desconocida`);
        continue;
      }
      const email = emails.find((e) => e.content?.subject === spec.subject);
      if (!email) {
        lines.push(`${spec.tag}: no se encontró el correo "${spec.subject}" (¿aún no lo creaste?)`);
        continue;
      }
      await systemeApi<AutomationEmail>(`/api/mailing/automation-emails/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({
          content: {
            subject: spec.subject,
            previewText: spec.previewText,
            bodyHtml: spec.bodyHtml,
          },
        }),
      });
      lines.push(`${spec.tag}: correo #${email.id} actualizado`);
    }
    return { ok: true, lines };
  } catch (e) {
    return { ok: false, lines, error: e instanceof Error ? e.message : String(e) };
  }
}
