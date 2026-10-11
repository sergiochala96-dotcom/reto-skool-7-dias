"use client";

import { useEffect, useRef } from "react";

// Systeme.io pinta el formulario justo donde está su <script>, así que lo
// insertamos a mano dentro de un contenedor (next/script no controla dónde queda).
export default function SystemeForm({ scriptId, src }: { scriptId: string; src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = src;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [scriptId, src]);

  return <div ref={containerRef} className="min-h-[220px]" />;
}
