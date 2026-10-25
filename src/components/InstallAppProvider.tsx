"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { trackCustomEvent } from "@/lib/metaPixel";

// Instalar Skooly como aplicación en el celular (se ve como un icono en la pantalla de inicio
// y se abre sin la barra del navegador).
//  - Android (Chrome): el botón abre el aviso nativo "¿Instalar Skooly?" (2 toques).
//  - iPhone (Safari): Apple no deja instalar con un botón; se muestran los pasos para hacerlo.
//  - Navegador interno de Facebook/Instagram/TikTok: no se puede instalar desde ahí; se pide
//    abrir la página en el navegador.
//  - Computadora o app ya instalada: no se ofrece nada (platform = null).

export type InstallPlatform = "android" | "ios" | "inapp";

type Ctx = {
  /** null = no se ofrece instalar (computadora, o la app ya está instalada) */
  platform: InstallPlatform | null;
  openInstall: () => void;
};

const InstallContext = createContext<Ctx>({ platform: null, openInstall: () => {} });

export function useInstallApp() {
  return useContext(InstallContext);
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): InstallPlatform | null {
  const ua = navigator.userAgent;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return null; // ya la abrieron desde el icono

  const isIOS =
    /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  if (!isIOS && !isAndroid) return null; // computadora

  if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|musical_ly|BytedanceWebview|TikTok|Snapchat/i.test(ua)) {
    return "inapp";
  }
  return isIOS ? "ios" : "android";
}

// En iPhone el botón Compartir está en un lugar distinto según el navegador.
type IosBrowser = "safari" | "chrome" | "other";

function iosBrowser(): IosBrowser {
  const ua = navigator.userAgent;
  if (/CriOS/.test(ua)) return "chrome"; // Chrome: Compartir arriba a la derecha, junto a la dirección
  if (/FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA\//.test(ua)) return "other";
  return "safari"; // Safari: Compartir en la barra de abajo
}

export default function InstallAppProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [modal, setModal] = useState<InstallPlatform | null>(null);
  // Flecha que señala dónde está el botón Compartir del navegador (solo iPhone).
  const [arrow, setArrow] = useState<"top" | "bottom" | null>(null);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);

    // El aviso de instalación de Android se guarda para mostrarlo cuando toquen nuestro botón.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setPlatform(null);
      setModal(null);
      trackCustomEvent("AppInstalada");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // Android: el navegador reconoce la app como instalable con un service worker (el nuestro
    // no guarda nada en caché). Solo se registra en celulares Android, no en computadora.
    if (detected === "android" && "serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const openInstall = useCallback(() => {
    if (!platform) return;
    trackCustomEvent("ClickInstalarApp", { platform });

    if (platform === "android" && deferred) {
      // Aviso nativo de Android. prompt() debe llamarse dentro del toque del usuario.
      void deferred.prompt();
      deferred.userChoice.then(() => setDeferred(null)).catch(() => {});
      return;
    }
    setModal(platform);
  }, [platform, deferred]);

  const value = useMemo(() => ({ platform, openInstall }), [platform, openInstall]);

  return (
    <InstallContext.Provider value={value}>
      {children}
      {modal && (
        <InstallInstructions
          kind={modal}
          onClose={() => setModal(null)}
          onGuide={
            modal === "ios"
              ? () => {
                  setModal(null);
                  setArrow(iosBrowser() === "chrome" ? "top" : "bottom");
                }
              : undefined
          }
        />
      )}
      {arrow && <ShareArrow position={arrow} onDone={() => setArrow(null)} />}
    </InstallContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Flecha que señala el botón Compartir del navegador (iPhone)
// ---------------------------------------------------------------------------

// Chrome tiene Compartir arriba a la derecha; Safari, en la barra de abajo. La flecha rebota
// en ese borde de la pantalla y se va sola a los 14 segundos (o con su X).
export function ShareArrow({ position, onDone }: { position: "top" | "bottom"; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 14000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const top = position === "top";
  const arrow = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-9 w-9 animate-bounce text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] motion-reduce:animate-none ${
        top ? "" : "rotate-180"
      }`}
      aria-hidden="true"
    >
      <path d="M12 20V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
  const bubble = (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-amber-400 py-1.5 pl-4 pr-2 text-sm font-extrabold text-black shadow-xl">
      <span className="whitespace-nowrap">
        {top ? "Toca Compartir aquí arriba" : "Toca Compartir aquí abajo"}
      </span>
      <button
        type="button"
        onClick={onDone}
        aria-label="Cerrar la flecha"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/15 text-xs font-bold"
      >
        ✕
      </button>
    </div>
  );

  return createPortal(
    <div
      role="status"
      className={`pointer-events-none fixed z-[70] flex flex-col gap-1 ${
        top
          ? "right-3 top-[max(0.25rem,env(safe-area-inset-top))] items-end"
          : "bottom-[max(0.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 items-center"
      }`}
    >
      {top ? (
        <>
          <span className="mr-6">{arrow}</span>
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          {arrow}
        </>
      )}
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Ventana con los pasos (iPhone, Android sin aviso automático, navegador interno)
// ---------------------------------------------------------------------------

const ICON = {
  className: "h-5 w-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function ShareIcon() {
  return (
    <svg {...ICON}>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg {...ICON}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg {...ICON} fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex translate-y-1 items-center justify-center rounded-md bg-purple-100 px-1.5 py-0.5 text-purple-900">
      {children}
    </span>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-left">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-700 text-sm font-extrabold text-white">
        {n}
      </span>
      <p className="text-sm leading-relaxed text-purple-950/80">{children}</p>
    </li>
  );
}

export function InstallInstructions({
  kind,
  onClose,
  onGuide,
  browser,
}: {
  kind: InstallPlatform;
  onClose: () => void;
  /** iPhone: cierra la ventana y muestra la flecha que señala el botón Compartir. */
  onGuide?: () => void;
  /** Solo para pruebas: fuerza el navegador de iPhone en vez de detectarlo. */
  browser?: IosBrowser;
}) {
  const [copied, setCopied] = useState(false);
  const iosBrowserKind: IosBrowser = kind === "ios" ? (browser ?? iosBrowser()) : "safari";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // sin permiso para copiar: la persona puede copiar la dirección a mano
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-title"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-purple-950/80 p-4 sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm animate-[popIn_0.25s_ease-out] rounded-3xl bg-white p-6 pt-7 shadow-2xl shadow-purple-950/40"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-purple-950/50 transition hover:bg-purple-100 hover:text-purple-950"
        >
          ✕
        </button>

        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt=""
            width={64}
            height={64}
            className="mx-auto h-16 w-16 rounded-2xl shadow-lg"
          />
          <h2 id="install-title" className="mt-3 text-xl font-extrabold leading-tight text-purple-950">
            Instala Skooly en tu celular
          </h2>
          <p className="mt-1 text-sm text-purple-950/60">
            {kind === "inapp"
              ? "Esta página está abierta dentro de otra app. Ábrela en tu navegador para instalar."
              : "Queda como un icono en tu pantalla y se abre como una app, sin navegador."}
          </p>
        </div>

        <ol className="mt-5 flex flex-col gap-3.5">
          {/* iPhone: solo 2 pasos; el botón Compartir está en un lugar distinto según el navegador */}
          {kind === "ios" && (
            <>
              <Step n={1}>
                Toca el botón <strong>Compartir</strong>{" "}
                <Chip>
                  <ShareIcon />
                </Chip>{" "}
                {iosBrowserKind === "chrome" && (
                  <>
                    <strong>arriba a la derecha</strong>, junto a la dirección de la página.
                  </>
                )}
                {iosBrowserKind === "safari" && (
                  <>
                    en la <strong>barra de abajo</strong> de Safari. Si no lo ves, toca{" "}
                    <strong>···</strong> y luego <strong>Compartir</strong>.
                  </>
                )}
                {iosBrowserKind === "other" && <>de tu navegador (en el menú o junto a la dirección).</>}
              </Step>
              <Step n={2}>
                Elige <strong>&quot;Añadir a pantalla de inicio&quot;</strong>{" "}
                <Chip>
                  <PlusSquareIcon />
                </Chip>{" "}
                y toca <strong>&quot;Añadir&quot;</strong>. ¡Listo!
              </Step>
            </>
          )}

          {kind === "android" && (
            <>
              <Step n={1}>
                Toca el menú <Chip><DotsIcon /></Chip> de tu navegador (arriba a la derecha).
              </Step>
              <Step n={2}>
                Toca <strong>&quot;Instalar app&quot;</strong> o{" "}
                <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
              </Step>
              <Step n={3}>
                Confirma con <strong>&quot;Instalar&quot;</strong>. ¡Listo! Verás Skooly en tu
                pantalla.
              </Step>
            </>
          )}

          {kind === "inapp" && (
            <>
              <Step n={1}>
                Toca el menú <Chip><DotsIcon /></Chip> de esta página (arriba o abajo a la derecha).
              </Step>
              <Step n={2}>
                Elige <strong>&quot;Abrir en el navegador&quot;</strong> (Chrome en Android, Safari
                en iPhone).
              </Step>
              <Step n={3}>
                Ahí vuelve a tocar <strong>&quot;Instalar Skooly&quot;</strong> y sigue los pasos.
              </Step>
            </>
          )}
        </ol>

        {kind === "inapp" && (
          <button
            type="button"
            onClick={copyLink}
            className="mt-5 w-full rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-900 transition hover:bg-purple-100"
          >
            {copied ? "✓ ¡Enlace copiado!" : "Copiar el enlace para abrirlo en el navegador"}
          </button>
        )}

        {kind === "ios" && (
          <p className="mt-4 text-center text-xs text-purple-950/50">
            Al tocar el botón, una flecha te mostrará dónde está. ¿No ves la opción? Prueba abriendo
            esta página en Safari.
          </p>
        )}

        <button
          type="button"
          onClick={onGuide ?? onClose}
          className="mt-5 w-full rounded-xl bg-amber-400 px-6 py-3.5 text-base font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-[0.99]"
        >
          {onGuide ? "Mostrarme dónde tocar" : "Entendido"}
        </button>
      </div>
    </div>,
    document.body
  );
}
