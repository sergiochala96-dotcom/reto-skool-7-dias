import type { MetadataRoute } from "next";

// Datos para instalar Skooly como aplicación en el celular (Android e iPhone): nombre, icono,
// color y cómo se abre. "standalone" = se abre a pantalla completa, sin barra del navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skooly",
    short_name: "Skooly",
    description: "Crea tu Skool en 7 días con misiones diarias, paso a paso.",
    lang: "es",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f0d15",
    theme_color: "#0f0d15",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
