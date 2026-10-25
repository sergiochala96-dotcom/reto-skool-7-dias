import Link from "next/link";
import type { ReactNode } from "react";
import CaptacionFooter from "@/components/CaptacionFooter";
import { LEGAL_UPDATED } from "@/lib/legal";

// Estructura común de las páginas legales (términos, reembolsos), con el mismo estilo que la
// política de privacidad.
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-purple-950">{title}</h2>
      <div className="mt-2 space-y-3 text-base leading-relaxed text-purple-950/80">{children}</div>
    </section>
  );
}

export default function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%)] px-4 py-10 text-purple-950 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm font-semibold text-purple-700 hover:underline">
            ← Volver al inicio
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-purple-950/60">Última actualización: {LEGAL_UPDATED}</p>
          {children}
        </div>
      </main>
      <CaptacionFooter />
    </div>
  );
}
