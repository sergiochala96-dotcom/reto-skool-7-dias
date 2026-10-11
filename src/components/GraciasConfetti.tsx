"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

// Confeti de bienvenida apenas se abre /gracias.
export default function GraciasConfetti() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#7e22ce", "#c026d3", "#f59e0b", "#facc15", "#10b981", "#3b82f6"];
    const end = Date.now() + 2000;
    let raf = 0;

    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors });
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) raf = requestAnimationFrame(frame);
    })();

    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
