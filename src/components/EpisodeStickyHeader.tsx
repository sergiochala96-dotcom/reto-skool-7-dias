"use client";

import { useEffect, useState } from "react";
import { EPISODE_2_NAME } from "@/lib/challenge";

// Tarjeta amarilla del celular (como la de sección de Duolingo). Se queda pegada debajo de la barra
// de arriba mientras se ven los puntos de un episodio y cambia cuando se llega al siguiente:
// Episodio 1 (reto de 7 días) → Episodio 2. Va dentro del bloque que contiene los dos episodios,
// así solo aparece mientras se ven sus puntos. Detecta el cambio mirando dónde está #episodio-2.
const EPISODES = {
  1: { kicker: "Episodio 1, reto de 7 días", title: "Crea y lanza tu Skool" },
  2: { kicker: "Episodio 2", title: EPISODE_2_NAME },
} as const;

// Fracción de la altura de la pantalla: cuando el Episodio 2 sube por encima de esta línea ya se
// considera que se está en él (el Episodio 2 es lo último de la página y puede no llegar más arriba).
const SWITCH_LINE = 0.6;

export default function EpisodeStickyHeader() {
  const [episode, setEpisode] = useState<1 | 2>(1);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const second = document.getElementById("episodio-2");
      const reached = second ? second.getBoundingClientRect().top <= window.innerHeight * SWITCH_LINE : false;
      setEpisode(reached ? 2 : 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const current = EPISODES[episode];

  return (
    <div className="sticky top-16 z-30 mb-4 md:hidden">
      <div className="rounded-2xl border-b-4 border-amber-500 bg-amber-300 px-4 py-3 text-black shadow-lg shadow-black/30">
        <p className="text-xs font-extrabold uppercase tracking-wide text-black/60">{current.kicker}</p>
        <p className="mt-0.5 text-lg font-extrabold leading-tight">{current.title}</p>
      </div>
    </div>
  );
}
