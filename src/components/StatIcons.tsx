// Iconos del panel de estadísticas (racha, monedas de oro y vidas).

export function FlameIcon({ className, lit = true }: { className?: string; lit?: boolean }) {
  // Colores planos (sin degradados): un degradado con id repetido deja de verse si la primera
  // copia del icono está dentro de un bloque oculto.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2c.6 3.2-1.4 4.8-3.1 6.7C7.2 10.6 6 12.4 6 14.8 6 18.6 8.7 22 12 22s6-3.4 6-7.2c0-2.3-1-3.9-2.2-5.4-.5 1.1-1.2 1.7-2 2 .5-3.6-.6-6.5-1.8-9.4Z"
        fill={lit ? "#ff7a1a" : "#5b5470"}
      />
      <path
        d="M12 22c-1.7 0-3-1.5-3-3.4 0-1.6.9-2.5 1.8-3.5.5-.6 1-1.2 1.2-2.1.9 1.1 3 2.5 3 5.2 0 2.1-1.3 3.8-3 3.8Z"
        fill={lit ? "#ffd23f" : "#7a7390"}
      />
    </svg>
  );
}

export function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#f5b21b" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#ffd96a" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#b36b00" strokeOpacity="0.55" strokeWidth="1.4" />
      <path
        d="m12 7.6 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z"
        fill="#b36b00"
        fillOpacity="0.85"
      />
    </svg>
  );
}

export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.6 4.5 6.2 4.2c2-.2 3.9.8 5.8 3 1.9-2.2 3.8-3.2 5.8-3 3.6.3 5.3 4 3.8 7.5C19.5 16.4 12 21 12 21Z"
        fill="#ff4b4b"
      />
      <path d="M7 8.2c.9-.9 2.2-.9 3 0" fill="none" stroke="#ff9a9a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 9h16l-1.2-4.2A1 1 0 0 0 17.8 4H6.2a1 1 0 0 0-1 .8L4 9Z" />
      <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

// Iconos del menú (colores planos): caja de regalo para la Tienda y corona para los Planes.
export function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="1.8" fill="#ff4b6e" />
      <rect x="2" y="7" width="20" height="4.6" rx="1.8" fill="#ff7a93" />
      <rect x="10.4" y="7" width="3.2" height="14" fill="#ffd23f" />
      <path d="M12 7C12 7 7.6 7.2 7.6 4.8 7.6 3.4 8.8 2.8 10 3.1 11.6 3.5 12 7 12 7Z" fill="#ffd23f" />
      <path d="M12 7C12 7 16.4 7.2 16.4 4.8 16.4 3.4 15.2 2.8 14 3.1 12.4 3.5 12 7 12 7Z" fill="#ffd23f" />
    </svg>
  );
}

export function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M2.8 8.2 7.6 12 12 5l4.4 7 4.8-3.8-1.9 10.6H4.7Z" fill="#f5b21b" />
      <rect x="4.6" y="17.4" width="14.8" height="2.8" rx="1" fill="#d98f00" />
      <circle cx="2.8" cy="7.6" r="1.7" fill="#ffd96a" />
      <circle cx="12" cy="4.6" r="1.7" fill="#ffd96a" />
      <circle cx="21.2" cy="7.6" r="1.7" fill="#ffd96a" />
    </svg>
  );
}
