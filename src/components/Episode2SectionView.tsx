import Link from "next/link";
import PromptBox from "@/components/PromptBox";
import { EPISODE_2_LABEL, EPISODE_2_NAME } from "@/lib/challenge";
import { EPISODE_2_SECTIONS, type Episode2Section } from "@/lib/episodio2";

// Contenido de una sección del Episodio 2 (encabezado, cajas de texto y prompts, navegación).
export default function Episode2SectionView({
  section,
  admin,
}: {
  section: Episode2Section;
  admin: boolean;
}) {
  const index = EPISODE_2_SECTIONS.findIndex((s) => s.id === section.id);
  const prev = EPISODE_2_SECTIONS[index - 1];
  const next = EPISODE_2_SECTIONS[index + 1];

  return (
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <Link
            href="/dashboard"
            aria-label="Volver al inicio"
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ←
          </Link>

          <header className="mb-6 text-center">
            <p className="text-sm font-bold text-fuchsia-300">
              {EPISODE_2_LABEL} <span className="font-normal text-white/50">{EPISODE_2_NAME}</span>
            </p>
            <div className="mt-3 text-5xl">{section.emoji}</div>
            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{section.title}</h1>
            <p className="mx-auto mt-2 max-w-2xl text-base text-white/70">{section.intro}</p>
          </header>

          {admin && (
            <p className="mb-5 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-200">
              Contenido provisional (solo lo ves tú): los textos y prompts son de ejemplo hasta que
              estén los definitivos. Se editan en <code>src/lib/episodio2.ts</code>.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {section.blocks.map((block, i) => {
              if (block.type === "prompt") {
                return <PromptBox key={i} title={block.title} text={block.text} />;
              }
              return (
                <section
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white p-5 text-gray-900 shadow-xl sm:p-6"
                >
                  <h2 className="text-lg font-extrabold text-purple-950">{block.title}</h2>
                  {block.type === "text" ? (
                    <div className="mt-2 space-y-3 text-base leading-relaxed text-gray-700">
                      {block.body.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  ) : (
                    <ol className="mt-3 space-y-2.5">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-3 text-base leading-snug text-gray-700">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-extrabold text-purple-800">
                            {j + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              );
            })}
          </div>

          <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            {prev ? (
              <Link
                href={`/episodio-2/${prev.id}`}
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
              >
                ← {prev.emoji} {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/episodio-2/${next.id}`}
                className="rounded-xl bg-amber-400 px-5 py-3 text-center text-sm font-extrabold text-black transition hover:bg-amber-300"
              >
                {next.emoji} {next.title} →
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="rounded-xl bg-amber-400 px-5 py-3 text-center text-sm font-extrabold text-black transition hover:bg-amber-300"
              >
                Volver al inicio
              </Link>
            )}
          </nav>
        </div>
  );
}
