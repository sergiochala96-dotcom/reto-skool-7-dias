import { createTag, listTags, systemeApi } from "@/lib/systeme";

// PILOTO: crea en Systeme.io UN correo de automatización y UNA regla:
//   cuando se agrega la etiqueta `reto_completado` -> se envía ese correo.
// Solo CREA cosas nuevas (nunca edita ni borra nada existente) y es seguro repetirlo:
// si el correo o la regla ya existen, los reutiliza en vez de duplicarlos.

const TAG = "reto_completado";

const EMAIL = {
  subject: "Lo lograste: tu Skool ya está armado",
  previewText: "Y ahora viene lo mejor",
  // Saludo neutro: la personalización con el nombre se agrega después desde el editor.
  bodyHtml: `
<p>Hola,</p>
<p>Terminaste los 7 días del reto. En serio, felicitaciones: la mayoría se queda en la intención y tú lo hiciste.</p>
<p>Ya tienes tu comunidad armada. El siguiente paso es lanzarla y ponerla a vender, y de eso trata el <strong>workshop en vivo del 21 al 22 de octubre</strong>: crear y lanzar tu Skool conmigo, paso a paso. Hay 30 cupos.</p>
<p style="text-align:center;margin:28px 0;">
  <a href="https://pay.hotmart.com/M107993635C?checkoutMode=10" style="background:#fbbf24;color:#000000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Quiero unirme al workshop</a>
</p>
<p>Sergio</p>
`.trim(),
};

type Page<T> = { items?: T[]; hasMore?: boolean };
type AutomationEmail = { id: number; content?: { subject?: string } };
type AutomationRule = {
  id: number;
  triggers?: { type: string; details?: { tagId?: number | null } }[];
  actions?: { type: string; details?: { automationEmailId?: number | null } }[];
  state?: { isActive?: boolean };
};

async function listAll<T extends { id: number }>(path: string): Promise<T[]> {
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

export type PilotResult = {
  ok: boolean;
  tagId?: number;
  emailId?: number;
  ruleId?: number;
  emailReused?: boolean;
  ruleReused?: boolean;
  isActive?: boolean | null;
  error?: string;
};

export async function createPilotAutomation(): Promise<PilotResult> {
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
