"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { completeStartMission } from "@/app/actions";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";

const YT_ORIGIN = "https://www.youtube.com";

const WHATSAPP_TEXT = "Unirme al WhatsApp";

// Computadora (mouse) = el video arranca solo. Celular o tablet (táctil) = vista previa en
// silencio y un botón "Reproducir", porque esos navegadores no dejan arrancar con sonido.
const MOUSE_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

function getYouTubeId(src: string) {
  return src.match(/youtube\.com\/embed\/([\w-]+)/)?.[1] ?? "";
}

// Video de bienvenida (Short de YouTube, vertical) que se abre al entrar por primera vez al
// panel, y también al tocar el botón de "volver a ver".
//  - Computadora: arranca solo y con sonido. Si el navegador no deja, arranca en silencio y sale
//    el botón "Activar sonido".
//  - Celular: se ve una vista previa en silencio con un botón "Reproducir"; al tocarlo, el video
//    empieza desde el principio y con sonido.
//  - Se incrusta sin controles ni logo de YouTube: el reproductor es más alto que la caja y se
//    recorta arriba y abajo, donde YouTube pone el título, el canal y la barra "Shorts".
//  - Al terminar, aparece sobre el video el botón verde "Unirme al WhatsApp" (pulsando).
//  - En computadora, el video va a la izquierda y a la derecha un título con el mismo botón.
export default function WelcomeVideoModal({
  src,
  onClose,
}: {
  src: string;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(true);
  // null mientras se averigua el tipo de dispositivo (el reproductor se monta después).
  const [setup, setSetup] = useState<{ origin: string; preview: boolean } | null>(null);
  const [started, setStarted] = useState(false); // celular: ya tocó "Reproducir"
  const [needsSound, setNeedsSound] = useState(false);
  const [ended, setEnded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playingRef = useRef(false);
  const endedRef = useRef(false);
  // Solo cuenta lo que pasa en el video cuando la persona lo está viendo de verdad: en la vista
  // previa de celular (en bucle y en silencio) no se muestra el botón de fin ni el de sonido.
  const watchingRef = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  // El reproductor se monta cuando ya se conoce el origen de la página (lo pide la API de YouTube)
  // y el tipo de dispositivo.
  useEffect(() => {
    const preview = !window.matchMedia(MOUSE_QUERY).matches;
    watchingRef.current = !preview;
    setSetup({ origin: window.location.origin, preview });
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

    function markEnded() {
      if (endedRef.current || !watchingRef.current) return;
      // Terminó: se deja el video quieto en el primer cuadro, detrás del botón, para que no
      // aparezca la pantalla final de YouTube.
      endedRef.current = true;
      playingRef.current = false;
      setEnded(true);
      setNeedsSound(false);
      post("seekTo", [0, true]);
      post("pauseVideo");
    }

    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const info = data.info;
        const state = data.event === "onStateChange" ? info : info?.playerState;
        if (state === 1) {
          playingRef.current = true;
          // Si ya terminó, el "reproduciendo" que avisa el reproductor al volver al inicio
          // (lo hacemos arriba) no debe quitar el botón: solo "Volver a ver" lo quita.
          if (!endedRef.current) setEnded(false);
        }
        if (state === 0) markEnded();
        // Por si el reproductor reinicia en bucle sin avisar del fin: se detecta por el tiempo.
        if (
          typeof info?.currentTime === "number" &&
          typeof info?.duration === "number" &&
          info.duration > 0 &&
          info.currentTime >= info.duration - 0.3
        ) {
          markEnded();
        }
        if (typeof info?.muted === "boolean" && playingRef.current && watchingRef.current) {
          setNeedsSound(info.muted);
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

    // Celular: la vista previa ya arranca sola y en silencio (por la dirección del reproductor).
    if (setup?.preview) return;

    // Computadora: intento de arrancar con sonido; si el navegador lo bloquea, arranca en silencio.
    post("playVideo");
    window.setTimeout(() => {
      if (!playingRef.current) {
        post("mute");
        post("playVideo");
        setNeedsSound(true);
      }
    }, 1200);
  }

  // Celular: "Reproducir" → desde el principio, con sonido y sin bucle.
  function handlePlay() {
    setStarted(true);
    watchingRef.current = true;
    endedRef.current = false;
    setEnded(false);
    post("setLoop", [false]);
    post("unMute");
    post("setVolume", [100]);
    post("seekTo", [0, true]);
    post("playVideo");
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
    post("setLoop", [false]);
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

  const id = getYouTubeId(src);
  const url = setup
    ? `${src}?enablejsapi=1&origin=${encodeURIComponent(setup.origin)}&autoplay=1` +
      `&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0` +
      (setup.preview ? `&mute=1&loop=1&playlist=${id}` : "")
    : null;

  const whatsappIcon = (
    <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path d={WHATSAPP_PATH} />
    </svg>
  );

  // Botón verde con letra blanca que pulsa (computadora y celular).
  const whatsappButton = "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition hover:brightness-110 animate-[ctaPulse_1.8s_ease-in-out_infinite] motion-reduce:animate-none";

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

          {/* Celular: vista previa en silencio con botón de reproducir */}
          {setup?.preview && !started && (
            <button
              type="button"
              onClick={handlePlay}
              aria-label="Reproducir el video con sonido"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/25 transition hover:bg-black/15"
            >
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                🔇 Vista previa sin sonido
              </span>
              <span className="flex animate-[ctaPulseAmber_1.8s_ease-in-out_infinite] items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-lg font-extrabold text-black shadow-xl motion-reduce:animate-none">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir
              </span>
            </button>
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
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3.5 text-base font-extrabold ${whatsappButton}`}
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

        {/* Solo en pantallas anchas: título y botón a la derecha del video */}
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
            className={`inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-lg font-extrabold ${whatsappButton}`}
          >
            {whatsappIcon}
            {WHATSAPP_TEXT}
          </a>
        </div>
      </div>
    </div>
  );
}
