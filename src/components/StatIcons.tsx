// Iconos del panel de estadísticas (racha, monedas de oro y vidas).

export function FlameIcon({ className, lit = true }: { className?: string; lit?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb02e" />
          <stop offset="100%" stopColor="#ff5a1f" />
        </linearGradient>
      </defs>
      <path
        d="M12 2c.6 3.2-1.4 4.8-3.1 6.7C7.2 10.6 6 12.4 6 14.8 6 18.6 8.7 22 12 22s6-3.4 6-7.2c0-2.3-1-3.9-2.2-5.4-.5 1.1-1.2 1.7-2 2 .5-3.6-.6-6.5-1.8-9.4Z"
        fill={lit ? "url(#flameGrad)" : "#5b5470"}
      />
      <path
        d="M12 22c-1.7 0-3-1.5-3-3.4 0-1.6.9-2.5 1.8-3.5.5-.6 1-1.2 1.2-2.1.9 1.1 3 2.5 3 5.2 0 2.1-1.3 3.8-3 3.8Z"
        fill={lit ? "#ffd76a" : "#7a7390"}
      />
    </svg>
  );
}

export function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="100%" stopColor="#f0a020" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#coinGrad)" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#b36b00" strokeOpacity="0.55" strokeWidth="1.4" />
      <path
        d="m12 7.6 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z"
        fill="#b36b00"
        fillOpacity="0.8"
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
