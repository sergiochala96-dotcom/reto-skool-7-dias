import type { Metadata } from "next";
import Link from "next/link";
import { Heading, PlansGrid } from "@/components/PlanesSection";
import RefreshOnFocus from "@/components/RefreshOnFocus";
import { getSidebarData } from "@/lib/sidebar-data";
import { createClient } from "@/lib/supabase/server";
import "../../ventas.css";

export const metadata: Metadata = {
  title: "Planes | Skooly",
};

// Pantalla interna con solo los planes, con la misma identidad que la portada.
export default async function PlanesPanelPage() {
  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan, coins, lives } =
    await getSidebarData();

  // Con un plan de pago se muestra cómo gestionar o cancelar la suscripción, con el correo con el
  // que se pagó (puede ser distinto al de la cuenta).
  let payerEmail: string | null = null;
  if (plan !== "standard") {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("creem_customer_email")
      .eq("id", user.id)
      .single();
    payerEmail = profile?.creem_customer_email ?? null;
  }

  return (
    <>

      <main className="ventas min-w-0 flex-1 bg-[#0a0614] px-4 py-14 sm:py-20">
        <div className="v-glow v-glow-violet left-1/2 top-0 h-[28rem] w-[44rem] -translate-x-1/2" />
        <div className="v-glow v-glow-blue -right-40 top-1/2 h-[24rem] w-[24rem]" />

        <RefreshOnFocus />
        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/dashboard"
            className="v-btn v-btn-ghost !px-4 !py-2.5 !text-sm"
          >
            ← Volver al inicio
          </Link>

          <div className="mt-6">
            <Heading
            eyebrow="Planes"
            title="Elige cómo quieres avanzar"
            text="Empieza gratis. Si quieres seguir después del reto o ir acompañado, tienes más opciones."
            />
          </div>
          <div className="mt-16">
            <PlansGrid current={plan} userId={user.id} />
          </div>

          {plan !== "standard" && (
            <div className="v-glass mx-auto mt-10 max-w-2xl p-6 text-center">
              <p className="font-semibold">Gestiona tu suscripción</p>
              <p className="v-muted mt-1 text-sm leading-relaxed">
                Puedes ver tus recibos, cambiar tu método de pago o cancelar cuando quieras. Al
                cancelar conservas el acceso hasta el final del período que ya pagaste. Entra con el
                correo con el que pagaste
                {payerEmail ? (
                  <>
                    : <strong className="text-white">{payerEmail}</strong>
                  </>
                ) : (
                  "."
                )}
              </p>
              <a
                href="https://creem.io/my-orders/login"
                target="_blank"
                rel="noopener noreferrer"
                className="v-btn v-btn-ghost mt-4"
              >
                Gestionar o cancelar mi suscripción
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
