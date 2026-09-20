export default function TreasureChestOpenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="openWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5692f" />
          <stop offset="100%" stopColor="#6b4322" />
        </linearGradient>
        <linearGradient id="openGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
        <radialGradient id="openGlow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#fff3b0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff3b0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="32" cy="27" rx="27" ry="21" fill="url(#openGlow)" />

      {/* tapa abierta, inclinada hacia atrás */}
      <path
        d="M9 31 C9 13 18 5 32 5 C46 5 55 13 55 31"
        fill="url(#openWood)"
        stroke="url(#openGold)"
        strokeWidth="2.5"
      />

      {/* destellos */}
      <path
        d="M15 16 l1.6 3.8 3.8 1.6 -3.8 1.6 -1.6 3.8 -1.6 -3.8 -3.8 -1.6 3.8 -1.6 z"
        fill="#fff3b0"
      />
      <path
        d="M49 13 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1 z"
        fill="#fff3b0"
      />

      {/* monedas de oro dentro */}
      <circle cx="23" cy="33" r="6.5" fill="url(#openGold)" />
      <circle cx="34" cy="30" r="7.5" fill="url(#openGold)" />
      <circle cx="43" cy="34" r="6" fill="url(#openGold)" />
      <circle cx="29" cy="37" r="5.5" fill="#ffe988" />
      <circle cx="38" cy="38" r="5" fill="#ffe988" />

      {/* base del cofre, tapa el borde inferior de las monedas */}
      <rect x="7" y="38" width="50" height="20" rx="4" fill="url(#openWood)" />
      <rect x="7" y="38" width="50" height="6" fill="url(#openGold)" opacity="0.9" />
      <rect x="7" y="52" width="50" height="4" fill="url(#openGold)" opacity="0.7" />
    </svg>
  );
}
