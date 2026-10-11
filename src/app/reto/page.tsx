import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SkoolyLogo from "@/components/SkoolyLogo";
import SystemeForm from "@/components/SystemeForm";
import { SYSTEME_FORM } from "@/lib/captacion";

export const metadata: Metadata = {
  title: "Reto de Skool en 7 Días | Accede gratis a Skooly",
  description:
    "Regístrate gratis y recibe acceso a Skooly, la app con misiones diarias que te guía para crear tu comunidad en Skool en 7 días.",
};

const BENEFITS = [
  "7 misiones diarias, paso a paso",
  "Prompts de IA listos para copiar",
  "100% gratis",
];

export default function RetoPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <section className="text-center lg:text-left">
          <div className="mb-6 flex items-center justify-center gap-2 lg:justify-start">
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

          <span className="inline-block rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-300">
            Reto gratuito · 7 días
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Crea tu comunidad en Skool en{" "}
            <span className="text-amber-300">7 días</span>
          </h1>

          <p className="mt-5 text-lg text-white/70 sm:text-xl">
            Regístrate y recibe acceso gratis a <strong className="text-white">Skooly</strong>,
            la app con misiones diarias que te lleva de la mano, paso a paso, hasta tener tu
            comunidad lista para lanzar.
          </p>

          <ul className="mt-6 flex flex-col items-center gap-2 text-base font-medium text-white/80 lg:items-start">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-900">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Image
            src="/mascota-skooly-cash.png"
            alt=""
            width={160}
            height={160}
            className="relative z-10 mx-auto -mb-10 h-36 w-36 object-contain drop-shadow-[0_0_25px_rgba(217,70,239,0.45)] sm:h-40 sm:w-40"
          />
          <div className="rounded-3xl bg-white p-6 pt-12 text-gray-900 shadow-2xl shadow-fuchsia-900/50 sm:p-8 sm:pt-14">
            <h2 className="text-center text-2xl font-extrabold">Recibe tu acceso gratis</h2>
            <p className="mb-4 mt-1 text-center text-sm text-gray-500">
              Déjanos tu nombre y correo y te enviamos el acceso a la app.
            </p>
            <SystemeForm scriptId={SYSTEME_FORM.scriptId} src={SYSTEME_FORM.src} />
            <p className="mt-4 text-center text-xs text-gray-400">
              🔒 Tus datos están seguros. Sin spam.
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-white/50">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-fuchsia-300 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
