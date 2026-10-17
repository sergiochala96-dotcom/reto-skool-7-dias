import type { Metadata } from "next";
import ActivateAccessLink from "@/components/ActivateAccessLink";
import CaptacionFooter from "@/components/CaptacionFooter";
import GraciasCheckpoints, {
  WHATSAPP_PATH,
} from "@/components/GraciasCheckpoints";
import GraciasVideoSection from "@/components/GraciasVideoSection";
import { GRACIAS_VIDEO_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

export const metadata: Metadata = {
  title: "¡Gracias! Revisa tu correo | Skooly",
  robots: { index: false, follow: false },
};

// Flechas animadas que señalan hacia el botón de WhatsApp.
function ArrowsDown() {
  return (
    <div className="mb-1 flex flex-col items-center" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="page-anim -mb-2.5 h-7 w-7 animate-[arrowFlow_1.2s_ease-in-out_infinite] text-fuchsia-600 motion-reduce:animate-none sm:h-8 sm:w-8"
          style={{ animationDelay: `${i * 0.18}s` }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      ))}
    </div>
  );
}

export default function GraciasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#fae8ff_0%,transparent_50%)] px-4 py-5 text-purple-950 sm:py-10">
        <div className="mx-auto grid max-w-5xl items-center gap-x-12 gap-y-4 text-center lg:grid-cols-2 lg:gap-x-16 lg:text-left">
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <GraciasCheckpoints
              size="sm"
              pausable
              className="lg:justify-start"
            />

            <h1 className="mt-4 text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-3xl lg:mt-6 lg:text-4xl">
              Tu acceso a <span className="text-fuchsia-600">Skooly</span> ya
              está listo.{" "}
              <span className="text-purple-700">
                Actívalo y empieza hoy tu Día 1.
              </span>
            </h1>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <GraciasVideoSection src={GRACIAS_VIDEO_URL} />
          </div>

          <div className="mx-auto w-full max-w-md lg:col-start-1 lg:row-start-2 lg:mx-0 lg:self-start">
            <ArrowsDown />
            <ActivateAccessLink
              source="pagina"
              className="page-anim inline-flex w-full animate-[ctaPulseAmber_1.8s_ease-in-out_infinite] items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-400/40 transition hover:bg-amber-300 motion-reduce:animate-none sm:px-8 sm:text-xl"
            >
              Activar mi acceso y empezar el Día 1 →
            </ActivateAccessLink>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#25D366]/30 transition hover:brightness-105 sm:text-base"
            >
              <svg
                viewBox="0 0 32 32"
                fill="currentColor"
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
              >
                <path d={WHATSAPP_PATH} />
              </svg>
              Unirme al boletín de Skool en WhatsApp
            </a>
            <p className="mt-3 text-xs leading-snug text-purple-950/60 sm:text-sm">
              También te enviamos tu acceso por correo. Si no lo ves, revisa
              Promociones o Spam.
            </p>
          </div>
        </div>
      </main>
      <CaptacionFooter />
    </div>
  );
}
