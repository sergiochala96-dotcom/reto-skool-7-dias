import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <path d="M8 11.5v6" />
      <path d="M12 17.5v-3.8c0-1.3 1-2.2 2.2-2.2s2 .9 2 2.2v3.8" />
      <path d="M12 11.5v6" />
    </>
  ),
  tiktok: (
    <path d="M14.5 3v10.5a3 3 0 1 1-2.4-2.94V8a5.3 5.3 0 0 0 5.3 5.3V10.7a2.7 2.7 0 0 1-2.9-2.7V3z" />
  ),
  facebook: (
    <path d="M14 21v-7h2.5l.5-3H14V9c0-.9.3-1.5 1.7-1.5H17V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8.5v3H10.8v7z" />
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  otra: (
    <>
      <path d="M9 12a4 4 0 0 0 4 4h2a4 4 0 0 0 0-8h-1" />
      <path d="M15 12a4 4 0 0 0-4-4H9a4 4 0 0 0 0 8h1" />
    </>
  ),
  hombre: (
    <>
      <circle cx="10" cy="14" r="6" />
      <path d="M14.5 9.5 20 4" />
      <path d="M15 4h5v5" />
    </>
  ),
  mujer: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v7" />
      <path d="M9 19h6" />
    </>
  ),
  ambos: (
    <>
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </>
  ),
  historias: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </>
  ),
  estados: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  ),
  grupos: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15 13.8c2.3.3 4 2.4 4 5.2" />
    </>
  ),
  carruseles: (
    <>
      <rect x="3" y="7" width="14" height="14" rx="2" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
    </>
  ),
  reels: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9.5 9v6l5-3z" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function PlatformIcon({ id, className }: { id: string; className?: string }) {
  const inner = PATHS[id];
  if (!inner) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {inner}
    </svg>
  );
}
