import type { Metadata } from "next";
import Image from "next/image";
import CaptacionFooter from "@/components/CaptacionFooter";
import GraciasConfetti from "@/components/GraciasConfetti";
import { GRACIAS_VIDEO_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

export const metadata: Metadata = {
  title: "¡Gracias! Revisa tu correo | Skooly",
  robots: { index: false, follow: false },
};

function GraciasVideo({ src }: { src: string }) {
  if (src.includes("youtube.com/embed")) {
    return (
      <iframe
        src={src}
        title="Mensaje de bienvenida"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full"
      />
    );
  }
  return (
    <video
      src={src}
      controls
      playsInline
      className="aspect-video w-full bg-black"
    />
  );
}

const STEPS = [
  {
    icon: "📩",
    title: "Abre el correo que te enviamos",
    text: "Búscalo en tu bandeja de entrada (y revisa spam o promociones).",
  },
  {
    icon: "👆",
    title: "Entra con Google en 1 clic",
    text: "Usa el mismo correo con el que reservaste tu lugar y empieza el Día 1.",
  },
];

export default function GraciasPage() {
  return (
    <>
      <main className="min-h-screen bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#fae8ff_0%,transparent_50%)] px-4 py-10 text-purple-950 sm:py-16">
        <GraciasConfetti />
        <div className="mx-auto max-w-3xl text-center">
          <Image
            src="/celebracion-dia.png"
            alt=""
            width={1254}
            height={1254}
            className="mx-auto h-44 w-44 object-contain sm:h-56 sm:w-56"
            priority
          />

          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">
            ¡Listo! Tu acceso a la app va en camino a tu correo ✉️
          </h1>
          <p className="mt-4 text-lg text-purple-950/70">
            Tu lugar en el Reto está reservado. Solo faltan 2 pasos rápidos:
          </p>

          <ol className="mx-auto mt-6 max-w-xl space-y-3 text-left">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="flex items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3"
              >
                <span className="text-2xl leading-none">{step.icon}</span>
                <span>
                  <span className="block font-bold text-purple-950">
                    {step.title}
                  </span>
                  <span className="block text-sm text-purple-950/70">
                    {step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
            <p className="text-base font-bold text-amber-700 sm:text-lg">
              ⏳ Tu acceso queda reservado por 24 horas
            </p>
            <p className="mt-1 text-sm text-purple-950/70">
              Abre el correo hoy para no perder tu lugar.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              ¿Quieres seguir aprendiendo de Skool?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-purple-950/70">
              Únete a mi boletín de WhatsApp{" "}
              <strong className="text-purple-900">Universo Skool</strong>, donde
              comparto noticias y recursos semanales sobre Skool.
            </p>

            {GRACIAS_VIDEO_URL && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-purple-200 bg-black shadow-2xl shadow-purple-900/30">
                <GraciasVideo src={GRACIAS_VIDEO_URL} />
              </div>
            )}

            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:brightness-105 sm:text-lg"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6">
                <path d="M16.001 3C9.373 3 4 8.373 4 15.001c0 2.386.638 4.622 1.751 6.552L4 29l7.633-1.719A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.629 28 15.001 28 8.373 22.629 3 16.001 3zm6.995 17.06c-.297.836-1.476 1.532-2.415 1.732-.643.137-1.482.246-4.306-.925-3.615-1.497-5.938-5.163-6.119-5.404-.176-.242-1.464-1.949-1.464-3.716s.925-2.634 1.253-2.997c.297-.33.65-.412.867-.412.217 0 .434.002.624.011.2.009.469-.076.734.559.271.65.921 2.243.999 2.406.078.163.13.354.026.57-.104.217-.156.352-.309.541-.153.19-.322.423-.46.568-.156.163-.318.34-.137.667.182.326.808 1.334 1.734 2.161 1.191 1.063 2.196 1.392 2.522 1.549.326.156.517.13.708-.078.19-.208.816-.951 1.034-1.278.217-.326.434-.271.734-.163.3.109 1.9.897 2.226 1.06.326.163.543.244.624.38.081.136.081.786-.216 1.622z" />
              </svg>
              Unirme a Universo Skool
            </a>
          </section>
        </div>
      </main>
      <CaptacionFooter />
    </>
  );
}
