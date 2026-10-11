"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GraciasPopup from "@/components/GraciasPopup";

// Caja vertical (9:16) para el video. El video se carga desde el principio (detrás
// del popup) para que no haya espera, y arranca cuando se cierra el popup.
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

type StartRef = { current: (() => void) | null };

function YouTubeVideo({ src, startRef }: { src: string; startRef: StartRef }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadedRef = useRef(false);
  const closedRef = useRef(false);
  const playingRef = useRef(false);
  const [origin, setOrigin] = useState<string | null>(null);
  const [needsSound, setNeedsSound] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const post = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN,
    );
  }, []);

  // Intenta arrancar con sonido. Si el navegador (sobre todo en celular) no lo
  // permite, arranca en silencio y se muestra un botón para activar el sonido.
  const startPlayback = useCallback(() => {
    post("playVideo");
    window.setTimeout(() => {
      if (!playingRef.current) {
        post("mute");
        post("playVideo");
        setNeedsSound(true);
      }
    }, 1000);
  }, [post]);

  // Mensajes del reproductor: nos enteramos de si ya está reproduciendo.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const state = data.event === "onStateChange" ? data.info : data.info?.playerState;
        if (state === 1) playingRef.current = true;
      } catch {
        // mensaje que no es JSON: se ignora
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // El padre llama a esto dentro del clic en "Continuar" (así el navegador deja
  // arrancar el video con sonido). Si el reproductor aún no carga, arranca al cargar.
  useEffect(() => {
    startRef.current = () => {
      closedRef.current = true;
      if (loadedRef.current) startPlayback();
    };
    return () => {
      startRef.current = null;
    };
  }, [startRef, startPlayback]);

  function handleLoad() {
    loadedRef.current = true;
    const listen = () =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        YT_ORIGIN,
      );
    listen();
    window.setTimeout(listen, 500);
    if (closedRef.current) startPlayback();
  }

  function enableSound() {
    post("unMute");
    post("setVolume", [100]);
    post("playVideo");
    setNeedsSound(false);
  }

  if (!origin) return <VideoPlaceholder label="Cargando tu video..." />;

  const sep = src.includes("?") ? "&" : "?";
  const url = `${src}${sep}enablejsapi=1&origin=${encodeURIComponent(origin)}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;

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
      {needsSound && (
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

function FileVideo({ src, popupClosed }: { src: string; popupClosed: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (popupClosed) ref.current?.play().catch(() => {});
  }, [popupClosed]);

  return (
    <video
      ref={ref}
      src={src}
      controls
      playsInline
      preload="auto"
      className="absolute inset-0 h-full w-full bg-black object-contain"
    />
  );
}

export default function GraciasVideoSection({ src }: { src: string | null }) {
  const [popupClosed, setPopupClosed] = useState(false);
  const startRef = useRef<(() => void) | null>(null);

  function handlePopupClose() {
    setPopupClosed(true);
    startRef.current?.();
  }

  return (
    <>
      <GraciasPopup onClose={handlePopupClose} />
      <div className={BOX}>
        {!src ? (
          <VideoPlaceholder label="Tu video estará aquí muy pronto" />
        ) : src.includes("youtube.com/embed") ? (
          <YouTubeVideo src={src} startRef={startRef} />
        ) : (
          <FileVideo src={src} popupClosed={popupClosed} />
        )}
      </div>
    </>
  );
}
