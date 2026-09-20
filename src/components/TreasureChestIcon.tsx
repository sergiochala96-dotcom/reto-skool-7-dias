export default function TreasureChestIcon({
  locked,
  className,
}: {
  locked: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={locked ? "#5b4636" : "#8a5a2e"} />
          <stop offset="100%" stopColor={locked ? "#3d2f24" : "#5c3a1c"} />
        </linearGradient>
        <linearGradient id="chestGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={locked ? "#8a8a8a" : "#ffd76a"} />
          <stop offset="100%" stopColor={locked ? "#5f5f5f" : "#f5a623"} />
        </linearGradient>
      </defs>
      {/* base */}
      <rect x="8" y="30" width="48" height="24" rx="4" fill="url(#chestWood)" />
      <rect x="8" y="30" width="48" height="6" fill="url(#chestGold)" opacity="0.9" />
      <rect x="8" y="46" width="48" height="4" fill="url(#chestGold)" opacity="0.7" />
      {/* lid */}
      <path d="M8 30 C8 18 16 12 32 12 C48 12 56 18 56 30 Z" fill="url(#chestWood)" />
      <path
        d="M8 30 C8 18 16 12 32 12 C48 12 56 18 56 30"
        fill="none"
        stroke="url(#chestGold)"
        strokeWidth="3"
      />
      {/* lock */}
      <circle cx="32" cy="30" r="7" fill="url(#chestGold)" />
      <circle cx="32" cy="30" r="3" fill={locked ? "#3d3d3d" : "#7a4a10"} />
    </svg>
  );
}
