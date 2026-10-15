// Cliente mínimo de la API pública de Systeme.io. Solo se usa desde el servidor: la clave
// (SYSTEME_API_KEY, variable de entorno en Vercel) nunca llega al navegador.

const BASE = "https://api.systeme.io";

export class SystemeError extends Error {}

async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const key = process.env.SYSTEME_API_KEY;
  if (!key) throw new SystemeError("Falta la variable SYSTEME_API_KEY en Vercel.");

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "X-API-Key": key,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  // Límite de peticiones: se espera lo que pida Systeme.io y se reintenta una vez.
  if (res.status === 429 && retry) {
    const wait = Math.min(Number(res.headers.get("Retry-After")) || 2, 10);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return api<T>(path, init, false);
  }

  if (!res.ok) {
    const text = (await res.text().catch(() => "")).slice(0, 200);
    throw new SystemeError(`${init.method ?? "GET"} ${path} → ${res.status} ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json().catch(() => undefined)) as T;
}

type Page<T> = { items?: T[]; hasMore?: boolean };

export type SystemeTag = { id: number; name: string };
export type SystemeContact = { id: number; email?: string };

// Todas las etiquetas de la cuenta (nombre → id).
export async function listTags(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  let after: number | undefined;
  for (let i = 0; i < 20; i++) {
    const qs = new URLSearchParams({ limit: "100", order: "asc" });
    if (after) qs.set("startingAfter", String(after));
    const page = await api<Page<SystemeTag>>(`/api/tags?${qs}`);
    const items = page?.items ?? [];
    for (const t of items) map.set(t.name, t.id);
    if (!page?.hasMore || items.length === 0) break;
    after = items[items.length - 1].id;
  }
  return map;
}

export async function createTag(name: string): Promise<number> {
  const tag = await api<SystemeTag>("/api/tags", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return tag.id;
}

// Busca un contacto por correo. Se valida que el correo devuelto sea el pedido, para no
// tocar a otra persona si el filtro no se aplicara.
export async function findContactByEmail(email: string): Promise<SystemeContact | null> {
  // Systeme.io exige un límite entre 10 y 100.
  const qs = new URLSearchParams({ email, limit: "10" });
  const page = await api<Page<SystemeContact>>(`/api/contacts?${qs}`);
  const match = (page?.items ?? []).find(
    (c) => (c.email ?? "").trim().toLowerCase() === email.trim().toLowerCase()
  );
  return match ?? null;
}

export async function createContact(email: string, firstName: string): Promise<SystemeContact> {
  return api<SystemeContact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify({
      email,
      locale: "es",
      fields: firstName ? [{ slug: "first_name", value: firstName }] : [],
    }),
  });
}

export async function addTag(contactId: number, tagId: number): Promise<void> {
  await api<void>(`/api/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tagId }),
  });
}

export async function removeTag(contactId: number, tagId: number): Promise<void> {
  await api<void>(`/api/contacts/${contactId}/tags/${tagId}`, { method: "DELETE" });
}
