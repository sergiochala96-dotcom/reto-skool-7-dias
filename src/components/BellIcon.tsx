// Icono de campana (avisos / notificaciones).
export default function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// Campana amarilla rellena (aviso de notificaciones y barra superior del celular).
export function BellFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2a1.5 1.5 0 0 0-1.5 1.5v.6C7.9 4.8 6 7.1 6 10v3.6c0 .6-.2 1.1-.6 1.5L4 16.5c-.6.7-.1 1.8.9 1.8h14.2c1 0 1.5-1.1.9-1.8l-1.4-1.4c-.4-.4-.6-.9-.6-1.5V10c0-2.9-1.9-5.2-4.5-5.9v-.6A1.5 1.5 0 0 0 12 2Z"
        fill="#facc15"
      />
      <path d="M9.6 19.5a2.5 2.5 0 0 0 4.8 0Z" fill="#f59e0b" />
    </svg>
  );
}
