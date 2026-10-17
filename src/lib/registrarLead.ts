import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createContact, createTag, ensureTag, findContactByEmail, listTags } from "@/lib/systeme";
import { wantedTags } from "@/lib/syncSysteme";
import { cleanAttribution, type Attribution } from "@/lib/traffic";
import { sendLeadToMeta, type CapiTracking } from "@/lib/metaCapi";

// Paso común "al crear la cuenta" en /reto (con contraseña o con Google). Hace tres cosas,
// y un fallo en cualquiera NO debe frenar a la persona, que ya tiene su cuenta:
//  1) la guarda en Systeme.io por la API (NO por el formulario de Systeme.io: así no sale el
//     antiguo correo de "crea tu cuenta") y le pone las etiquetas "Skooly Leads" y
//     reto_sin_empezar (esta última dispara el correo de bienvenida),
//  2) guarda el lead con su origen de tráfico (UTM) para el panel de admin,
//  3) avisa a Meta del Lead desde el servidor (API de Conversiones).
//
// account: la cuenta recién creada con su sesión. Solo con sesión se puede dejar anotado en
// el perfil qué etiqueta se puso; sin ella (si Supabase pide confirmar el correo) la etiqueta
// la pone la sincronización diaria.
export type NewAccount = { supabase: SupabaseClient; userId: string };

export async function registrarLead(
  name: string,
  email: string,
  attribution?: Attribution,
  tracking?: CapiTracking,
  account?: NewAccount
): Promise<void> {
  const firstName = name.trim().split(/\s+/)[0]?.slice(0, 80) || email.split("@")[0];
  const cleanEmail = email.trim().toLowerCase();

  const results = await Promise.allSettled([
    guardarEnSysteme(firstName, cleanEmail, account),
    guardarLead(firstName, cleanEmail, attribution),
    sendLeadToMeta(firstName, cleanEmail, tracking),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`registrarLead (${["Systeme.io", "leads", "Meta"][i]}):`, r.reason);
    }
  });
}

async function guardarEnSysteme(firstName: string, email: string, account?: NewAccount) {
  let contact = await findContactByEmail(email);
  if (!contact) contact = await createContact(email, firstName);
  if (!account) return;

  // Etiqueta de origen + reto_sin_empezar (la persona acaba de registrarse: 0 días, recién entró).
  // Agregar reto_sin_empezar es lo que dispara el correo de bienvenida y, un día después, el
  // de activación (ver systemeCampaigns.ts).
  const wanted = wantedTags(0, 0);
  const tags = await listTags();
  for (const name of wanted) {
    const tagId = tags.get(name) ?? (await createTag(name));
    await ensureTag(contact, tagId);
  }

  // Se anota igual que lo hace la sincronización diaria, para que no repita el trabajo.
  await account.supabase
    .from("profiles")
    .update({ systeme_tags: wanted.join("|") })
    .eq("id", account.userId);
}

// Insert simple: si el correo ya existe, la base lo rechaza y se conserva el primer origen.
async function guardarLead(name: string, email: string, attribution?: Attribution) {
  const supabase = await createClient();
  await supabase.from("leads").insert({ name, email, ...cleanAttribution(attribution) });
}
