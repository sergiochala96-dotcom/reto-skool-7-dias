"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MISSIONS, TOTAL_DAYS } from "@/lib/challenge";
import { adminResetProgress, adminUnlockAll, signOut } from "@/app/actions";
import AccountModal from "@/components/AccountModal";
import Avatar from "@/components/Avatar";
import SkoolyLogo from "@/components/SkoolyLogo";
import WelcomeVideoReplayButton from "@/components/WelcomeVideoReplayButton";

export default function Sidebar({
  nombre,
  email,
  avatarUrl,
  admin,
  completedDays,
}: {
  nombre: string;
  email: string;
  avatarUrl: string | null;
  admin: boolean;
  completedDays: number[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(288);
  const [isDesktop, setIsDesktop] = useState(false);
  const resizingRef = useRef(false);

  useEffect(() => {
    try {
      const storedCollapsed = localStorage.getItem("skooly_sidebar_collapsed");
      const storedWidth = localStorage.getItem("skooly_sidebar_width");
      if (storedCollapsed === "1") setCollapsed(true);
      if (storedWidth) {
        const n = Number(storedWidth);
        if (!Number.isNaN(n)) setWidth(n);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const effectiveCollapsed = collapsed && isDesktop;

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem("skooly_sidebar_collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const onMove = (ev: PointerEvent) => {
      if (!resizingRef.current) return;
      const next = Math.min(420, Math.max(220, startWidth + (ev.clientX - startX)));
      setWidth(next);
      try {
        localStorage.setItem("skooly_sidebar_width", String(next));
      } catch {}
    };
    const onUp = () => {
      resizingRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const done = new Set(completedDays);
  const allDone = done.size >= TOTAL_DAYS;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#150826] px-4 py-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10"
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 text-lg font-extrabold text-white"
        >
          <Image
            src="/mascota-skooly.png"
            alt="Skooly"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <SkoolyLogo />
        </Link>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        style={
          {
            "--sidebar-w": effectiveCollapsed ? "80px" : `${width}px`,
          } as React.CSSProperties
        }
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-shrink-0 flex-col border-r border-white/10 bg-[#150826] transition-transform duration-200 md:sticky md:top-0 md:z-auto md:w-[var(--sidebar-w)] md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={effectiveCollapsed ? "Expandir menú" : "Contraer menú"}
          title={effectiveCollapsed ? "Expandir menú" : "Contraer menú"}
          className="absolute right-3 top-3 z-10 hidden h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white md:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="9" y1="4" x2="9" y2="20" />
          </svg>
        </button>

        {!effectiveCollapsed && (
          <div
            onPointerDown={handleResizeStart}
            className="absolute -right-1 top-0 z-10 hidden h-full w-2 cursor-col-resize md:block"
          />
        )}

        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2 ${
            effectiveCollapsed ? "justify-center px-2 pb-4 pt-12" : "px-5 py-6"
          }`}
        >
          <Image
            src="/mascota-skooly.png"
            alt="Skooly"
            width={40}
            height={40}
            className="h-10 w-10 flex-shrink-0 object-contain"
          />
          {!effectiveCollapsed && <SkoolyLogo className="text-xl font-extrabold" />}
        </Link>

        <div className="px-3 pb-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              pathname === "/dashboard"
                ? "bg-fuchsia-500/20 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-lg">🏠</span>
            {!effectiveCollapsed && <span>Inicio</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {!effectiveCollapsed && (
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-white/30">
              Reto de 7 días
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {MISSIONS.map((mission) => {
              const isDone = done.has(mission.day);
              const unlocked = mission.day === 1 || done.has(mission.day - 1);
              const href = `/dia/${mission.day}`;
              const active = pathname === href;

              const content = (
                <div
                  title={effectiveCollapsed ? `Día ${mission.day}: ${mission.title}` : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-fuchsia-500/20 text-white"
                      : unlocked
                      ? "text-white/70 hover:bg-white/5 hover:text-white"
                      : "text-white/30"
                  }`}
                >
                  <span className="text-lg">{mission.emoji}</span>
                  {!effectiveCollapsed && (
                    <>
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="flex-shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                          Día {mission.day}
                        </span>
                        <span className="truncate">{mission.title}</span>
                      </span>
                      {isDone ? (
                        <span className="text-emerald-400">✓</span>
                      ) : !unlocked ? (
                        <span className="text-white/20">🔒</span>
                      ) : null}
                    </>
                  )}
                </div>
              );

              return (
                <li key={mission.day}>
                  {unlocked ? (
                    <Link href={href} onClick={() => setMobileOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed">{content}</div>
                  )}
                </li>
              );
            })}

            <li className="mt-1">
              {allDone ? (
                <Link
                  href="/cofre"
                  onClick={() => setMobileOpen(false)}
                  title={effectiveCollapsed ? "Cofre del Tesoro" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    pathname === "/cofre"
                      ? "bg-amber-400/20 text-amber-200"
                      : "text-amber-300/80 hover:bg-amber-400/10"
                  }`}
                >
                  <span className="text-lg">🗝️</span>
                  {!effectiveCollapsed && <span className="flex-1">Cofre del Tesoro</span>}
                </Link>
              ) : (
                <div
                  title={effectiveCollapsed ? "Cofre del Tesoro" : undefined}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/20"
                >
                  <span className="text-lg">🔒</span>
                  {!effectiveCollapsed && <span className="flex-1">Cofre del Tesoro</span>}
                </div>
              )}
            </li>
          </ul>

          {admin && (
            <>
              {!effectiveCollapsed && (
                <p className="mt-6 px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-white/30">
                  Administración
                </p>
              )}
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                title={effectiveCollapsed ? "Panel de admin" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  pathname === "/admin"
                    ? "bg-amber-400/20 text-amber-200"
                    : "text-amber-300/80 hover:bg-amber-400/10"
                }`}
              >
                <span className="text-lg">🛠️</span>
                {!effectiveCollapsed && <span>Panel de admin</span>}
              </Link>

              <form action={adminUnlockAll}>
                <button
                  type="submit"
                  title={effectiveCollapsed ? "Desbloquear todo" : undefined}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-emerald-300/80 transition hover:bg-emerald-400/10"
                >
                  <span className="text-lg">🔓</span>
                  {!effectiveCollapsed && <span>Desbloquear todo</span>}
                </button>
              </form>

              <form action={adminResetProgress}>
                <button
                  type="submit"
                  title={effectiveCollapsed ? "Reiniciar mi progreso" : undefined}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300/70 transition hover:bg-red-400/10"
                >
                  <span className="text-lg">🔄</span>
                  {!effectiveCollapsed && <span>Reiniciar mi progreso</span>}
                </button>
              </form>
            </>
          )}
        </nav>

        <div className="relative border-t border-white/10 p-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title={effectiveCollapsed ? nombre : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
          >
            <Avatar avatarUrl={avatarUrl} nombre={nombre} size={36} />
            {!effectiveCollapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {nombre}
                  </span>
                  <span className="block truncate text-xs text-white/40">
                    {email}
                  </span>
                </span>
                <span className="text-white/40">⋯</span>
              </>
            )}
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-3 z-10 mb-1 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#1f0f38] shadow-xl">
              <button
                onClick={() => {
                  setAccountOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
              >
                👤 Mi cuenta
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                >
                  🚪 Cerrar sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {accountOpen && (
        <AccountModal
          nombre={nombre}
          email={email}
          avatarUrl={avatarUrl}
          onClose={() => setAccountOpen(false)}
        />
      )}

      <WelcomeVideoReplayButton />
    </>
  );
}
