import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SkoolyLogo from "@/components/SkoolyLogo";
import { createClient } from "@/lib/supabase/server";
import { SUPPORT_EMAIL } from "@/lib/legal";
import { MISSIONS } from "@/lib/challenge";
import { Heading, PlansGrid } from "@/components/PlanesSection";
import "./ventas.css";

export const metadata: Metadata = {
  title: "Skooly | Crea tu Skool en 7 días",
  description:
    "Crea tu comunidad en Skool en 7 días con misiones guiadas y prompts de IA. Empieza gratis o elige el plan que te acompañe después del reto.",
};

const BENEFITS = [
  {
    emoji: "🚀",
    title: "Tu Skool listo en 7 días",
    text: "Pasas de la idea a una comunidad creada y configurada, sin quedarte a medias.",
  },
  {
    emoji: "🧭",
    title: "Sabes qué hacer cada día",
    text: "Una misión por día te dice exactamente el siguiente paso. Cero parálisis por análisis.",
  },
  {
    emoji: "🤖",
    title: "La IA hace el trabajo pesado",
    text: "Prompts de IA listos para copiar y pegar: textos, ideas y estructura en minutos.",
  },
  {
    emoji: "🔥",
    title: "Constancia sin esfuerzo",
    text: "Avanzas día a día, ves tu progreso y te recordamos tu reto si te desconectas.",
  },
  {
    emoji: "🤝",
    title: "Acompañado desde el inicio",
    text: "Entras al boletín de WhatsApp y a la comunidad en Skool para no hacerlo solo.",
  },
  {
    emoji: "🏆",
    title: "Un premio al final",
    text: "Completa las 7 misiones y desbloquea el Cofre del Tesoro.",
  },
];

const FEATURES = [
  {
    emoji: "📅",
    title: "Misiones diarias",
    text: "Cada día se abre al terminar el anterior, con instrucciones claras y formularios guiados.",
  },
  {
    emoji: "📊",
    title: "Panel de progreso",
    text: "Mira cuántos días llevas y qué sigue, en una sola pantalla.",
  },
  {
    emoji: "✍️",
    title: "Prompts de IA listos",
    text: "Copia, pega y adapta: tu audiencia, tu identidad y tu oferta, con ayuda de la IA.",
  },
  {
    emoji: "📲",
    title: "App en tu celular",
    text: "Instala Skooly en la pantalla de inicio y úsala como una aplicación.",
  },
  {
    emoji: "🔔",
    title: "Avisos en la pantalla de bloqueo",
    text: "Activa las notificaciones y te avisamos de las novedades y de tu reto.",
  },
  {
    emoji: "🎁",
    title: "Cofre del Tesoro",
    text: "El premio final para quien completa los 7 días.",
  },
];

const FAQS = [
  {
    q: "¿El reto realmente es gratis?",
    a: "Sí. El plan Standard cuesta $0 e incluye el acceso al reto de 7 días.",
  },
  {
    q: "¿Qué es Skool?",
    a: "Skool es la plataforma donde creas y gestionas tu comunidad y tus cursos. En el reto vas armando la tuya paso a paso.",
  },
  {
    q: "¿Qué pasa cuando termino los 7 días?",
    a: "Terminas con tu Skool configurado y abres el Cofre del Tesoro. Con el plan Premium desbloqueas todos los niveles siguientes y recibes recursos cada mes.",
  },
  {
    q: "¿Puedo usar Skooly desde el celular?",
    a: "Sí. Puedes instalar Skooly en la pantalla de inicio y activar los avisos para que te recordemos tu reto.",
  },
  {
    q: "¿Cómo pago y puedo cancelar cuando quiera?",
    a: "Los planes de pago son suscripciones mensuales en dólares (USD), procesadas por Creem. Puedes cancelar cuando quieras y conservas el acceso hasta el final del período que ya pagaste. Los pagos ya realizados no se reembolsan, salvo error de cobro (ver política de reembolsos).",
  },
  {
    q: "¿Cómo funciona el plan VIP?",
    a: "Incluye el grupo de WhatsApp VIP de Skoolers, sesiones grupales en vivo de Skool y una sesión 1 a 1 de 30 minutos cada mes.",
  },
];

// Portada de Skooly (página de ventas). Quien ya tiene sesión ve "Mi panel" en vez de "Empezar gratis".
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="ventas min-h-screen">
      {/* Navegación */}
      <header className="sticky top-3 z-50 px-4">
        <nav className="v-glass mx-auto flex max-w-5xl items-center justify-between gap-4 !rounded-full px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
            />
            <SkoolyLogo />
          </Link>
          <div className="v-muted hidden items-center gap-6 text-sm md:flex">
            <a href="#beneficios" className="transition hover:text-white">
              Beneficios
            </a>
            <a href="#caracteristicas" className="transition hover:text-white">
              Características
            </a>
            <a href="#planes" className="transition hover:text-white">
              Planes
            </a>
            <a href="#preguntas" className="transition hover:text-white">
              Preguntas
            </a>
          </div>
          <div className="flex items-center gap-2">
            {!user && (
              <Link
                href="/login"
                className="v-muted hidden px-3 text-sm transition hover:text-white sm:block"
              >
                Iniciar sesión
              </Link>
            )}
            <Link
              href={user ? "/dashboard" : "/reto"}
              className="v-btn v-btn-solid !px-4 !py-2.5 !text-sm"
            >
              {user ? "Mi panel" : "Empezar gratis"}
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Héroe */}
        <section className="relative px-4 pb-20 pt-16 sm:pt-24">
          <div className="v-grid" />
          <div className="v-glow v-glow-violet -left-40 top-0 h-[34rem] w-[34rem]" />
          <div className="v-glow v-glow-blue -right-40 top-40 h-[30rem] w-[30rem]" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div className="text-center lg:text-left">
              <p className="v-glass v-eyebrow inline-flex items-center gap-2 !rounded-full px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-300)]" />
                Reto de Skool en 7 días
              </p>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Crea tu comunidad en Skool en <span className="v-gradient-text">solo 7 días</span>
              </h1>
              <p className="v-muted mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed lg:mx-0">
                Skooly es la app que te guía con una misión por día y prompts de IA listos para
                copiar, para que tengas tu Skool creado y configurado sin perderte en el camino.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/reto" className="v-btn v-btn-solid w-full sm:w-auto">
                  Empezar el reto gratis
                </Link>
                <a href="#planes" className="v-btn v-btn-ghost w-full sm:w-auto">
                  Ver planes
                </a>
              </div>
              <ul className="v-muted mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm lg:justify-start">
                <li>✓ 7 misiones diarias</li>
                <li>✓ Prompts de IA</li>
                <li>✓ Cofre del Tesoro</li>
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="v-glow v-glow-violet left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2" />
              <Image
                src="/mascota-skooly-app.png"
                alt="Skooly, la mascota, mostrando el panel de progreso del reto"
                width={1660}
                height={940}
                priority
                className="relative w-full drop-shadow-[0_30px_60px_rgba(80,40,200,0.35)]"
              />
              <div className="v-glass v-tilt-left v-float absolute -left-2 top-2 hidden items-center gap-3 !rounded-2xl px-4 py-3 text-left shadow-2xl sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold">Día 1 completado</p>
                  <p className="v-muted text-xs">Inicia el Reto</p>
                </div>
              </div>
              <div className="v-glass v-tilt-right v-float-slow absolute -right-2 bottom-2 hidden items-center gap-3 !rounded-2xl px-4 py-3 text-left shadow-2xl sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20">
                  🔔
                </span>
                <div>
                  <p className="text-sm font-semibold">Te extrañamos 👋</p>
                  <p className="v-muted text-xs">Tu reto te espera</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section id="beneficios" className="relative scroll-mt-24 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Heading
              eyebrow="Beneficios"
              title="Todo lo que necesitas para lanzar tu Skool"
              text="Sin teoría eterna ni cursos que nunca terminas: haces, avanzas y lo ves funcionando."
            />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <article key={b.title} className="v-glass p-7 transition hover:border-[var(--hair-strong)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.07] text-2xl">
                    {b.emoji}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{b.title}</h3>
                  <p className="v-muted mt-2 text-sm leading-relaxed">{b.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Características */}
        <section id="caracteristicas" className="relative scroll-mt-24 px-4 py-20 sm:py-28">
          <div className="v-glow v-glow-blue -left-48 top-20 h-[28rem] w-[28rem]" />
          <div className="relative mx-auto max-w-6xl">
            <Heading
              eyebrow="Características"
              title="Una app pensada para que no te pierdas"
              text="Cada pieza de Skooly existe para que llegues al Día 7."
            />
            <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-12">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {FEATURES.map((f) => (
                  <li key={f.title} className="v-glass flex gap-4 !rounded-2xl p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-xl">
                      {f.emoji}
                    </span>
                    <div>
                      <h3 className="font-semibold tracking-tight">{f.title}</h3>
                      <p className="v-muted mt-1 text-sm leading-relaxed">{f.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="v-glass p-6 sm:p-8 lg:sticky lg:top-28 lg:self-start">
                <p className="v-eyebrow">Lo que construyes cada día</p>
                <ol className="mt-6 flex flex-col">
                  {MISSIONS.map((m, i) => (
                    <li key={m.day} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < MISSIONS.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[1.3rem] top-11 h-[calc(100%-2.75rem)] w-px bg-[var(--hair-strong)]"
                        />
                      )}
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--hair-strong)] bg-white/[0.06] text-lg">
                        {m.emoji}
                      </span>
                      <div>
                        <p className="v-eyebrow !text-[0.65rem]">Día {m.day}</p>
                        <h3 className="font-semibold tracking-tight">{m.title}</h3>
                        <p className="v-muted mt-0.5 text-sm leading-relaxed">{m.intro}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Planes */}
        <section id="planes" className="relative scroll-mt-24 px-4 py-20 sm:py-28">
          <div className="v-glow v-glow-violet left-1/2 top-10 h-[30rem] w-[44rem] -translate-x-1/2" />
          <div className="relative mx-auto max-w-6xl">
            <Heading
              eyebrow="Planes"
              title="Elige cómo quieres avanzar"
              text="Empieza gratis. Si quieres seguir después del reto o ir acompañado, tienes más opciones."
            />
            <div className="mt-16">
              <PlansGrid />
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section id="preguntas" className="relative scroll-mt-24 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <Heading eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" />
            <div className="mt-12 flex flex-col gap-3">
              {FAQS.map((f) => (
                <details key={f.q} className="v-glass !rounded-2xl px-6 py-5">
                  <summary className="flex items-center justify-between gap-4 font-semibold tracking-tight">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="v-plus v-muted shrink-0 text-2xl font-light transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="v-muted mt-3 text-sm leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Llamado final */}
        <section className="relative px-4 pb-24 pt-10">
          <div className="v-glass relative mx-auto max-w-5xl overflow-hidden px-6 py-16 text-center sm:px-12">
            <div className="v-glow v-glow-violet -left-20 -top-24 h-72 w-72" />
            <div className="v-glow v-glow-blue -bottom-24 -right-20 h-72 w-72" />
            <div className="relative">
              <Image
                src="/mascota-skooly.png"
                alt=""
                width={120}
                height={120}
                className="mx-auto h-24 w-24 object-contain"
              />
              <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                Empieza hoy tu reto de <span className="v-gradient-text">7 días</span>
              </h2>
              <p className="v-muted mx-auto mt-4 max-w-lg text-base sm:text-lg">
                Crea tu cuenta gratis y completa tu primera misión en pocos minutos.
              </p>
              <Link href="/reto" className="v-btn v-btn-solid mt-8">
                Empezar el reto gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="v-hair border-t px-4 py-8 text-center text-sm">
        <p className="v-muted">Derechos Reservados - Neobrand Academy 2026</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
          <Link href="/terminos" className="v-muted underline decoration-white/30 hover:text-white">
            Términos y condiciones
          </Link>
          <Link href="/privacidad" className="v-muted underline decoration-white/30 hover:text-white">
            Política de privacidad
          </Link>
          <Link href="/reembolsos" className="v-muted underline decoration-white/30 hover:text-white">
            Reembolsos y cancelación
          </Link>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="v-muted underline decoration-white/30 hover:text-white"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </footer>
    </div>
  );
}
