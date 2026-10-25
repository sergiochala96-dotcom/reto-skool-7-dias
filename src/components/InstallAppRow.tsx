"use client";

import { useInstallApp } from "@/components/InstallAppProvider";
import InstallIcon from "@/components/InstallIcon";

// Botón para instalar Skooly en el celular. Como el celular ya no tiene menú lateral ni la tarjeta de
// misiones, vive en el Perfil. Solo aparece si se puede instalar (celular y app aún sin instalar).
export default function InstallAppRow() {
  const { platform, openInstall } = useInstallApp();
  if (platform === null) return null;

  return (
    <button
      type="button"
      onClick={openInstall}
      className="mt-6 flex w-full items-center gap-3 rounded-2xl border-2 border-white/15 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/10"
    >
      <InstallIcon className="h-7 w-7 shrink-0 text-fuchsia-300" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-white">Instala Skooly en tu celular</span>
        <span className="block text-xs text-white/55">Ábrela desde un icono, como una app.</span>
      </span>
      <span className="text-xs font-extrabold uppercase tracking-wide text-amber-300">Instalar</span>
    </button>
  );
}
