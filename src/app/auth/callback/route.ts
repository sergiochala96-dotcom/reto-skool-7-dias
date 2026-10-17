import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CAPTURE_COOKIE, LEAD_PENDING_COOKIE, parseCapture } from "@/lib/retoCapture";
import { registrarLead } from "@/lib/registrarLead";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const cookieStore = await cookies();

      // Regreso del enlace de "olvidé mi contraseña": a elegir la contraseña nueva.
      if (cookieStore.has("pw_reset")) {
        cookieStore.delete("pw_reset");
        return NextResponse.redirect(`${origin}/restablecer`);
      }

      // Cuenta nueva creada con Google: se registra igual que desde el formulario de /reto
      // (Systeme.io, origen del tráfico y Meta). Si la persona solo está entrando de nuevo, no.
      const user = data.user;
      const isNewGoogle =
        user?.app_metadata?.provider === "google" &&
        !!user.email &&
        Date.now() - new Date(user.created_at).getTime() < 2 * 60 * 1000;

      if (isNewGoogle && user?.email) {
        const capture = parseCapture(cookieStore.get(CAPTURE_COOKIE)?.value);
        const eventId = capture?.tracking.eventId ?? randomUUID();
        const meta = user.user_metadata as { full_name?: string; name?: string };
        const name = meta.full_name || meta.name || user.email.split("@")[0];

        await registrarLead(name, user.email, capture?.attribution, {
          ...capture?.tracking,
          eventId,
        });

        cookieStore.delete(CAPTURE_COOKIE);
        // El panel dispara el Lead en el píxel con este mismo ID y lo borra (una sola vez).
        cookieStore.set(LEAD_PENDING_COOKIE, eventId, {
          maxAge: 10 * 60,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si falló el regreso de una recuperación de contraseña, se explica en esa misma pantalla.
  if ((await cookies()).has("pw_reset")) {
    return NextResponse.redirect(`${origin}/olvide-contrasena?error=enlace`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
