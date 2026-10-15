import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { syncSysteme } from "@/lib/syncSysteme";

// Tarea diaria (Vercel Cron, ver vercel.json): deja en Systeme.io las etiquetas de avance e
// inactividad de cada usuario. Necesita estas variables de entorno en Vercel:
//  - CRON_SECRET: un texto largo y aleatorio; Vercel lo envía solo en cada llamada
//  - SUPABASE_SERVICE_ROLE_KEY: para poder leer a todos los usuarios sin sesión
//  - SYSTEME_API_KEY
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const result = await syncSysteme(supabase);
    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
