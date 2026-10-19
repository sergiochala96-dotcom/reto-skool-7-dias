"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { completeStartMission } from "@/app/actions";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

const YT_ORIGIN = "https://www.youtube.com";

const WHATSAPP_TEXT = "Unirme al WhatsApp";

// Video de bienvenida (Short de YouTube, vertical) que se abre al entrar por primera vez al
// panel, y también al tocar el botón de "volver a ver".
//  - Arranca solo y con sonido. Si el navegador no deja (pasa cuando la persona no ha tocado
//    nada en el sitio), arranca en silencio y sale el botón "Activar sonido".
//  - Se incrusta sin controles ni logo de YouTube: el reproductor es más alto que la caja y se
//    recorta arriba y abajo, donde YouTube pone el título, el canal y la barra "Shorts".
//  - Al terminar, aparece sobre el video el botón amarillo "Unirme al WhatsApp".
//  - En computadora, el video va a la izquierda y a la derecha un título con el mismo botón.
export default function WelcomeVideoModal({
  src,
  onClose,
}: {
  src: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [origin, setOrigin] = useState<string | null>(null);
  const [needsSound, setNeedsSound] = useState(false);
  const [ended, setEnded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playingRef = useRef(false);
  const endedRef = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  // El reproductor se monta cuando ya se conoce el origen de la página (lo pide la API de YouTube).
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const post = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN
    );
  }, []);

  // Mensajes del reproductor: si está reproduciendo, si terminó y si está en silencio.
  useEffect(() => {
    if (!open) return;
    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const state = data.event === "onStateChange" ? data.info : data.info?.playerState;
        if (state === 1) {
          playingRef.current = true;
          // Si ya terminó, el "reproduciendo" que avisa el reproductor al volver al inicio
          // (lo hacemos abajo) no debe quitar el botón: solo "Volver a ver" lo quita.
          if (!endedRef.current) setEnded(false);
        }
        if (state === 0 && !endedRef.current) {
          // Terminó: se deja el video quieto en el primer cuadro, detrás del botón, para que no
          // aparezca la pantalla final de YouTube.
          endedRef.current = true;
          playingRef.current = false;
          setEnded(true);
          post("seekTo", [0, true]);
          post("pauseVideo");
        }
        if (typeof data.info?.muted === "boolean" && playingRef.current) {
          setNeedsSound(data.info.muted);
        }
      } catch {
        // mensaje que no es JSON: se ignora
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, post]);

  function handleLoad() {
    const listen = () =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        YT_ORIGIN
      );
    listen();
    window.setTimeout(listen, 500);

    // Intento de arrancar con sonido; si el navegador lo bloquea, arranca en silencio.
    post("playVideo");
    window.setTimeout(() => {
      if (!playingRef.current) {
        post("mute");
        post("playVideo");
        setNeedsSound(true);
      }
    }, 1200);
  }

  function enableSound() {
    post("unMute");
    post("setVolume", [100]);
    post("playVideo");
    setNeedsSound(false);
  }

  function replay() {
    endedRef.current = false;
    setEnded(false);
    post("unMute");
    post("setVolume", [100]);
    post("seekTo", [0, true]);
    post("playVideo");
  }

  // Tocar el botón de WhatsApp también marca como hecha la misión de WhatsApp del panel.
  function onWhatsApp() {
    void completeStartMission("whatsapp");
  }

  if (!open) return null;

  const url = origin
    ? `${src}?enablejsapi=1&origin=${encodeURIComponent(origin)}&autoplay=1` +
      `&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`
    : null;

  const whatsappIcon = (
    <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path d={WHATSAPP_PATH} />
    </svg>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video de bienvenida"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar video"
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-bold text-white transition hover:bg-white/30"
      >
        ✕
      </button>

      <div className="flex w-full max-w-5xl flex-col items-center gap-6 md:flex-row md:justify-center md:gap-14">
        {/* Video vertical */}
        <div className="relative aspect-[9/16] w-[min(20rem,calc(82dvh*0.5625))] shrink-0 overflow-hidden rounded-2xl bg-black shadow-2xl shadow-purple-950/50 md:w-[min(24rem,calc(86dvh*0.5625))]">
          {url && (
            <iframe
              ref={iframeRef}
              src={url}
              title="Video de bienvenida a Skooly"
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleLoad}
              className="absolute -top-[22%] left-0 h-[144%] w-full"
            />
          )}

          {needsSound && !ended && (
            <button
              type="button"
              onClick={enableSound}
              className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-black shadow-lg transition hover:bg-amber-300"
            >
              🔊 Activar sonido
            </button>
          )}

          {ended && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/75 px-5">
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-3.5 text-base font-extrabold text-black shadow-lg transition hover:bg-amber-300 active:scale-[0.99]"
              >
                {whatsappIcon}
                {WHATSAPP_TEXT}
              </a>
              <button
                type="button"
                onClick={replay}
                className="text-sm font-semibold text-white/70 underline transition hover:text-white"
              >
                ↺ Volver a ver
              </button>
            </div>
          )}
        </div>

        {/* Solo en computadora: título y botón a la derecha del video */}
        <div className="hidden max-w-sm flex-col items-start gap-6 text-left md:flex lg:max-w-md">
          <h2 className="text-2xl font-extrabold leading-snug text-white lg:text-3xl">
            Únete al grupo de WhatsApp, donde te enviamos noticias y recursos de Skool todas las
            semanas
          </h2>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsApp}
            className="inline-flex animate-[ctaPulseAmber_1.8s_ease-in-out_infinite] items-center justify-center gap-2.5 rounded-xl bg-amber-400 px-8 py-4 text-lg font-extrabold text-black shadow-lg shadow-amber-400/40 transition hover:bg-amber-300 motion-reduce:animate-none"
          >
            {whatsappIcon}
            {WHATSAPP_TEXT}
          </a>
        </div>
      </div>
    </div>
  );
}
