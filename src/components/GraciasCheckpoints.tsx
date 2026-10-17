export const WHATSAPP_PATH =
  "M16.001 3C9.373 3 4 8.373 4 15.001c0 2.386.638 4.622 1.751 6.552L4 29l7.633-1.719A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.629 28 15.001 28 8.373 22.629 3 16.001 3zm6.995 17.06c-.297.836-1.476 1.532-2.415 1.732-.643.137-1.482.246-4.306-.925-3.615-1.497-5.938-5.163-6.119-5.404-.176-.242-1.464-1.949-1.464-3.716s.925-2.634 1.253-2.997c.297-.33.65-.412.867-.412.217 0 .434.002.624.011.2.009.469-.076.734.559.271.65.921 2.243.999 2.406.078.163.13.354.026.57-.104.217-.156.352-.309.541-.153.19-.322.423-.46.568-.156.163-.318.34-.137.667.182.326.808 1.334 1.734 2.161 1.191 1.063 2.196 1.392 2.522 1.549.326.156.517.13.708-.078.19-.208.816-.951 1.034-1.278.217-.326.434-.271.734-.163.3.109 1.9.897 2.226 1.06.326.163.543.244.624.38.081.136.081.786-.216 1.622z";

type Size = "md" | "sm";

const SIZES: Record<
  Size,
  { circle: string; line: string; icon: string; wa: string }
> = {
  md: {
    circle: "h-14 w-14 sm:h-16 sm:w-16",
    line: "mt-[1.625rem] w-10 sm:mt-[1.875rem] sm:w-16",
    icon: "h-7 w-7 sm:h-8 sm:w-8",
    wa: "h-8 w-8 sm:h-9 sm:w-9",
  },
  sm: {
    circle: "h-12 w-12",
    line: "mt-[1.375rem] w-8",
    icon: "h-6 w-6",
    wa: "h-7 w-7",
  },
};

// Los 3 checkpoints (listo, activar acceso [llave], WhatsApp). Con labels muestra "Paso 1/2/3" debajo.
export default function GraciasCheckpoints({
  size = "md",
  labels = false,
  pausable = false,
  className = "",
}: {
  size?: Size;
  labels?: boolean;
  pausable?: boolean; // su pulso se pausa mientras el popup está abierto
  className?: string;
}) {
  const s = SIZES[size];
  const circle = `flex ${s.circle} items-center justify-center rounded-full`;
  const line = `h-1 ${s.line} shrink-0 rounded-full bg-purple-200`;
  const label =
    "text-xs font-bold uppercase tracking-wide text-purple-950/70 sm:text-sm";

  return (
    <div className={`flex items-start justify-center ${className}`}>
      <div className="flex flex-col items-center gap-1.5">
        <span
          className={`${circle} bg-emerald-500 text-3xl font-bold text-white shadow-lg shadow-emerald-500/30`}
        >
          ✓
        </span>
        {labels && <span className={label}>Paso 1</span>}
      </div>
      <span className={line} />
      <div className="flex flex-col items-center gap-1.5">
        <span
          className={`${circle} bg-purple-700 text-white shadow-lg shadow-purple-700/30`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={s.icon}
            aria-hidden="true"
          >
            <circle cx="8" cy="15" r="4" />
            <path d="m11 12 8-8" />
            <path d="m16 7 3 3" />
          </svg>
        </span>
        {labels && <span className={label}>Paso 2</span>}
      </div>
      <span className={line} />
      <div className="flex flex-col items-center gap-1.5">
        <span
          className={`${circle} ${pausable ? "page-anim" : ""} animate-[softPulse_1.8s_ease-in-out_infinite] bg-[#25D366] text-white`}
        >
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            className={s.wa}
            aria-hidden="true"
          >
            <path d={WHATSAPP_PATH} />
          </svg>
        </span>
        {labels && <span className={label}>Paso 3</span>}
      </div>
    </div>
  );
}
