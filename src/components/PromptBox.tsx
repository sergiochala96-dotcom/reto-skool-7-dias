"use client";

import { useState } from "react";

// Caja con un prompt listo para copiar (mismo estilo que los prompts de las misiones).
export default function PromptBox({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // sin portapapeles: la persona puede seleccionar el texto a mano
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-fuchsia-300 bg-fuchsia-50 p-4">
      <p className="mb-2 text-sm font-semibold text-fuchsia-700">💡 {title}</p>
      <p className="whitespace-pre-wrap rounded-lg bg-gray-100 p-3 font-mono text-xs leading-relaxed text-gray-700">
        {text}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800"
      >
        {copied ? "Copiado ✓" : "📋 Copiar prompt"}
      </button>
      <p className="mt-2 text-xs text-fuchsia-700/70">
        Cambia lo que está entre [corchetes] por tus datos antes de pegarlo en tu IA.
      </p>
    </div>
  );
}
