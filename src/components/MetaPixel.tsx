"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { META_PIXEL_ID, PIXEL_OFF_KEY } from "@/lib/metaPixel";

// Rutas que no se miden: el panel de admin (para no meter al dueño en las audiencias).
const EXCLUDED_PREFIXES = ["/admin"];

// Carga el píxel de Meta y manda un PageView en cada página (también al navegar dentro
// de la app, que no recarga la página).
export default function MetaPixel() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  // ?pixel=off apaga el píxel en este navegador; ?pixel=on lo enciende otra vez.
  useEffect(() => {
    try {
      const flag = new URLSearchParams(window.location.search).get("pixel");
      if (flag === "off") localStorage.setItem(PIXEL_OFF_KEY, "1");
      if (flag === "on") localStorage.removeItem(PIXEL_OFF_KEY);
      setEnabled(localStorage.getItem(PIXEL_OFF_KEY) !== "1");
    } catch {
      setEnabled(true);
    }
  }, []);

  const excluded = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
  const active = enabled && !excluded;

  // La primera página la mide el propio script de arranque (abajo). Aquí se miden las
  // páginas siguientes, cuando la persona navega dentro de la app sin recargar.
  const prevPath = useRef<string | null>(null);
  useEffect(() => {
    const isFirst = prevPath.current === null;
    prevPath.current = pathname;
    if (!active || isFirst) return;
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
    fbq?.("track", "PageView");
  }, [active, pathname]);

  if (!active && !enabled) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${META_PIXEL_ID}');
        ${active ? "fbq('track','PageView');" : ""}
      `}
    </Script>
  );
}
