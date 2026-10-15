import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CaptacionFooter from "@/components/CaptacionFooter";
import CountdownBanner from "@/components/CountdownBanner";
import RetoForm from "@/components/RetoForm";
import SkoolyLogo from "@/components/SkoolyLogo";

export const metadata: Metadata = {
  title: "Reto de Skool en 7 Días | Accede gratis a Skooly",
  description:
    "Regístrate gratis y recibe acceso a Skooly, la app con misiones diarias que te guía para crear tu Skool en 7 días.",
};

const BENEFITS = [
  "7 misiones diarias, paso a paso",
  "Prompts de IA listos para copiar",
  "100% gratis",
];

function Checkpoints({ className }: { className?: string }) {
  return (
    <ul
      className={`mx-auto max-w-lg grid-cols-3 gap-2 ${className ?? ""}`}
    >
      {BENEFITS.map((benefit) => (
        <li
          key={benefit}
          className="relative flex flex-col items-center gap-2 text-center text-xs font-semibold leading-snug text-purple-950/80 after:absolute after:left-1/2 after:top-3.5 after:h-0.5 after:w-full after:bg-emerald-300 last:after:hidden sm:text-sm"
        >
          <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white ring-4 ring-white">
            ✓
          </span>
          <span className="px-1">{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RetoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CountdownBanner />
      <main className="flex-1 bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#fae8ff_0%,transparent_50%)] px-4 py-5 text-purple-950 sm:py-5">
        <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-4 lg:gap-y-8 lg:grid-cols-2 lg:gap-x-16">
          <section className="text-center lg:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 lg:justify-start">
              <Image
                src="/mascota-skooly.png"
                alt="Skooly"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
              <SkoolyLogo className="text-2xl font-extrabold" />
            </div>

            <span className="inline-block rounded-full bg-purple-950 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              Reto gratuito · 7 días
            </span>

            <h1 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-purple-950 sm:text-5xl">
              Crea tu Skool en <span className="text-purple-700">7 días</span>{" "}
              con nuestra nueva App:{" "}
              <span className="text-fuchsia-600">Skooly</span>
            </h1>

            <p className="mt-4 hidden text-lg text-purple-950/70 lg:block">
              Reserva tu lugar y recibe acceso gratis a la app con misiones
              diarias que te lleva de la mano, paso a paso, hasta tener tu
              comunidad lista para lanzar.
            </p>

            <Checkpoints className="mt-6 hidden lg:grid lg:mx-0" />
          </section>

          <div>
            <Image
              src="/mascota-skooly-app.png"
              alt="Skooly te muestra la app con tu progreso en el Reto"
              width={1672}
              height={941}
              sizes="320px"
              className="relative z-10 mx-auto -mb-14 h-auto w-full max-w-[14rem] drop-shadow-[0_10px_20px_rgba(59,7,100,0.25)] sm:max-w-xs"
              priority
            />

            <section
              id="reserva"
              className="mx-auto mt-2 w-full max-w-md scroll-mt-4"
            >
              <div className="rounded-3xl bg-gradient-to-b from-[#3b0764] to-[#1e0a3c] p-6 pt-[4.5rem] text-white shadow-2xl shadow-purple-900/30 sm:p-7 sm:pt-[4.5rem]">
                <h2 className="text-center text-2xl font-extrabold">
                  Solicitar Acceso a la App + Reto de Skool
                </h2>
                <p className="mb-5 mt-1 text-center text-sm text-white/70">
                  Te enviamos el acceso a tu correo electrónico en menos de 3 minutos
                </p>
                <RetoForm />
                <p className="mt-4 text-center text-xs text-white/50">
                  Paso 1 de 2 · Sin contraseñas ni formularios largos
                </p>
                <p className="mt-2 text-center text-[11px] leading-snug text-white/40">
                  Al continuar aceptas nuestra{" "}
                  <Link href="/privacidad" className="underline hover:text-white/70">
                    política de privacidad
                  </Link>
                  .
                </p>
              </div>
              <Checkpoints className="mt-6 grid lg:hidden" />
              <p className="mt-5 text-center text-sm text-purple-950/60">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-purple-700 hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <CaptacionFooter />
    </div>
  );
}
