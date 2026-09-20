const LETTER_COLORS = ["#3b82f6", "#f87171", "#fbbf24", "#2dd4bf", "#fb923c", "#facc15"];

export default function SkoolyLogo({ className }: { className?: string }) {
  return (
    <span className={className}>
      {"Skooly".split("").map((letter, i) => (
        <span key={i} style={{ color: LETTER_COLORS[i] }}>
          {letter}
        </span>
      ))}
    </span>
  );
}
