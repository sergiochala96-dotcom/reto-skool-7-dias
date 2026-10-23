"use client";

import { useCallback, useEffect, useState } from "react";
import { savePushSubscription } from "@/app/actions";
import BellIcon from "@/components/BellIcon";
import { trackCustomEvent } from "@/lib/metaPixel";

// Avisos en la pantalla de bloqueo (Web Push). Funcionan en Android (Chrome) y, en iPhone, solo
// con la app instalada en la pantalla de inicio (iOS 16.4+): en Safari normal el navegador no
// ofrece la función, así que el estado queda "unsupported" y no se muestra nada.
// Pedir el permiso exige un toque de la persona, por eso va siempre detrás de un botón.

type PushState = "checking" | "unsupported" | "off" | "on" | "denied";

const CHANGE_EVENT = "skooly-push-change";
const SAVED_KEY = "skooly_push_saved";
const DISMISSED_KEY = "skooly_push_prompt_dismissed";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string) {
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function isSupported() {
  return (
    Boolean(VAPID_PUBLIC_KEY) &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function usePush() {
  const [state, setState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupported()) return setState("unsupported");
    if (Notification.permission === "denied") return setState("denied");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") {
        setState("on");
        // Si en este dispositivo entra otra cuenta, el aviso pasa a ser de quien lo usa ahora.
        // Una vez por sesión del navegador es suficiente.
        if (!sessionStorage.getItem(SAVED_KEY)) {
          sessionStorage.setItem(SAVED_KEY, "1");
          void savePushSubscription(sub.toJSON());
        }
      } else {
        setState("off");
      }
    } catch {
      setState("off");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee APIs del navegador
    void refresh();
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => window.removeEventListener(CHANGE_EVENT, refresh);
  }, [refresh]);

  const enable = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          }));
        const { ok } = await savePushSubscription(sub.toJSON());
        if (!ok) throw new Error("save");
        sessionStorage.setItem(SAVED_KEY, "1");
        trackCustomEvent("ActivoAvisos");
      }
    } catch {
      setError("No pudimos activar los avisos. Inténtalo de nuevo en un momento.");
    } finally {
      setBusy(false);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }, []);

  return { state, busy, error, enable };
}

// Botón del menú lateral. Solo aparece si el dispositivo puede recibir avisos y aún no los activó.
export function PushSidebarButton({
  collapsed,
  onActivated,
}: {
  collapsed: boolean;
  onActivated?: () => void;
}) {
  const { state, busy, enable } = usePush();
  if (state !== "off") return null;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        void enable().then(onActivated);
      }}
      title={collapsed ? "Activar avisos en mi celular" : undefined}
      aria-label="Activar avisos en mi celular"
      className={`flex items-center justify-center gap-2 bg-purple-200 font-bold text-purple-950 shadow-md shadow-purple-300/20 transition hover:bg-purple-100 disabled:opacity-60 ${
        collapsed ? "h-10 w-10 rounded-full" : "rounded-xl px-3 py-2 text-sm md:text-base"
      }`}
    >
      <BellIcon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{busy ? "Activando..." : "Activar avisos en mi celular"}</span>}
    </button>
  );
}

// Tarjeta del panel que invita a activar los avisos (se muestra tras completar el Día 1).
export function PushPromptCard() {
  const { state, busy, error, enable } = usePush();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lee localStorage
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (state !== "off" || dismissed) return null;

  return (
    <section className="mx-auto mb-5 flex w-full max-w-md items-center gap-3 rounded-3xl border-2 border-amber-300/30 bg-gradient-to-br from-[#2a1150] to-[#1a0b2e] px-4 py-4 shadow-2xl shadow-fuchsia-900/40 md:mb-6 md:max-w-4xl md:px-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-purple-950">
        <BellIcon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white md:text-base">¿Te avisamos de las novedades?</p>
        <p className="text-xs text-white/70 md:text-sm">
          Activa los avisos y te recordamos tu reto en la pantalla de bloqueo.
        </p>
        {error && <p className="mt-1 text-xs font-semibold text-red-300">{error}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void enable()}
          className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-extrabold text-black transition hover:bg-amber-300 disabled:opacity-60"
        >
          {busy ? "Activando..." : "Activar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(DISMISSED_KEY, "1");
            } catch {
              // sin localStorage: solo se oculta hasta recargar
            }
          }}
          className="px-2 py-1 text-xs font-semibold text-white/50 transition hover:text-white/80"
        >
          Ahora no
        </button>
      </div>
    </section>
  );
}
