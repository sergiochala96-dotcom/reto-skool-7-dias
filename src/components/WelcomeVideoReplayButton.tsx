"use client";

import { useState } from "react";
import DayIntroVideo from "@/components/DayIntroVideo";
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
        className="fixed right-6 top-6 z-40 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 md:flex"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {open && (
        <DayIntroVideo
          src={WELCOME_VIDEO_URL}
          large
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
