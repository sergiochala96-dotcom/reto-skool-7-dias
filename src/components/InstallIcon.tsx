// Icono de "instalar app": un celular con una flecha hacia abajo.
export default function InstallIcon({ className }: { className?: string }) {
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
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M12 7.5v6" />
      <path d="m9.5 11.5 2.5 2.5 2.5-2.5" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}
