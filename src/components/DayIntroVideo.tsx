"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  /** Si es false, no se puede cerrar hasta que el video termine (sin X, sin cerrar al hacer clic afuera). */
  closable?: boolean;
  /** Si es true, el modal ocupa mucha más pantalla. */
  large?: boolean;
  /** Se llama cuando el video se cierra (por X, clic afuera o el botón Continuar). */
  onClose?: () => void;
};

export default function DayIntroVideo({
  src,
  closable = true,
  large = false,
  onClose,
}: Props) {
  const [open, setOpen] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  // Cada vez que cambia el video (nuevo día), lo abrimos de nuevo.
  useEffect(() => {
    setOpen(true);
    setNeedsTap(false);
    setEnded(false);
  }, [src]);

  useEffect(() => {
    if (!open) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => setNeedsTap(true));
    }
  }, [open]);

  if (!open) return null;

  const handleTap = () => {
    setNeedsTap(false);
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={() => closable && close()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl ${
          large ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        {closable && (
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar video"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white transition hover:bg-black/80"
          >
            ✕
          </button>
        )}

        <video
          ref={videoRef}
          src={src}
          autoPlay
          playsInline
          controls
          controlsList="nodownload"
          onEnded={() => setEnded(true)}
          className="aspect-video w-full"
        />

        {needsTap && (
          <button
            type="button"
            onClick={handleTap}
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"
          >
            <span className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-black">
              ▶ Toca para reproducir
            </span>
          </button>
        )}

        {ended && (
          <div className="flex justify-center bg-black p-4">
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-amber-300 px-8 py-3 text-sm font-bold text-black shadow-lg shadow-amber-400/30 transition hover:brightness-105"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
