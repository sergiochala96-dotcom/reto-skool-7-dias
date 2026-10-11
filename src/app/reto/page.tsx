import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

export default function RetoPage() {
  return (
    <>
      <CountdownBanner />
      <main className="min-h-screen bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#fae8ff_0%,transparent_50%)] px-4 py-8 text-purple-950 sm:py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-8 lg:grid-cols-2 lg:gap-x-16">
          <section className="text-center lg:text-left">
            <div className="mb-5 flex items-center justify-center gap-2 lg:justify-start">
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

            <span className="inline-block rounded-full bg-purple-700 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              Reto gratuito · 7 días
            </span>

            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-purple-950 sm:text-5xl">
              Crea tu Skool en <span className="text-purple-700">7 días</span>{" "}
              con nuestra App: <span className="text-fuchsia-600">Skooly</span>
            </h1>

            <p className="mt-4 text-lg text-purple-950/70">
              Reserva tu lugar y recibe acceso gratis a la app con misiones
              diarias que te lleva de la mano, paso a paso, hasta tener tu
              comunidad lista para lanzar.
            </p>

            <ul className="mt-5 flex flex-col items-center gap-2 text-base font-medium text-purple-950/80 lg:items-start">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <div>
            <Image
              src="/mascota-skooly-app.png"
              alt="Skooly te muestra la app con tu progreso en el Reto"
              width={1672}
              height={941}
              sizes="320px"
              className="relative z-10 mx-auto -mb-14 h-auto w-full max-w-[17rem] drop-shadow-[0_10px_20px_rgba(59,7,100,0.25)] sm:max-w-xs"
              priority
            />

            <section
              id="reserva"
              className="mx-auto mt-2 w-full max-w-md scroll-mt-4"
            >
              <div className="rounded-3xl bg-gradient-to-b from-[#3b0764] to-[#1e0a3c] p-6 pt-20 text-white shadow-2xl shadow-purple-900/30 sm:p-7 sm:pt-20">
                <h2 className="text-center text-2xl font-extrabold">
                  Reserva tu lugar en el Reto
                </h2>
                <p className="mb-5 mt-1 text-center text-sm text-white/70">
                  Te enviamos tu acceso a tu correo. Después entras con un solo
                  clic con Google.
                </p>
                <RetoForm />
                <p className="mt-4 text-center text-xs text-white/50">
                  Paso 1 de 2 · Sin contraseñas ni formularios largos
                </p>
              </div>
              <p className="mt-4 text-center text-sm text-purple-950/60">
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
    </>
  );
}
