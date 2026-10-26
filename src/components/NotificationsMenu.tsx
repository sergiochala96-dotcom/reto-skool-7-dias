"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { markNotificationRead } from "@/app/actions";
import { BellFilledIcon } from "@/components/BellIcon";
import type { SidebarNotification } from "@/lib/sidebar-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Convierte las URLs del mensaje en enlaces clicables (el resto se muestra como texto).
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-violet-700 underline"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function NotificationsMenu({
  notifications,
  collapsed,
  onOpenNotification,
  onToggle,
  variant = "sidebar",
}: {
  variant?: "sidebar" | "bar"; // bar: solo la campana, para la barra superior del celular
  notifications: SidebarNotification[];
  collapsed: boolean;
  onOpenNotification?: () => void;
  onToggle?: () => void; // se llama al abrir/cerrar la campana (para cerrar otros menús)
}) {
  const [items, setItems] = useState(notifications);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"new" | "old">("new");
  const [selected, setSelected] = useState<SidebarNotification | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Si el servidor trae notificaciones nuevas (al navegar), se actualiza la lista
  // conservando lo que ya se marcó como leído en esta sesión.
  useEffect(() => {
    setItems((prev) => {
      const readNow = new Set(prev.filter((n) => n.read).map((n) => n.id));
      return notifications.map((n) => ({ ...n, read: n.read || readNow.has(n.id) }));
    });
  }, [notifications]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  const unread = items.filter((n) => !n.read);
  const read = items.filter((n) => n.read);
  const list = tab === "new" ? unread : read;

  function openNotification(n: SidebarNotification) {
    setSelected(n);
    setOpen(false);
    onOpenNotification?.();
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      void markNotificationRead(n.id);
    }
  }

  const badge = unread.length > 9 ? "9+" : String(unread.length);
  const bar = variant === "bar";

  return (
    <div ref={wrapperRef} className={bar ? "relative" : "relative px-3 pb-1"}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          onToggle?.();
        }}
        title={collapsed ? "Notificaciones" : undefined}
        aria-label={`Notificaciones${unread.length ? `, ${unread.length} sin leer` : ""}`}
        className={bar ? "relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10" : `flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-[13px] font-extrabold uppercase tracking-wider transition md:text-sm ${
          open
            ? "border-white/20 bg-white/10 text-white"
            : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span
          className={
            bar
              ? "relative flex h-8 w-8 items-center justify-center"
              : "relative flex h-7 w-7 items-center justify-center text-2xl leading-none"
          }
        >
          {bar ? <BellFilledIcon className="h-7 w-7" /> : "🔔"}
          {unread.length > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-surface">
              {badge}
            </span>
          )}
        </span>
        {!collapsed && !bar && <span className="flex-1">Notificaciones</span>}
      </button>

      {open && (
        <div
          className={
            bar
              ? "absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-white/10 bg-[#1f0f38] shadow-xl"
              : "absolute bottom-full left-3 right-3 z-20 mb-1 overflow-hidden md:right-auto md:w-72 rounded-xl border border-white/10 bg-[#1f0f38] shadow-xl"
          }
        >
          <div className="flex border-b border-white/10 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setTab("new")}
              className={`flex-1 px-3 py-2.5 transition ${
                tab === "new"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              Nuevas{unread.length > 0 ? ` (${unread.length})` : ""}
            </button>
            <button
              type="button"
              onClick={() => setTab("old")}
              className={`flex-1 px-3 py-2.5 transition ${
                tab === "old"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              Anteriores
            </button>
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {list.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-white/50">
                {tab === "new"
                  ? "No tienes notificaciones nuevas 🎉"
                  : "Aún no has leído ninguna notificación."}
              </li>
            )}
            {list.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openNotification(n)}
                  className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5"
                >
                  <span
                    className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl ${
                      n.read ? "bg-white/5 opacity-60" : "bg-white/10"
                    }`}
                  >
                    🔔
                    {!n.read && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-[#1f0f38]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[15px] ${
                        n.read ? "text-white/70" : "font-semibold text-white"
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="block text-xs text-white/45">{formatDate(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelected(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="notification-title"
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                🔔 Comunicado · {formatDate(selected.created_at)}
              </p>
              <h2 id="notification-title" className="mt-1 text-xl font-extrabold text-purple-950">
                {selected.title}
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                <Linkified text={selected.body} />
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setSelected(null)}
                className="mt-6 w-full rounded-xl bg-purple-900 px-5 py-3 font-bold text-white transition hover:bg-purple-800"
              >
                Cerrar
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
