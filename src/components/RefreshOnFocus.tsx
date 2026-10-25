"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Vuelve a cargar los datos de la página cuando la persona regresa a esta pestaña (por ejemplo,
// después de pagar en Creem en otra pestaña), para que vea su plan nuevo sin recargar a mano.
export default function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  return null;
}
