"use client";

import { useEffect, useRef, useState } from "react";

export default function DayIntroVideo({ src }: { src: string }) {
  const [open, setOpen] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cada vez que cambia el video (nuevo día), lo abrimos de nuevo.
  useEffect(() => {
    setOpen(true);
    setNeedsTap(false);
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
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar video"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white transition hover:bg-black/80"
        >
          ✕
        </button>

        <video
          ref={videoRef}
          src={src}
          autoPlay
          playsInline
          controls
          onEnded={() => setOpen(false)}
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
      </div>
    </div>
  );
}
