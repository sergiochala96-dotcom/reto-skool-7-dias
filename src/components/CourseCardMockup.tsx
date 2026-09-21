"use client";

export default function CourseCardMockup({
  titulo,
  descripcion,
  onTituloChange,
  onDescripcionChange,
  locked = false,
}: {
  titulo: string;
  descripcion: string;
  onTituloChange?: (value: string) => void;
  onDescripcionChange?: (value: string) => void;
  locked?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Portada: placeholder decorativo lila, no editable */}
      <div className="relative h-44 w-full overflow-hidden bg-violet-100">
        <svg
          viewBox="0 0 400 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="400" height="160" fill="#EDE9FE" />
          <circle cx="55" cy="42" r="22" fill="#FFFFFF" fillOpacity="0.55" />
          <path
            d="M0,95 C70,45 140,145 210,95 C280,45 330,125 400,85 L400,160 L0,160 Z"
            fill="#DDD6FE"
          />
        </svg>
        <span className="absolute left-3 top-3 rounded-full bg-gray-700/80 px-3 py-1.5 text-xs font-bold text-white">
          Borrador
        </span>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500">
          ⋯
        </span>
      </div>

      {/* Contenido editable */}
      <div className="p-6">
        {locked ? (
          <>
            <p className="text-xl font-bold text-gray-900">
              {titulo || "Sin título todavía"}
            </p>
            <p className="mt-2 text-base font-light text-gray-500">
              {descripcion || "Complétalo en la sección Módulos"}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              🔒 Sincronizado con Módulos
            </p>
          </>
        ) : (
          <>
            <input
              value={titulo}
              maxLength={50}
              placeholder="Edita el Título"
              onChange={(e) => onTituloChange?.(e.target.value)}
              className="w-full border-none bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-400"
            />
            <textarea
              value={descripcion}
              maxLength={200}
              placeholder="Edita la descripción"
              onChange={(e) => onDescripcionChange?.(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-none border-none bg-transparent text-base font-light text-gray-500 outline-none placeholder:text-gray-400"
            />
            <p className="mt-2 text-right text-xs text-gray-400">
              {titulo.length}/50 · {descripcion.length}/200
            </p>
          </>
        )}
        <div className="mt-3 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
          0%
        </div>
      </div>
    </div>
  );
}
