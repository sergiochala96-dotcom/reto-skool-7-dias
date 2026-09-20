"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { playChaChing } from "@/lib/chaChing";

export default function MascotCashButton({
  className,
}: {
  className?: string;
}) {
  const [cashing, setCashing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    playChaChing();
    setCashing(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCashing(false), 700);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Mascota Skooly"
      className={`flex-shrink-0 cursor-pointer border-0 bg-transparent p-0 transition-transform active:scale-90 ${className ?? ""}`}
    >
      <Image
        src={cashing ? "/mascota-skooly-cash.png" : "/mascota-skooly.png"}
        alt="Mascota Skooly"
        width={160}
        height={160}
        className="h-full w-full object-contain drop-shadow-[0_0_25px_rgba(217,70,239,0.35)]"
      />
    </button>
  );
}
