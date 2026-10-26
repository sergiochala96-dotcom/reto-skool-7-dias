"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { claimInstallReward } from "@/app/actions";
import CourseIcon from "@/components/CourseIcon";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { useInstallApp } from "@/components/InstallAppProvider";
import { JoinCard } from "@/components/JoinRewards";
import { CoinIcon } from "@/components/StatIcons";
import { INSTALL_REWARD } from "@/lib/captacion";

type Kind = "whatsapp" | "skool";
type Claimed = { whatsapp: boolean; skool: boolean; install: boolean };

const TILE = {
  whatsapp: { label: "Unirme al boletín de WhatsApp", top: "bg-[#25D366]", bar: "bg-emerald-700" },
  skool: { label: "Unirme al curso de Skool", top: "bg-amber-400", bar: "bg-amber-600" },
  install: { label: "Instalar la app", top: "bg-sky-400", bar: "bg-blue-800" },
};

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m6 10 6 6 6-6" />
      <path d="M5 21h14" />
    </svg>
  );
}

function Tile({
  kind,
  claimed,
  reward,
  onOpen,
}: {
  kind: keyof typeof TILE;
  claimed: boolean;
  reward: number;
  onOpen: () => void;
}) {
  const t = TILE[kind];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t.label}
      className="w-[4.25rem] overflow-hidden rounded-2xl shadow-lg shadow-black/40 ring-1 ring-black/20 transition active:scale-95"
    >
      <span className={`flex h-11 items-center justify-center text-white ${t.top}`}>
        {kind === "whatsapp" ? (
          <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8" aria-hidden="true">
            <path d={WHATSAPP_PATH} />
          </svg>
        ) : kind === "skool" ? (
          <CourseIcon className="h-8 w-8" />
        ) : (
          <DownloadIcon className="h-8 w-8" />
        )}
      </span>
      <span
        className={`flex h-[1.375rem] items-center justify-center gap-0.5 text-xs font-extrabold text-white ${t.bar}`}
      >
        {claimed ? (
          "✓"
        ) : (
          <>
            <CoinIcon className="h-3.5 w-3.5" /> +{reward}
          </>
        )}
      </span>
    </button>
  );
}

// Popup de pantalla completa con una X arriba a la derecha.
function Fullscreen({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-ink px-4 pb-6 pt-3 md:hidden"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl font-bold leading-none text-white transition hover:bg-white/20"
        >
          ×
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col pt-1">{children}</div>
    </div>,
    document.body
  );
}

// Tarjeta del popup de instalar cuando ya no hay nada que instalar desde el navegador: la app ya
// está instalada (hay que abrirla desde su icono para recibir las monedas) o ya se cobró el premio.
function InstallStatusCard({ claimed }: { claimed: boolean }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-white/10 bg-white/[0.03] p-6 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-400 text-white">
        <DownloadIcon className="h-14 w-14" />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold leading-tight text-white">
        {claimed ? "¡Ya instalaste Skooly!" : "Abre Skooly desde su icono"}
      </h2>
      {claimed ? (
        <p className="mt-4 text-base font-bold text-emerald-300">
          ✓ Ya ganaste tus {INSTALL_REWARD} monedas
        </p>
      ) : (
        <>
          <span className="mt-3 flex items-center gap-1.5 rounded-2xl bg-black/25 px-4 py-1.5 text-xl font-extrabold text-amber-300">
            <CoinIcon className="h-6 w-6" /> +{INSTALL_REWARD} monedas de oro
          </span>
          <p className="mt-5 text-base leading-relaxed text-white/70">
            Si ya la instalaste, ciérrala aquí y ábrela desde el <strong className="text-white">icono de tu
            pantalla de inicio</strong>. Al entrar así, tus {INSTALL_REWARD} monedas llegan solas.
          </p>
        </>
      )}
    </section>
  );
}

// Celular: tres iconos cuadrados fijos bajo la tarjeta del episodio (WhatsApp +50, Skool +50 e
// instalar la app +100). WhatsApp y Skool abren un popup de pantalla completa con el botón para
// unirse y el campo del código; el de instalar abre los pasos para instalar la app (también en
// pantalla completa). Van como hijos del bloque de episodios para que "sticky" los mantenga a la
// vista; la caja tiene alto 0 para que floten sobre el contenido sin empujarlo. Cada icono se
// quita solo cuando la persona ya cobró esa recompensa.
export default function JoinTiles({ claimed }: { claimed: Claimed }) {
  const [open, setOpen] = useState<Kind | "install" | null>(null);
  const { platform, openInstall } = useInstallApp();
  const router = useRouter();
  const asked = useRef(false);
  const allClaimed = claimed.whatsapp && claimed.skool && claimed.install;

  // Si la app se abrió desde el icono de la pantalla de inicio, se cobra el premio (una sola vez).
  useEffect(() => {
    if (claimed.install || asked.current) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;
    asked.current = true;
    void claimInstallReward().then((r) => {
      if (r.ok) router.refresh();
    });
  }, [claimed.install, router]);

  function openInstallTile() {
    // Con algo que instalar, se muestran los pasos (o el aviso nativo de Android).
    if (!claimed.install && platform) openInstall();
    else setOpen("install");
  }

  return (
    <>
      {/* Cada icono desaparece cuando ya se cobró su recompensa; si no queda ninguno, no se muestra nada. */}
      {!allClaimed && (
        <div className="sticky top-[9rem] z-20 h-0 md:hidden">
          <div className="absolute -left-2 top-0 flex flex-col gap-3">
            {!claimed.whatsapp && (
              <Tile kind="whatsapp" claimed={false} reward={50} onOpen={() => setOpen("whatsapp")} />
            )}
            {!claimed.skool && (
              <Tile kind="skool" claimed={false} reward={50} onOpen={() => setOpen("skool")} />
            )}
            {!claimed.install && (
              <Tile kind="install" claimed={false} reward={INSTALL_REWARD} onOpen={openInstallTile} />
            )}
          </div>
        </div>
      )}

      {open && (
        <Fullscreen label={TILE[open].label} onClose={() => setOpen(null)}>
          {open === "install" ? (
            <InstallStatusCard claimed={claimed.install} />
          ) : (
            <JoinCard kind={open} claimed={claimed[open]} large />
          )}
        </Fullscreen>
      )}
    </>
  );
}
