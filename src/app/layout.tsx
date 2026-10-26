import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallAppProvider from "@/components/InstallAppProvider";
import MetaPixel from "@/components/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skooly: Reto de Skool en 7 Días",
  description: "Completa las 7 misiones diarias y desbloquea el Cofre del Tesoro.",
  // iPhone: al agregarla a la pantalla de inicio se abre como aplicación, con el nombre "Skooly".
  appleWebApp: { capable: true, title: "Skooly", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  // Color de la barra del sistema en el celular (el mismo morado oscuro de la app).
  themeColor: "#110c1b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InstallAppProvider>{children}</InstallAppProvider>
        <MetaPixel />
      </body>
    </html>
  );
}
