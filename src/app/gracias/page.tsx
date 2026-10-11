import type { Metadata } from "next";
import CaptacionFooter from "@/components/CaptacionFooter";
import GraciasCheckpoints, { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import GraciasVideoSection from "@/components/GraciasVideoSection";
import { GRACIAS_VIDEO_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

export const metadata: Metadata = {
  title: "¡Gracias! Revisa tu correo | Skooly",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <>
      <main className="min-h-screen bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#fae8ff_0%,transparent_50%)] px-4 py-10 text-purple-950 sm:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-x-12 gap-y-6 text-center lg:grid-cols-2 lg:gap-x-16 lg:text-left">
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <GraciasCheckpoints className="lg:justify-start" />

            <h1 className="mt-8 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Tu acceso a <span className="text-fuchsia-600">Skooly</span> va en camino a tu correo.{" "}
              <span className="text-purple-700">Pero te hace falta un paso.</span>
            </h1>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <GraciasVideoSection src={GRACIAS_VIDEO_URL} />
          </div>

          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto inline-flex w-full max-w-md animate-[ctaPulse_1.8s_ease-in-out_infinite] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/40 transition hover:brightness-105 motion-reduce:animate-none sm:px-8 sm:py-5 sm:text-xl lg:col-start-1 lg:row-start-2 lg:mx-0 lg:self-start"
          >
            <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6 shrink-0 sm:h-7 sm:w-7">
              <path d={WHATSAPP_PATH} />
            </svg>
            Unirme al boletín de Skool en WhatsApp
          </a>
        </div>
      </main>
      <CaptacionFooter />
    </>
  );
}
