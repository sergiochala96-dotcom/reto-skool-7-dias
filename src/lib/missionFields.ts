export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "yesno"
  | "multiselect"
  | "prompt"
  | "info";

export type MissionField = {
  id: string;
  label: string;
  type: FieldType;
  helper?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  promptText?: string;
  infoText?: string;
  minLines?: number;
  minSelect?: number;
  required?: boolean;
  showIf?: { field: string; equals: string };
};

export type MissionSection = {
  id: string;
  heading: string;
  fields: MissionField[];
};

const SI_NO = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

export const MISSION_SECTIONS: Record<number, MissionSection[]> = {
  1: [
    {
      id: "primeros-pasos",
      heading: "Primeros pasos",
      fields: [
        {
          id: "perfil_completo",
          type: "yesno",
          label: "¿Completaste tu perfil de Skool con foto y una frase que te represente?",
          options: SI_NO,
        },
        {
          id: "presentacion_hecha",
          type: "yesno",
          label: "¿Ya te presentaste en la comunidad contando qué quieres lograr en estos 7 días?",
          options: SI_NO,
        },
        {
          id: "meta_personal",
          type: "textarea",
          label: "Tu meta personal para el final del reto",
          helper: "¿Qué quieres haber logrado al terminar estos 7 días?",
        },
      ],
    },
  ],

  2: [
    {
      id: "categorias-reglas",
      heading: "Categorías y reglas",
      fields: [
        {
          id: "categorias",
          type: "textarea",
          label: "Categorías de tu comunidad",
          helper: "Escribe mínimo 3, una por línea",
          minLines: 3,
        },
        {
          id: "reglas",
          type: "textarea",
          label: "Reglas de tu comunidad",
          helper: "Escribe exactamente 3 reglas, máximo 30 caracteres cada una, una por línea",
          minLines: 3,
        },
      ],
    },
    {
      id: "monetizacion",
      heading: "Modelo de monetización",
      fields: [
        {
          id: "modelo",
          type: "select",
          label: "Elige tu modelo de monetización",
          options: [
            { value: "dos_comunidades", label: "Dos comunidades (gratis + pagada)" },
            { value: "freemium", label: "Freemium (1 plan gratis + planes de pago)" },
            { value: "pagada", label: "Comunidad 100% pagada" },
            { value: "gratis", label: "Acceso gratuito" },
          ],
        },
        {
          id: "nombres_comunidades",
          type: "text",
          label: "Nombre de tus 2 comunidades",
          helper: "Ej: 'Nombre Free' y 'Nombre Pro'",
          showIf: { field: "modelo", equals: "dos_comunidades" },
        },
        {
          id: "niveles_freemium",
          type: "select",
          label: "¿Cuántos niveles de pago tendrás además del gratis?",
          options: [
            { value: "2", label: "2 niveles" },
            { value: "3", label: "3 niveles" },
          ],
          showIf: { field: "modelo", equals: "freemium" },
        },
        {
          id: "contenido_planes",
          type: "textarea",
          label: "¿Qué incluye cada plan?",
          helper: "Mínimo 5 cosas por plan, una por línea",
          minLines: 5,
          showIf: { field: "modelo", equals: "freemium" },
        },
        {
          id: "tipo_cobro",
          type: "select",
          label: "¿Cómo vas a cobrar?",
          options: [
            { value: "unico", label: "Cobro único" },
            { value: "mensual", label: "Suscripción mensual" },
            { value: "anual", label: "Suscripción anual" },
            { value: "ambos", label: "Mensual y anual" },
            { value: "niveles", label: "Diferentes niveles" },
          ],
          showIf: { field: "modelo", equals: "pagada" },
        },
        {
          id: "beneficios_niveles",
          type: "textarea",
          label: "3 a 5 cosas que ofreces por cada nivel",
          helper: "Una por línea",
          minLines: 3,
          showIf: { field: "tipo_cobro", equals: "niveles" },
        },
        {
          id: "prueba_gratis",
          type: "yesno",
          label: "¿Tendrás prueba gratis de 7 días?",
          options: SI_NO,
          showIf: { field: "modelo", equals: "pagada" },
        },
      ],
    },
  ],

  3: [
    {
      id: "presentacion",
      heading: "Presentación",
      fields: [
        {
          id: "video_prompt",
          type: "prompt",
          label: "Prompt para crear tu video VSL (3 min)",
          promptText:
            "Actúa como guionista experto en video sales letters (VSL). Escribe el guion de un video de presentación de 3 minutos para mi comunidad de Skool, con esta estructura: 1) Intro que capte la atención, 2) Muestra la comunidad por dentro paso a paso (cursos, calendario, clases en vivo, comunidad), 3) Genera autoridad, 4) Crea urgencia/escasez, 5) Cierra con un llamado a la acción claro. Mi comunidad es sobre: [describe tu nicho aquí].",
        },
        {
          id: "video_imagenes_hecho",
          type: "yesno",
          label: "¿Ya tienes tu video o imágenes de presentación listos?",
          helper:
            "Las imágenes deben mostrar: cursos por dentro, interacción de miembros, calendario, clases en vivo, herramientas de apoyo y testimonios.",
          options: SI_NO,
        },
      ],
    },
    {
      id: "descripcion",
      heading: "Descripción",
      fields: [
        {
          id: "descripcion_prompt",
          type: "prompt",
          label: "Prompt para tu descripción (máx. 1.000 caracteres)",
          promptText:
            "Escribe la descripción de mi comunidad de Skool en máximo 1000 caracteres. Debe incluir: a quién ayudo, qué problema resuelvo, qué encontrarán dentro (cursos, comunidad, calendario, niveles) y por qué deberían unirse ahora. Mi nicho es: [describe tu nicho aquí]. Tono: cercano y motivador.",
        },
        {
          id: "descripcion_texto",
          type: "textarea",
          label: "Pega aquí tu descripción final",
          helper: "Máximo 1.000 caracteres",
        },
      ],
    },
    {
      id: "resenas",
      heading: "Reseñas",
      fields: [
        {
          id: "resenas_info",
          type: "info",
          label: "Cómo funcionan las reseñas en Skool",
          infoText:
            "Solo las personas que lleven mínimo 1 mes dentro y sean usuarios pagados podrán dejarte una reseña pública en tu Skool.",
        },
      ],
    },
  ],

  4: [
    {
      id: "post-bienvenida",
      heading: "Post fijado de bienvenida",
      fields: [
        { id: "post_titulo", type: "text", label: "Título del post de bienvenida" },
        {
          id: "post_texto",
          type: "textarea",
          label: "Texto del post",
          helper: "Explica cómo empezar (onboarding)",
        },
        {
          id: "post_media",
          type: "yesno",
          label: "¿Agregaste una imagen, GIF o video al post?",
          options: SI_NO,
        },
        { id: "post_categoria", type: "text", label: "Categoría seleccionada para el post" },
        {
          id: "post_publicado",
          type: "yesno",
          label: "¿Ya publicaste y fijaste el post?",
          options: SI_NO,
        },
      ],
    },
    {
      id: "calendario",
      heading: "Calendario",
      fields: [
        {
          id: "clases_en_vivo",
          type: "yesno",
          label: "¿Harás clases en vivo?",
          helper: "Se recomienda que sí",
          options: SI_NO,
        },
        {
          id: "frecuencia_clases",
          type: "select",
          label: "Frecuencia de tus clases en vivo",
          options: [
            { value: "semanal", label: "Semanal" },
            { value: "quincenal", label: "Quincenal" },
            { value: "mensual", label: "Mensual" },
          ],
          showIf: { field: "clases_en_vivo", equals: "si" },
        },
      ],
    },
    {
      id: "niveles",
      heading: "Clasificación (niveles)",
      fields: [
        {
          id: "niveles_nombres",
          type: "textarea",
          label: "Nombre de tus 9 niveles",
          helper: "Escribe uno por línea. Intenta que sea temático y personalizado para tu comunidad",
          minLines: 9,
        },
        {
          id: "niveles_premios",
          type: "yesno",
          label: "¿Los miembros podrán desbloquear premios al subir de nivel?",
          options: SI_NO,
        },
        {
          id: "niveles_premios_tipo",
          type: "textarea",
          label: "¿Qué tipo de premios?",
          showIf: { field: "niveles_premios", equals: "si" },
        },
      ],
    },
  ],

  5: [
    {
      id: "modulos",
      heading: "Módulos",
      fields: [
        {
          id: "modulo1_titulo",
          type: "text",
          label: "Módulo 1 — Título",
          helper: "Ej: Módulo de bienvenida",
        },
        { id: "modulo1_descripcion", type: "textarea", label: "Módulo 1 — Descripción" },
        {
          id: "modulo1_portada",
          type: "yesno",
          label: "Módulo 1 — ¿Ya tienes la portada lista?",
          options: SI_NO,
        },
        {
          id: "modulo2_titulo",
          type: "text",
          label: "Módulo 2 — Título",
          helper: "Ej: Módulo de contenido",
        },
        { id: "modulo2_descripcion", type: "textarea", label: "Módulo 2 — Descripción" },
        {
          id: "modulo2_portada",
          type: "yesno",
          label: "Módulo 2 — ¿Ya tienes la portada lista?",
          options: SI_NO,
        },
      ],
    },
    {
      id: "temario",
      heading: "Temario",
      fields: [
        {
          id: "temario_prompt",
          type: "prompt",
          label: "Prompt para estructurar tu temario con IA",
          promptText:
            "Ayúdame a estructurar el temario de mi curso/comunidad. Mi método de enseñanza consiste en: [describe tu método]. Dime cuántos módulos o cursos debería tener (entre 2 y 15) y qué debería enseñar en cada uno, ordenado de lo más básico a lo más avanzado.",
        },
        {
          id: "temario_lista",
          type: "textarea",
          label: "Escribe tu temario",
          helper: "Mínimo 2, máximo 15 módulos/cursos, uno por línea",
          minLines: 2,
        },
        {
          id: "nombres_videos",
          type: "textarea",
          label: "Nombres de los videos dentro de cada módulo/curso",
          helper: "Uno por línea",
        },
        {
          id: "modulos_subidos",
          type: "yesno",
          label: "¿Ya subiste los dos primeros módulos con al menos 1 video cada uno?",
          options: SI_NO,
        },
      ],
    },
  ],

  6: [
    {
      id: "invitaciones",
      heading: "Invitaciones",
      fields: [
        {
          id: "personas_invitadas",
          type: "number",
          label: "¿Cuántas personas has invitado?",
          helper: "Mínimo 5 (puedes invitar gratis si es necesario)",
        },
        {
          id: "canales_invitacion",
          type: "multiselect",
          label: "¿Por dónde los invitaste?",
          options: [
            { value: "historias", label: "Historias" },
            { value: "estados", label: "Estados" },
            { value: "grupos", label: "Grupos" },
            { value: "carruseles", label: "Carruseles" },
            { value: "reels", label: "Reels" },
            { value: "emails", label: "Emails" },
          ],
        },
        {
          id: "en_vivo_hecho",
          type: "yesno",
          label: "¿Hiciste un En Vivo para mostrar la comunidad e invitar personas?",
          options: SI_NO,
        },
      ],
    },
    {
      id: "email",
      heading: "Email",
      fields: [
        {
          id: "email_prompt",
          type: "prompt",
          label: "Prompt para tu email de invitación",
          promptText:
            "Escribe un email para invitar a mi lista de contactos a unirse a mi comunidad de Skool. Debe aportar valor, generar curiosidad y terminar con un llamado a la acción claro. Mi comunidad es sobre: [describe tu nicho].",
        },
        {
          id: "email_enviado",
          type: "yesno",
          label: "¿Ya enviaste el email a tu lista?",
          options: SI_NO,
        },
      ],
    },
    {
      id: "boost",
      heading: "Skool Boost",
      fields: [
        {
          id: "boost_activado",
          type: "yesno",
          label: "¿Activarás el Descubrimiento de Skool Boost?",
          options: SI_NO,
        },
        {
          id: "boost_nivel",
          type: "select",
          label: "¿Qué nivel de comisión definirás?",
          options: [
            { value: "off", label: "OFF" },
            { value: "30", label: "30%" },
            { value: "40", label: "40%" },
            { value: "50", label: "50%" },
            { value: "60", label: "60%" },
            { value: "70", label: "70%" },
          ],
          showIf: { field: "boost_activado", equals: "si" },
        },
      ],
    },
  ],

  7: [
    {
      id: "ritmo",
      heading: "Ritmo de publicación",
      fields: [
        {
          id: "frecuencia_min",
          type: "text",
          label: "Frecuencia mínima de publicación",
          placeholder: "Ej: 3 veces por semana",
        },
        {
          id: "frecuencia_max",
          type: "text",
          label: "Frecuencia máxima de publicación",
          placeholder: "Ej: 1 vez al día",
        },
      ],
    },
    {
      id: "contenido",
      heading: "Contenido y conversación",
      fields: [
        {
          id: "tematicas",
          type: "textarea",
          label: "¿Qué temáticas publicarás?",
          helper: "Una por línea",
        },
        {
          id: "como_conversacion",
          type: "textarea",
          label: "¿Cómo crearás conversación en tus publicaciones?",
        },
      ],
    },
    {
      id: "dinamicas",
      heading: "Dinámicas y retos",
      fields: [
        {
          id: "dinamicas",
          type: "yesno",
          label: "¿Harás dinámicas o retos semanales/mensuales?",
          options: SI_NO,
        },
        {
          id: "dinamicas_detalle",
          type: "textarea",
          label: "Cuéntanos brevemente qué tipo de dinámicas o retos",
          showIf: { field: "dinamicas", equals: "si" },
        },
      ],
    },
  ],
};

export function getMissionSections(day: number): MissionSection[] {
  return MISSION_SECTIONS[day] ?? [];
}

function flatFields(day: number): MissionField[] {
  return getMissionSections(day).flatMap((s) => s.fields);
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

function isVisible(field: MissionField, answers: Answers): boolean {
  if (!field.showIf) return true;
  return answers[field.showIf.field] === field.showIf.equals;
}

function isAnswered(field: MissionField, answers: Answers): boolean {
  const v = answers[field.id];
  if (field.type === "multiselect") {
    const arr = Array.isArray(v) ? v : [];
    return arr.length >= (field.minSelect ?? 1);
  }
  if (field.type === "select" || field.type === "yesno") {
    return typeof v === "string" && v.length > 0;
  }
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return false;
  if (field.minLines) {
    const lines = s
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length >= field.minLines;
  }
  return true;
}

function requiredVisibleFields(day: number, answers: Answers): MissionField[] {
  return flatFields(day)
    .filter((f) => f.type !== "info" && f.type !== "prompt")
    .filter((f) => f.required !== false)
    .filter((f) => isVisible(f, answers));
}

export function getMissingRequiredFieldIds(day: number, answers: Answers): string[] {
  return requiredVisibleFields(day, answers)
    .filter((f) => !isAnswered(f, answers))
    .map((f) => f.id);
}

export function countRequiredFields(
  day: number,
  answers: Answers
): { total: number; done: number } {
  const required = requiredVisibleFields(day, answers);
  const done = required.filter((f) => isAnswered(f, answers)).length;
  return { total: required.length, done };
}
