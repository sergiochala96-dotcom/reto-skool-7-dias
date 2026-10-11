"use client";

import { useState } from "react";
import GraciasPopup from "@/components/GraciasPopup";

// Caja vertical (9:16) para el video. Mientras el popup está abierto (o no hay
// video aún) se muestra un espacio reservado; al cerrar el popup arranca el video.
// El iframe es más alto que la caja y se recorta arriba y abajo: así quedan fuera
// (en las franjas negras) el título/canal y la barra "Shorts" que pone YouTube.
const BOX =
  "relative mx-auto aspect-[9/16] w-full max-w-[17rem] overflow-hidden rounded-2xl border border-purple-200 bg-black shadow-2xl shadow-purple-900/30 sm:max-w-[21rem] lg:max-w-[23rem]";

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3b0764] to-[#1e0a3c] text-white">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="px-4 text-center text-sm font-medium text-white/70">{label}</span>
    </div>
  );
}

function VideoPlayer({ src, playing }: { src: string; playing: boolean }) {
  if (!playing) return <VideoPlaceholder label="Tu video empieza en un momento" />;

  if (src.includes("youtube.com/embed")) {
    const sep = src.includes("?") ? "&" : "?";
    const url = `${src}${sep}autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;
    return (
      <iframe
        src={url}
        title="Mensaje de bienvenida"
        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute -top-[22%] left-0 h-[144%] w-full"
      />
    );
  }

  return (
    <video
      src={src}
      controls
      autoPlay
      playsInline
      className="absolute inset-0 h-full w-full bg-black object-contain"
    />
  );
}

export default function GraciasVideoSection({ src }: { src: string | null }) {
  const [popupClosed, setPopupClosed] = useState(false);

  return (
    <>
      <GraciasPopup onClose={() => setPopupClosed(true)} />
      <div className={BOX}>
        {src ? (
          <VideoPlayer src={src} playing={popupClosed} />
        ) : (
          <VideoPlaceholder label="Tu video estará aquí muy pronto" />
        )}
      </div>
    </>
  );
}
