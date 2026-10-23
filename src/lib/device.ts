// Tipo de dispositivo a partir del user-agent del navegador (solo se guarda esta etiqueta).

export type Device = "computadora" | "android" | "iphone" | "otro";

export const DEVICES: Device[] = ["computadora", "android", "iphone", "otro"];

export const DEVICE_LABEL: Record<Device, string> = {
  computadora: "Computadora",
  android: "Android",
  iphone: "iPhone / iPad",
  otro: "Otro",
};

export const DEVICE_ICON: Record<Device, string> = {
  computadora: "💻",
  android: "🤖",
  iphone: "📱",
  otro: "❔",
};

export function detectDevice(userAgent?: string | null): Device {
  const ua = userAgent ?? "";
  if (!ua || /bot|crawler|spider|facebookexternalhit|preview/i.test(ua)) return "otro";
  if (/iPhone|iPod|iPad/i.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android"; // antes que Linux: el user-agent de Android lo incluye
  if (/Windows|Macintosh|Mac OS X|X11|Linux|CrOS/i.test(ua)) return "computadora";
  return "otro";
}

export function isDevice(value: unknown): value is Device {
  return typeof value === "string" && (DEVICES as string[]).includes(value);
}
