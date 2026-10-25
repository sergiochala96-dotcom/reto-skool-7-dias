import { CoinIcon, FlameIcon, HeartIcon } from "@/components/StatIcons";

// Iconos de perfil que se canjean en la tienda. Cada uno es un dibujo sobre un fondo de color.
// PROTOTIPOS: para cambiar un dibujo o agregar otro basta con editar este archivo (la clave —llama,
// moneda, corazon— es lo que guarda la tienda). La foto de perfil guarda "icon:<clave>".

export const AVATAR_ICON_PREFIX = "icon:";

type IconProps = { className?: string };

export const AVATAR_ICONS = {
  llama: {
    label: "Llama",
    background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
    Icon: (p: IconProps) => <FlameIcon {...p} />,
  },
  moneda: {
    label: "Moneda",
    background: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
    Icon: (p: IconProps) => <CoinIcon {...p} />,
  },
  corazon: {
    label: "Corazón",
    background: "linear-gradient(135deg, #4c0519 0%, #be123c 100%)",
    Icon: (p: IconProps) => <HeartIcon {...p} />,
  },
} as const;

export type AvatarIconKey = keyof typeof AVATAR_ICONS;

export function isAvatarIconKey(value: unknown): value is AvatarIconKey {
  return typeof value === "string" && value in AVATAR_ICONS;
}

// Si la foto de perfil guardada es un icono ("icon:llama"), devuelve su clave.
export function avatarIconKey(avatarUrl: string | null | undefined): AvatarIconKey | null {
  if (!avatarUrl || !avatarUrl.startsWith(AVATAR_ICON_PREFIX)) return null;
  const key = avatarUrl.slice(AVATAR_ICON_PREFIX.length);
  return isAvatarIconKey(key) ? key : null;
}

// Círculo con el icono, del tamaño pedido.
export default function AvatarIcon({ name, size }: { name: string; size: number }) {
  if (!isAvatarIconKey(name)) return null;
  const { background, Icon } = AVATAR_ICONS[name];
  return (
    <span
      className="flex items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size, background }}
    >
      <Icon className="h-3/5 w-3/5" />
    </span>
  );
}
