import type { Metadata } from "next";
import CaptacionFooter from "@/components/CaptacionFooter";
import GraciasVideoSection from "@/components/GraciasVideoSection";
import { GRACIAS_VIDEO_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

export const metadata: Metadata = {
  title: "¡Gracias! Revisa tu correo | Skooly",
  robots: { index: false, follow: false },
};

const WHATSAPP_PATH =
  "M16.001 3C9.373 3 4 8.373 4 15.001c0 2.386.638 4.622 1.751 6.552L4 29l7.633-1.719A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.629 28 15.001 28 8.373 22.629 3 16.001 3zm6.995 17.06c-.297.836-1.476 1.532-2.415 1.732-.643.137-1.482.246-4.306-.925-3.615-1.497-5.938-5.163-6.119-5.404-.176-.242-1.464-1.949-1.464-3.716s.925-2.634 1.253-2.997c.297-.33.65-.412.867-.412.217 0 .434.002.624.011.2.009.469-.076.734.559.271.65.921 2.243.999 2.406.078.163.13.354.026.57-.104.217-.156.352-.309.541-.153.19-.322.423-.46.568-.156.163-.318.34-.137.667.182.326.808 1.334 1.734 2.161 1.191 1.063 2.196 1.392 2.522 1.549.326.156.517.13.708-.078.19-.208.816-.951 1.034-1.278.217-.326.434-.271.734-.163.3.109 1.9.897 2.226 1.06.326.163.543.244.624.38.081.136.081.786-.216 1.622z";

const CIRCLE = "flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16";
const LINE = "h-1 w-10 rounded-full bg-purple-200 sm:w-16";

function Checkpoints() {
  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <span
        className={`${CIRCLE} bg-emerald-500 text-3xl font-bold text-white shadow-lg shadow-emerald-500/30`}
      >
        ✓
      </span>
      <span className={LINE} />
      <span className={`${CIRCLE} bg-purple-700 text-white shadow-lg shadow-purple-700/30`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 sm:h-8 sm:w-8"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </span>
      <span className={LINE} />
      <span
        className={`${CIRCLE} animate-[softPulse_1.8s_ease-in-out_infinite] bg-[#25D366] text-white`}
      >
        <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8 sm:h-9 sm:w-9">
          <path d={WHATSAPP_PATH} />
        </svg>
      </span>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <>
      <main className="min-h-screen bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#fae8ff_0%,transparent_50%)] px-4 py-10 text-purple-950 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <Checkpoints />

          <h1 className="mt-8 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            ¡Listo! Tu acceso a <span className="text-fuchsia-600">Skooly</span> va en camino a tu
            correo
          </h1>
          <p className="mt-3 text-lg text-purple-950/70">Solo te hacen falta dos pasos rápidos.</p>

          <div className="mt-6 sm:mt-8">
            <GraciasVideoSection src={GRACIAS_VIDEO_URL} />
          </div>

          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full max-w-md animate-[ctaPulse_1.8s_ease-in-out_infinite] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/40 transition hover:brightness-105 motion-reduce:animate-none sm:px-8 sm:py-5 sm:text-xl"
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
