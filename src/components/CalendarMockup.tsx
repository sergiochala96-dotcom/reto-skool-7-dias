const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
// Cuadrícula estática de ejemplo (no depende de la fecha real): solo es
// decorativa, para mostrar cómo se vería el calendario de tu Skool.
const WEEKS = [
  [null, null, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, null, null, null],
];
const LIVE_DAYS = new Set([9, 16, 23]);

export default function CalendarMockup() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Calendario</span>
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="h-2 w-2 rounded-full bg-fuchsia-500" /> Clase en vivo
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400">
        {DAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {WEEKS.flat().map((day, i) => (
          <div
            key={i}
            className={`flex h-8 items-center justify-center rounded-lg text-xs ${
              day === null
                ? ""
                : LIVE_DAYS.has(day)
                ? "bg-fuchsia-500 font-bold text-white"
                : "text-gray-600"
            }`}
          >
            {day ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
