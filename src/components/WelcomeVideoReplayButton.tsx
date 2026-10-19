"use client";

import { useState } from "react";
import WelcomeVideoModal from "@/components/WelcomeVideoModal";
import { WELCOME_VIDEO_URL } from "@/lib/challenge";

export default function WelcomeVideoReplayButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Volver a ver el video de bienvenida"
        title="Volver a ver el video de bienvenida"
        className="absolute right-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 md:fixed md:right-6 md:top-6 md:h-11 md:w-11"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-4 w-4 md:h-5 md:w-5">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {open && <WelcomeVideoModal src={WELCOME_VIDEO_URL} onClose={() => setOpen(false)} />}
    </>
  );
}
