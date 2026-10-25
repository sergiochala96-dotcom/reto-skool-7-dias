"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDayUnlocked, MISSIONS, TOTAL_DAYS } from "@/lib/challenge";
import type { SidebarNotification } from "@/lib/sidebar-data";
import { sidebarPlanLabel, type PlanId } from "@/lib/planes";
import { adminResetProgress, adminUnlockAll, completeStartMission, signOut } from "@/app/actions";
import AccountModal from "@/components/AccountModal";
import Avatar from "@/components/Avatar";
import CourseIcon from "@/components/CourseIcon";
import GemIcon from "@/components/GemIcon";
import { CoinIcon } from "@/components/StatIcons";
import InstallIcon from "@/components/InstallIcon";
import { PushSidebarButton } from "@/components/PushNotifications";
import { useInstallApp } from "@/components/InstallAppProvider";
import { WHATSAPP_PATH } from "@/components/GraciasCheckpoints";
import { SKOOL_COMMUNITY_URL, WHATSAPP_COMMUNITY_URL } from "@/lib/captacion";
import NotificationsMenu from "@/components/NotificationsMenu";
import SkoolyLogo from "@/components/SkoolyLogo";
import { MobileBottomNav, MobileTopBar } from "@/components/MobileChrome";
import WelcomeVideoReplayButton from "@/components/WelcomeVideoReplayButton";

// Elementos del menú: etiquetas en mayúsculas y negrita, esquinas redondeadas y borde de color en
// el que está activo (estilo Duolingo).
const NAV_ITEM =
  "flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-[13px] font-extrabold uppercase tracking-wider transition md:text-sm";
const NAV_ACTIVE = "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-100";
const NAV_IDLE = "border-transparent text-white/70 hover:bg-white/5 hover:text-white";

// Botones del menú: cristal translúcido; el de planes lleva un degradado fucsia para destacar.
const GLASS_BTN =
  "flex items-center justify-center gap-2 border border-white/15 bg-white/[0.07] font-semibold text-white shadow-lg shadow-black/25 backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.13] active:scale-[0.98]";
const PREMIUM_BTN =
  "flex items-center justify-center gap-2 border border-white/15 bg-white/10 font-semibold text-white shadow-lg shadow-black/25 transition hover:bg-white/15 active:scale-[0.98]";

export default function Sidebar({
  nombre,
  email,
  avatarUrl,
  admin,
  completedDays,
  notifications,
  plan,
  coins,
  lives,
}: {
  nombre: string;
  email: string;
  avatarUrl: string | null;
  admin: boolean;
  completedDays: number[];
  notifications: SidebarNotification[];
  plan: PlanId;
  coins: number;
  lives: number;
}) {
  const pathname = usePathname();
  const { platform: installPlatform, openInstall } = useInstallApp();
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
      {/* Celular: barra superior fija (llama, monedas, vidas y campana) y barra inferior fija (menú). */}
      <MobileTopBar
        completedDays={completedDays}
        coins={coins}
        lives={lives}
        notifications={notifications}
        userKey={email}
      />
      <MobileBottomNav />

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
        className={`max-md:hidden fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-shrink-0 flex-col border-r border-white/10 bg-[#150826] transition-transform duration-200 md:sticky md:top-0 md:z-auto md:w-[var(--sidebar-w)] md:translate-x-0 ${
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
            effectiveCollapsed ? "justify-center px-2 pb-3 pt-12" : "px-5 py-4"
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

        <div className="flex flex-col gap-1 px-3 pb-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            title={effectiveCollapsed ? "Inicio" : undefined}
            className={`${NAV_ITEM} ${pathname === "/dashboard" ? NAV_ACTIVE : NAV_IDLE}`}
          >
            <span className="flex h-7 w-7 items-center justify-center text-2xl">🏠</span>
            {!effectiveCollapsed && <span>Inicio</span>}
          </Link>
          <Link
            href="/dashboard/trivia"
            onClick={() => setMobileOpen(false)}
            title={effectiveCollapsed ? "Trivia del día" : undefined}
            className={`${NAV_ITEM} ${pathname === "/dashboard/trivia" ? NAV_ACTIVE : NAV_IDLE}`}
          >
            <span className="flex h-7 w-7 items-center justify-center text-2xl">🧠</span>
            {!effectiveCollapsed && <span>Trivia del día</span>}
          </Link>
          <Link
            href="/dashboard/tienda"
            onClick={() => setMobileOpen(false)}
            title={effectiveCollapsed ? "Tienda" : undefined}
            className={`${NAV_ITEM} ${pathname === "/dashboard/tienda" ? NAV_ACTIVE : NAV_IDLE}`}
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <CoinIcon className="h-6 w-6" />
            </span>
            {!effectiveCollapsed && <span>Tienda</span>}
          </Link>
          <Link
            href="/dashboard/planes"
            onClick={() => setMobileOpen(false)}
            title={effectiveCollapsed ? "Planes" : undefined}
            className={`${NAV_ITEM} ${pathname === "/dashboard/planes" ? NAV_ACTIVE : NAV_IDLE}`}
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <GemIcon className="h-6 w-6 text-fuchsia-300" />
            </span>
            {!effectiveCollapsed && <span>Planes</span>}
          </Link>
          <Link
            href="/dashboard/perfil"
            onClick={() => setMobileOpen(false)}
            title={effectiveCollapsed ? "Perfil" : undefined}
            className={`${NAV_ITEM} ${pathname === "/dashboard/perfil" ? NAV_ACTIVE : NAV_IDLE}`}
          >
            <span className="flex h-7 w-7 items-center justify-center text-2xl">👤</span>
            {!effectiveCollapsed && <span>Perfil</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {/* La lista de los 7 días y el cofre solo van en el menú del celular; en computadora se entra a
              cada día desde el camino del panel. */}
          <div className="md:hidden">
            {!effectiveCollapsed && (
              <p className="px-2 pb-1.5 text-xs font-semibold uppercase tracking-wide text-white/30 md:text-[13px]">
                Reto de 7 días
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {MISSIONS.map((mission) => {
                const isDone = done.has(mission.day);
                const unlocked = isDayUnlocked(mission.day, done);
                const href = `/dia/${mission.day}`;
                const active = pathname === href;

                const content = (
                  <div
                    title={effectiveCollapsed ? `Día ${mission.day}: ${mission.title}` : undefined}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 text-sm font-bold transition md:text-[15px] ${
                      active
                        ? NAV_ACTIVE
                        : unlocked
                        ? NAV_IDLE
                        : "border-transparent text-white/30"
                    }`}
                  >
                    <span className="text-lg md:text-xl">{mission.emoji}</span>
                    {!effectiveCollapsed && (
                      <>
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="flex-shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60 md:text-[11px]">
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

              <li className="mt-0.5">
                {allDone ? (
                  <Link
                    href="/cofre"
                    onClick={() => setMobileOpen(false)}
                    title={effectiveCollapsed ? "Cofre del Tesoro" : undefined}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 text-sm font-bold transition md:text-[15px] ${
                      pathname === "/cofre"
                        ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
                        : "border-transparent text-amber-300/80 hover:bg-amber-400/10"
                    }`}
                  >
                    <span className="text-lg md:text-xl">🗝️</span>
                    {!effectiveCollapsed && <span className="flex-1">Cofre del Tesoro</span>}
                  </Link>
                ) : (
                  <div
                    title={effectiveCollapsed ? "Cofre del Tesoro" : undefined}
                    className="flex cursor-not-allowed items-center gap-3 rounded-2xl border-2 border-transparent px-3 py-2 text-sm font-bold text-white/20 md:text-[15px]"
                  >
                    <span className="text-lg md:text-xl">🔒</span>
                    {!effectiveCollapsed && <span className="flex-1">Cofre del Tesoro</span>}
                  </div>
                )}
              </li>
            </ul>
          </div>

          {/* Acceso permanente a las dos comunidades (para todos). Marcan las misiones de inicio. */}
          <div
            className={`mt-3 flex flex-col pb-2 ${
              effectiveCollapsed ? "items-center gap-2" : "gap-2"
            }`}
          >
            {/* En computadora estas dos recompensas viven en la columna derecha del panel. */}
            <div className="flex flex-col gap-2 md:hidden">
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setMobileOpen(false);
                  void completeStartMission("whatsapp");
                }}
                title={effectiveCollapsed ? "Unirme al WhatsApp" : undefined}
                aria-label="Unirme al WhatsApp"
                className={`${GLASS_BTN} ${
                  effectiveCollapsed
                    ? "h-10 w-10 rounded-full"
                    : "rounded-xl px-3 py-2 text-sm md:text-base"
                }`}
              >
                <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5 shrink-0 text-[#25D366]" aria-hidden="true">
                  <path d={WHATSAPP_PATH} />
                </svg>
                {!effectiveCollapsed && <span>Unirme al WhatsApp</span>}
              </a>
              <a
                href={SKOOL_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setMobileOpen(false);
                  void completeStartMission("skool");
                }}
                title={effectiveCollapsed ? "Unirme al curso en Skool" : undefined}
                aria-label="Unirme al curso en Skool"
                className={`${GLASS_BTN} ${
                  effectiveCollapsed
                    ? "h-10 w-10 rounded-full"
                    : "rounded-xl px-3 py-2 text-sm md:text-base"
                }`}
              >
                <CourseIcon className="h-5 w-5 shrink-0 text-amber-300" />
                {!effectiveCollapsed && <span>Unirme al curso en Skool</span>}
              </a>
            </div>

            {/* Invitación a un plan superior (las personas con VIP no la ven). */}
            {plan !== "vip" &&
              (effectiveCollapsed ? (
                <Link
                  href="/dashboard/planes"
                  onClick={() => setMobileOpen(false)}
                  title={sidebarPlanLabel(plan)}
                  aria-label={sidebarPlanLabel(plan)}
                  className={`${PREMIUM_BTN} h-10 w-10 rounded-full ${
                    pathname === "/dashboard/planes" ? "ring-2 ring-fuchsia-300/70" : ""
                  }`}
                >
                  <GemIcon className="h-5 w-5 shrink-0 text-fuchsia-200" />
                </Link>
              ) : (
                <Link
                  href="/dashboard/planes"
                  onClick={() => setMobileOpen(false)}
                  className={`group block rounded-2xl border bg-white/[0.04] p-3.5 transition hover:bg-white/[0.07] ${
                    pathname === "/dashboard/planes" ? "border-fuchsia-300/60" : "border-white/10"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300/90">
                    {plan === "standard" ? "Premium" : "VIP"}
                  </span>
                  <p className="mt-1 text-[15px] font-bold leading-tight text-white">
                    {plan === "standard" ? "Conoce Skooly Premium" : "Pasa a Skooly VIP"}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-white/55">
                    {plan === "standard"
                      ? "Abre el Episodio 2 con prompts y estrategias antichurn."
                      : "Clases en vivo semanales y acceso a la membresía de Skool."}
                  </p>
                  <span className="mt-3 block rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-white/90 transition group-hover:bg-white/15">
                    {plan === "standard" ? "Ver Premium" : "Ver VIP"}
                  </span>
                </Link>
              ))}

            {/* Solo en celulares y tablets (y si la app aún no está instalada). */}
            {installPlatform && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openInstall();
                }}
                title={effectiveCollapsed ? "Instalar la app en mi celular" : undefined}
                aria-label="Instalar la app en mi celular"
                className={`${GLASS_BTN} ${
                  effectiveCollapsed
                    ? "h-10 w-10 rounded-full"
                    : "rounded-xl px-3 py-2 text-sm md:text-base"
                }`}
              >
                <InstallIcon className="h-5 w-5 shrink-0 text-fuchsia-300" />
                {!effectiveCollapsed && <span>Instalar la app en mi celular</span>}
              </button>
            )}

            {/* Solo si el dispositivo puede recibir avisos y aún no los activó. */}
            <PushSidebarButton
              userKey={email}
              collapsed={effectiveCollapsed}
              onActivated={() => setMobileOpen(false)}
            />
          </div>
        </nav>

        <div className="border-t border-white/10 pt-2">
          <NotificationsMenu
            notifications={notifications}
            collapsed={effectiveCollapsed}
            onOpenNotification={() => setMobileOpen(false)}
            onToggle={() => setMenuOpen(false)}
          />
        </div>

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
                  <span className="block truncate text-sm font-medium text-white md:text-base">
                    {nombre}
                  </span>
                  <span className="block truncate text-xs text-white/40 md:text-sm">
                    {email}
                  </span>
                </span>
                <span className="text-white/40">⋯</span>
              </>
            )}
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-3 z-10 mb-1 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#1f0f38] shadow-xl">
              {admin && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-300/90 hover:bg-white/5"
                  >
                    🛠️ Panel de admin
                  </Link>
                  <Link
                    href="/admin/origen"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-300/90 hover:bg-white/5"
                  >
                    📈 Origen del tráfico
                  </Link>
                  <Link
                    href="/admin/notificaciones"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-300/90 hover:bg-white/5"
                  >
                    ✉️ Escribir notificaciones
                  </Link>
                  <form action={adminUnlockAll}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-emerald-300/90 hover:bg-white/5"
                    >
                      🔓 Desbloquear todo
                    </button>
                  </form>
                  <form action={adminResetProgress}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-300/80 hover:bg-white/5"
                    >
                      🔄 Reiniciar mi progreso
                    </button>
                  </form>
                  <div className="my-1 h-px bg-white/10" />
                </>
              )}
              <button
                onClick={() => {
                  setAccountOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5"
              >
                👤 Mi cuenta
              </button>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5"
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

      {/* Reproducir otra vez el video de bienvenida: solo existe en el panel de admin. */}
      {admin && pathname === "/admin" && <WelcomeVideoReplayButton />}
    </>
  );
}
