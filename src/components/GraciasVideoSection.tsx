"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GraciasPopup from "@/components/GraciasPopup";

// Caja vertical (9:16) para el video. El video arranca solo y en silencio como vista
// previa (los navegadores sí lo permiten), con un botón flotante "Reproducir" encima.
// Al tocarlo, el video vuelve al inicio y se reproduce con sonido.
// El iframe es más alto que la caja y se recorta arriba y abajo: así quedan fuera
// (en las franjas negras) el título/canal y la barra "Shorts" que pone YouTube.
const BOX =
  "relative mx-auto aspect-[9/16] w-full max-w-[15rem] overflow-hidden rounded-2xl border border-purple-200 bg-black shadow-2xl shadow-purple-900/30 sm:max-w-[21rem] lg:max-w-[23rem]";

const YT_ORIGIN = "https://www.youtube.com";

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

// Capa sobre el video: etiqueta de "vista previa" y botón flotante "Reproducir".
function PlayOverlay({ onPlay }: { onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label="Reproducir el video con sonido"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/25 transition hover:bg-black/15"
    >
      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
        🔇 Vista previa sin sonido
      </span>
      <span className="page-anim flex animate-[ctaPulse_1.8s_ease-in-out_infinite] items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-lg font-extrabold text-black shadow-xl motion-reduce:animate-none sm:text-xl">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Reproducir
      </span>
    </button>
  );
}

function getYouTubeId(src: string) {
  return src.match(/youtube\.com\/embed\/([\w-]+)/)?.[1] ?? "";
}

function YouTubeVideo({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mutedRef = useRef(true);
  const [origin, setOrigin] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);

  // El reproductor se monta un instante después (cuando termina la ráfaga de confeti)
  // para que la carga de YouTube no compita con la animación del popup.
  useEffect(() => {
    const t = window.setTimeout(() => setOrigin(window.location.origin), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const post = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN,
    );
  }, []);

  // Mensajes del reproductor: nos enteramos de si está en silencio o no.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        if (typeof data.info?.muted === "boolean") mutedRef.current = data.info.muted;
      } catch {
        // mensaje que no es JSON: se ignora
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function handleLoad() {
    const listen = () =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        YT_ORIGIN,
      );
    listen();
    window.setTimeout(listen, 500);
  }

  // Clic en "Reproducir": desde el inicio y con sonido.
  function handlePlay() {
    setStarted(true);
    post("setLoop", [false]);
    post("unMute");
    post("setVolume", [100]);
    post("seekTo", [0, true]);
    post("playVideo");
    // Si el navegador no dejó activar el sonido, se ofrece un botón para hacerlo.
    window.setTimeout(() => {
      if (mutedRef.current) setNeedsSound(true);
    }, 1200);
  }

  function enableSound() {
    post("unMute");
    post("setVolume", [100]);
    post("playVideo");
    setNeedsSound(false);
  }

  if (!origin) return <VideoPlaceholder label="Cargando tu video..." />;

  const id = getYouTubeId(src);
  const sep = src.includes("?") ? "&" : "?";
  const url =
    `${src}${sep}enablejsapi=1&origin=${encodeURIComponent(origin)}` +
    `&autoplay=1&mute=1&loop=1&playlist=${id}` +
    `&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;

  return (
    <>
      <iframe
        ref={iframeRef}
        src={url}
        title="Mensaje de bienvenida"
        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={handleLoad}
        className="absolute -top-[22%] left-0 h-[144%] w-full"
      />
      {!started && <PlayOverlay onPlay={handlePlay} />}
      {started && needsSound && (
        <button
          type="button"
          onClick={enableSound}
          className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-black shadow-lg transition hover:bg-amber-300"
        >
          🔊 Activar sonido
        </button>
      )}
    </>
  );
}

function FileVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function handlePlay() {
    const v = ref.current;
    if (!v) return;
    setStarted(true);
    v.loop = false;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
  }

  return (
    <>
      <video
        ref={ref}
        src={src}
        controls={started}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
      {!started && <PlayOverlay onPlay={handlePlay} />}
    </>
  );
}

export default function GraciasVideoSection({ src }: { src: string | null }) {
  return (
    <>
      <GraciasPopup />
      <div className={BOX}>
        {!src ? (
          <VideoPlaceholder label="Tu video estará aquí muy pronto" />
        ) : src.includes("youtube.com/embed") ? (
          <YouTubeVideo src={src} />
        ) : (
          <FileVideo src={src} />
        )}
      </div>
    </>
  );
}
