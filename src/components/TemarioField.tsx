"use client";

import type { MissionField } from "@/lib/missionFields";
import { parseTemario, type CursoItem, type TemarioData } from "@/lib/missionFields";
import CourseCardMockup from "@/components/CourseCardMockup";

const MAX_CURSOS = 15;

const ORDINALES: Record<number, string> = {
  2: "segundo",
  3: "tercer",
  4: "cuarto",
  5: "quinto",
  6: "sexto",
  7: "séptimo",
  8: "octavo",
  9: "noveno",
  10: "décimo",
  11: "undécimo",
  12: "duodécimo",
  13: "decimotercer",
  14: "decimocuarto",
  15: "decimoquinto",
};

function emptyCurso(): CursoItem {
  return { titulo: "", descripcion: "", videos: [""] };
}

function VideoListEditor({
  videos,
  onChange,
}: {
  videos: string[];
  onChange: (videos: string[]) => void;
}) {
  const items = videos.length >= 1 ? videos : [""];

  const updateVideo = (i: number, text: string) => {
    const next = [...items];
    next[i] = text;
    onChange(next);
  };
  const addVideo = () => onChange([...items, ""]);
  const removeVideo = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <p className="mb-3 text-sm font-semibold text-gray-900">Videos de este curso</p>
      <div className="flex flex-1 flex-col gap-2">
        {items.map((video, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-fuchsia-500">•</span>
            <input
              value={video}
              placeholder="Ej: Bienvenida a la comunidad"
              onChange={(e) => updateVideo(i, e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-500"
            />
            {i >= 1 && (
              <button
                type="button"
                onClick={() => removeVideo(i)}
                aria-label="Quitar video"
                className="flex-shrink-0 rounded-lg px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addVideo}
        className="mt-3 text-left text-sm font-bold text-blue-600 hover:underline"
      >
        + Añadir Vídeo / Sección
      </button>
    </div>
  );
}

export default function TemarioField({
  field,
  value,
  onChange,
}: {
  field: MissionField;
  value: string | undefined;
  onChange: (id: string, value: string) => void;
}) {
  const data = parseTemario(value);
  const cursos = data.cursos ?? [];
  const items = cursos.length >= 1 ? cursos : [emptyCurso()];

  const commit = (next: CursoItem[]) => {
    const payload: TemarioData = { cursos: next };
    onChange(field.id, JSON.stringify(payload));
  };

  const updateCurso = (index: number, patch: Partial<CursoItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    commit(next);
  };

  const addCurso = () => {
    if (items.length >= MAX_CURSOS) return;
    commit([...items, emptyCurso()]);
  };

  const removeCurso = (index: number) => {
    commit(items.filter((_, i) => i !== index));
  };

  const nextOrdinal = ORDINALES[Math.min(items.length + 1, MAX_CURSOS)];

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{field.label}</label>
      {field.helper && <p className="mb-3 text-xs text-gray-500">{field.helper}</p>}

      <div className="flex flex-col gap-5">
        {items.map((curso, i) => (
          <div key={i} className="relative">
            {i > 0 && (
              <button
                type="button"
                onClick={() => removeCurso(i)}
                className="absolute -top-2 right-0 z-10 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-400 shadow transition hover:text-red-600"
              >
                ✕ Quitar curso
              </button>
            )}
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fuchsia-600">
              Curso {i + 1}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CourseCardMockup
                titulo={curso.titulo}
                descripcion={curso.descripcion}
                onTituloChange={(v) => updateCurso(i, { titulo: v })}
                onDescripcionChange={(v) => updateCurso(i, { descripcion: v })}
              />
              <VideoListEditor
                videos={curso.videos}
                onChange={(videos) => updateCurso(i, { videos })}
              />
            </div>
          </div>
        ))}
      </div>

      {items.length < MAX_CURSOS && (
        <button
          type="button"
          onClick={addCurso}
          className="mt-5 w-full rounded-xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 px-5 py-4 text-center text-sm font-bold text-fuchsia-700 transition hover:bg-fuchsia-100"
        >
          + Añadir {nextOrdinal} curso
        </button>
      )}

      <input type="hidden" name={`field_${field.id}`} value={JSON.stringify({ cursos: items })} />
    </div>
  );
}
