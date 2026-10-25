// Calendario del mes: marca con un chulito verde cada día en que se completó la trivia.
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function TriviaCalendar({
  today,
  completedDates,
}: {
  /** Día de juego de hoy, "AAAA-MM-DD" (el día cambia a las 6:00 a. m. de Colombia). */
  today: string;
  /** Fechas "AAAA-MM-DD" en las que la trivia quedó completada. */
  completedDates: string[];
}) {
  const [year, month, todayDay] = today.split("-").map(Number);
  const monthKey = today.slice(0, 7);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Lunes = 0 … domingo = 6: casillas vacías antes del día 1.
  const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const done = new Set(
    completedDates.filter((d) => d.startsWith(monthKey)).map((d) => Number(d.slice(8, 10)))
  );

  return (
    <section className="mt-8 rounded-3xl border-2 border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold text-white">Tu racha de trivias de este mes</h2>
        <span className="shrink-0 text-sm font-bold capitalize text-white/50">{MONTHS[month - 1]}</span>
      </div>
      <p className="mt-1 text-sm text-emerald-300">
        {done.size === 0
          ? "Completa la trivia de hoy para marcar tu primer día."
          : `${done.size} ${done.size === 1 ? "día completado" : "días completados"} este mes`}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((w) => (
          <span key={w} className="pb-0.5 text-center text-[11px] font-bold text-white/35">
            {w}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isDone = done.has(day);
          const isToday = day === todayDay;
          return (
            <span
              key={day}
              title={isDone ? `Día ${day}: trivia completada` : `Día ${day}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : day > todayDay
                  ? "bg-white/[0.03] text-white/20"
                  : "bg-white/[0.08] text-white/40"
              } ${isToday ? "ring-2 ring-fuchsia-400" : ""}`}
            >
              {isDone ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-label="Completada"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              ) : (
                day
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}
