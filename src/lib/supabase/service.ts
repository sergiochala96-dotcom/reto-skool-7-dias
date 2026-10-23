import { createClient } from "@supabase/supabase-js";

// Cliente con la service role: salta las políticas RLS. Solo para código de servidor que ya
// comprobó quién es quien llama (acciones del admin, tareas programadas).
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
