"use client";

import Link from "next/link";
import { trackCustomEvent } from "@/lib/metaPixel";

// Botón de la página de gracias que lleva a crear la cuenta (/registro). Avisa al píxel
// con un evento propio para medir cuántos tocan "Activar mi acceso" y poder armar
// audiencias con ellos (los que lo tocaron y aún no entran al panel).
export default function ActivateAccessLink({
  className,
  source,
  children,
}: {
  className: string;
  source: string; // dónde está el botón: "pagina" o "video"
  children: React.ReactNode;
}) {
  return (
    <Link
      href="/registro"
      onClick={() => trackCustomEvent("ClickActivarAcceso", { source })}
      className={className}
    >
      {children}
    </Link>
  );
}
