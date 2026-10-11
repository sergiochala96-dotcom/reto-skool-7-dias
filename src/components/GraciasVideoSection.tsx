"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GraciasPopup from "@/components/GraciasPopup";

// Caja vertical (9:16) para el video.
// - Computadora: el video se carga detrás del popup y arranca con sonido desde el
//   inicio cuando se cierra el popup ("Continuar").
// - Celular: los navegadores bloquean el sonido automático, así que el video corre en
//   silencio como vista previa con un botón flotante "Reproducir"; al tocarlo vuelve
//   al inicio y suena.
// El iframe es más alto que la caja y se recorta arriba y abajo: así quedan fuera
// (en las franjas negras) el título/canal y la barra "Shorts" que pone YouTube.
const BOX =
  "relative mx-auto aspect-[9/16] w-full max-w-[15rem] overflow-hidden rounded-2xl border border-purple-200 bg-black shadow-2xl shadow-purple-900/30 sm:max-w-[21rem] lg:max-w-[23rem]";

const YT_ORIGIN = "https://www.youtube.com";

type StartRef = { current: (() => void) | null };

// Computadora = pantalla ancha con mouse. Todo lo demás (celular, tablet) usa la vista previa.
const DESKTOP_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

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

// Capa sobre el video (solo celular): etiqueta de "vista previa" y botón flotante "Reproducir".
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

function SoundButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-black shadow-lg transition hover:bg-amber-300"
    >
      🔊 Activar sonido
    </button>
  );
}

function getYouTubeId(src: string) {
  return src.match(/youtube\.com\/embed\/([\w-]+)/)?.[1] ?? "";
}

function YouTubeVideo({ src, startRef }: { src: string; startRef: StartRef }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadedRef = useRef(false);
  const closedRef = useRef(false);
  const playingRef = useRef(false);
  const mutedRef = useRef(true);
  const [ready, setReady] = useState<{ origin: string; desktop: boolean } | null>(null);
  const [started, setStarted] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);

  // El reproductor se monta un instante después (cuando termina la ráfaga de confeti)
  // para que la carga de YouTube no compita con la animación del popup.
  useEffect(() => {
    const t = window.setTimeout(
      () =>
        setReady({
          origin: window.location.origin,
          desktop: window.matchMedia(DESKTOP_QUERY).matches,
        }),
      1500,
    );
    return () => window.clearTimeout(t);
  }, []);

  const post = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN,
    );
  }, []);

  // Mensajes del reproductor: si está reproduciendo y si está en silencio.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const state = data.event === "onStateChange" ? data.info : data.info?.playerState;
        if (state === 1) playingRef.current = true;
        if (typeof data.info?.muted === "boolean") mutedRef.current = data.info.muted;
      } catch {
        // mensaje que no es JSON: se ignora
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Computadora: arranca con sonido. Si el navegador no lo permite, arranca en
  // silencio y se ofrece el botón "Activar sonido".
  const startWithSound = useCallback(() => {
    post("playVideo");
    window.setTimeout(() => {
      if (!playingRef.current) {
        post("mute");
        post("playVideo");
        setNeedsSound(true);
      }
    }, 1000);
  }, [post]);

  // El padre llama a esto dentro del clic en "Continuar" (así el navegador deja
  // arrancar el video con sonido). Si el reproductor aún no carga, arranca al cargar.
  useEffect(() => {
    startRef.current = () => {
      closedRef.current = true;
      if (ready?.desktop && loadedRef.current) startWithSound();
    };
    return () => {
      startRef.current = null;
    };
  }, [startRef, startWithSound, ready]);

  function handleLoad() {
    loadedRef.current = true;
    const listen = () =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        YT_ORIGIN,
      );
    listen();
    window.setTimeout(listen, 500);
    if (ready?.desktop && closedRef.current) startWithSound();
  }

  // Celular: clic en "Reproducir" → desde el inicio y con sonido.
  function handlePlayMobile() {
    setStarted(true);
    post("setLoop", [false]);
    post("unMute");
    post("setVolume", [100]);
    post("seekTo", [0, true]);
    post("playVideo");
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

  if (!ready) return <VideoPlaceholder label="Cargando tu video..." />;

  const id = getYouTubeId(src);
  const sep = src.includes("?") ? "&" : "?";
  const base =
    `${src}${sep}enablejsapi=1&origin=${encodeURIComponent(ready.origin)}` +
    `&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;
  // Celular: vista previa en silencio en bucle. Computadora: queda pausado hasta cerrar el popup.
  const url = ready.desktop ? base : `${base}&autoplay=1&mute=1&loop=1&playlist=${id}`;

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
      {!ready.desktop && !started && <PlayOverlay onPlay={handlePlayMobile} />}
      {needsSound && <SoundButton onClick={enableSound} />}
    </>
  );
}

function FileVideo({ src, startRef }: { src: string; startRef: StartRef }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [desktop, setDesktop] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => setDesktop(window.matchMedia(DESKTOP_QUERY).matches), []);

  const playFromStart = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.loop = false;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    startRef.current = () => {
      if (desktop) playFromStart();
    };
    return () => {
      startRef.current = null;
    };
  }, [startRef, desktop, playFromStart]);

  return (
    <>
      <video
        ref={ref}
        src={src}
        controls={desktop || started}
        autoPlay={desktop === false}
        muted
        loop={desktop === false}
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
      {desktop === false && !started && (
        <PlayOverlay
          onPlay={() => {
            setStarted(true);
            playFromStart();
          }}
        />
      )}
    </>
  );
}

export default function GraciasVideoSection({ src }: { src: string | null }) {
  const startRef = useRef<(() => void) | null>(null);

  return (
    <>
      <GraciasPopup onClose={() => startRef.current?.()} />
      <div className={BOX}>
        {!src ? (
          <VideoPlaceholder label="Tu video estará aquí muy pronto" />
        ) : src.includes("youtube.com/embed") ? (
          <YouTubeVideo src={src} startRef={startRef} />
        ) : (
          <FileVideo src={src} startRef={startRef} />
        )}
      </div>
    </>
  );
}
