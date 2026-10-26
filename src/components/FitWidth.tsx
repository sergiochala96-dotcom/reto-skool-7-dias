"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Dibuja su contenido a un ancho fijo y lo reduce (sin deformarlo) si el espacio disponible es menor.
// Sirve para el camino de computadora, que se arma con medidas exactas.
export default function FitWidth({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const update = () => {
      const avail = parent.clientWidth;
      if (avail > 0) setScale(Math.min(1, avail / width));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} style={{ width: width * scale, height: height * scale, margin: "0 auto" }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}
