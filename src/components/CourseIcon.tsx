// Icono de reproductor de curso: pantalla con el botón de play (misión "curso en Skool").
export default function CourseIcon({ className }: { className?: string }) {
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
      <rect x="2" y="4" width="20" height="14" rx="3" />
      <path d="M10 8.2v5.6l4.8-2.8z" fill="currentColor" />
      <path d="M8 21h8" />
    </svg>
  );
}
