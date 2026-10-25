"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellFilledIcon } from "@/components/BellIcon";
import NotificationsMenu from "@/components/NotificationsMenu";
import { usePush } from "@/components/PushNotifications";
import { CrownIcon, GiftIcon } from "@/components/StatIcons";
import StatsBar from "@/components/StatsBar";
import type { SidebarNotification } from "@/lib/sidebar-data";

// Aviso de arriba (como el de Duolingo): invita a permitir las notificaciones de la pantalla de
// bloqueo. Solo aparece si el teléfono puede recibirlas y aún no se activaron.
function PushBanner({ userKey }: { userKey: string }) {
  const { state, busy, enable } = usePush(userKey);
  if (state !== "off") return null;
  return (
    <div className="flex items-center gap-3 border-b border-white/10 bg-[#2a1150] px-4 py-3 md:hidden">
      <BellFilledIcon className="h-9 w-9 shrink-0" />
      <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-white">
        Te estás perdiendo los recordatorios de Skooly
      </p>
      <button
        type="button"
        onClick={() => void enable()}
        disabled={busy}
        className="shrink-0 rounded-xl border-b-4 border-slate-300 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-fuchsia-700 transition active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
      >
        {busy ? "..." : "Permitir"}
      </button>
    </div>
  );
}

// Barra superior del celular: delgada y fija. Llama (días del reto), monedas de oro, vidas y la
// campana de notificaciones. El aviso de notificaciones queda encima y se va al hacer scroll.
// IMPORTANTE: los dos elementos son hijos directos de la página (sin envoltorio) para que "sticky"
// funcione a lo largo de toda la pantalla.
export function MobileTopBar({
  completedDays,
  coins,
  lives,
  notifications,
  userKey,
}: {
  completedDays: number[];
  coins: number;
  lives: number;
  notifications: SidebarNotification[];
  userKey: string;
}) {
  return (
    <>
      <PushBanner userKey={userKey} />
      <div className="sticky top-0 z-40 flex h-16 items-center border-b border-white/10 bg-[#150826]/95 px-3 backdrop-blur md:hidden">
        <StatsBar
          completedDays={completedDays}
          coins={coins}
          lives={lives}
          size="compact"
          sheet
          className="w-full"
          extra={<NotificationsMenu variant="bar" notifications={notifications} collapsed={false} />}
        />
      </div>
    </>
  );
}

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: <span className="text-2xl leading-none">🏠</span> },
  { href: "/dashboard/trivia", label: "Trivia del día", icon: <span className="text-2xl leading-none">🧠</span> },
  { href: "/dashboard/tienda", label: "Tienda", icon: <GiftIcon className="h-7 w-7" /> },
  { href: "/dashboard/planes", label: "Planes", icon: <CrownIcon className="h-7 w-7" /> },
  { href: "/dashboard/perfil", label: "Perfil", icon: <span className="text-2xl leading-none">👤</span> },
];

// Barra inferior fija del celular: el mismo menú del computador, solo con iconos.
export function MobileBottomNav() {
  const pathname = usePathname();

  // Deja espacio al final de la página para que la barra no tape el contenido.
  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  return (
    <nav
      aria-label="Menú principal"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#150826]/95 px-2 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`flex h-14 w-16 items-center justify-center rounded-2xl border-2 transition ${
              active
                ? "border-fuchsia-400/60 bg-fuchsia-500/15"
                : "border-transparent hover:bg-white/5"
            }`}
          >
            {item.icon}
          </Link>
        );
      })}
    </nav>
  );
}
