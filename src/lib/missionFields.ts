export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "yesno"
  | "multiselect"
  | "list"
  | "range"
  | "prompt"
  | "link"
  | "info";

export type MissionField = {
  id: string;
  label: string;
  type: FieldType;
  helper?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  display?: "pills" | "dropdown";
  promptText?: string;
  infoText?: string;
  url?: string;
  buttonText?: string;
  maxLength?: number;
  minLines?: number;
  minSelect?: number;
  minItems?: number;
  maxItems?: number;
  itemPlaceholder?: string;
  itemMaxLength?: number;
  addLabel?: string;
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

const NICHOS = [
  { value: "aficiones", label: "🎨 Aficiones" },
  { value: "musica", label: "🎸 Música" },
  { value: "dinero", label: "💰 Dinero" },
  { value: "espiritualidad", label: "🕉️ Espiritualidad" },
  { value: "tecnologia", label: "💻 Tecnología" },
  { value: "salud", label: "🥕 Salud" },
  { value: "deportes", label: "🌐 Deportes" },
  { value: "superacion", label: "📊 Superación personal" },
  { value: "relaciones", label: "❤️ Relaciones" },
];

const NO_INFO_TYPES: FieldType[] = ["info", "prompt", "link"];

export const MISSION_SECTIONS: Record<number, MissionSection[]> = {
  1: [
    {
      id: "canal-audiencia",
      heading: "Tu canal y tu audiencia",
      fields: [
        {
          id: "canal_usuario",
          type: "text",
          label: "Tu usuario en tu canal preferido",
          placeholder: "@tu_usuario",
        },
        {
          id: "canal_seguidores",
          type: "text",
          label: "Seguidores o lista que tienes",
          placeholder: "Ej: 1.200 seguidores en Instagram + 300 en mi lista de email",
        },
      ],
    },
    {
      id: "nicho-avatar",
      heading: "Tu nicho y tu avatar",
      fields: [
        {
          id: "nicho",
          type: "select",
          display: "dropdown",
          label: "Escoge tu nicho",
          options: NICHOS,
        },
        {
          id: "avatar_genero",
          type: "select",
          display: "dropdown",
          label: "Identifica tu avatar",
          options: [
            { value: "hombres", label: "Hombres" },
            { value: "mujeres", label: "Mujeres" },
            { value: "ambos", label: "Ambos" },
          ],
        },
        {
          id: "edad",
          type: "range",
          label: "Rango de edades de tu avatar",
        },
      ],
    },
    {
      id: "problemas-deseos",
      heading: "Problemas y deseos de tu avatar",
      fields: [
        {
          id: "problemas_avatar",
          type: "list",
          label: "Problemas de tu avatar",
          helper: "Escribe mínimo 5",
          minItems: 5,
          addLabel: "+ Añadir problema",
          itemPlaceholder: "Ej: no sabe por dónde empezar",
        },
        {
          id: "deseos_avatar",
          type: "list",
          label: "Deseos de tu avatar",
          helper: "Escribe mínimo 5",
          minItems: 5,
          addLabel: "+ Añadir deseo",
          itemPlaceholder: "Ej: quiere generar ingresos extra",
        },
      ],
    },
    {
      id: "diferenciacion-oferta",
      heading: "Tu diferenciación y tu oferta",
      fields: [
        {
          id: "diferenciacion",
          type: "list",
          label: "¿Qué te diferencia?",
          helper: "Escribe mínimo 5",
          minItems: 5,
          addLabel: "+ Añadir diferencial",
        },
        {
          id: "oferta_grand_slam",
          type: "textarea",
          label: "Tu Oferta Grand Slam",
          helper: "Describe la oferta irresistible de tu comunidad",
        },
      ],
    },
  ],

  2: [
    {
      id: "crea-skool",
      heading: "Crea tu Skool",
      fields: [
        {
          id: "crear_skool_link",
          type: "link",
          label: "Crea tu Skool",
          helper: "Regístrate gratis con este enlace",
          url: "https://www.skool.com/signup?ref=182fe0d3c1db4272a1f3e479073168be",
          buttonText: "Crear mi Skool",
        },
        {
          id: "skool_creado",
          type: "yesno",
          label: "¿Ya creaste tu Skool?",
          options: SI_NO,
        },
      ],
    },
    {
      id: "identidad",
      heading: "Identidad de tu comunidad",
      fields: [
        {
          id: "nombre_comunidad",
          type: "text",
          label: "Nombre de la Comunidad",
          maxLength: 30,
        },
        {
          id: "descripcion_comunidad",
          type: "textarea",
          label: "Descripción de la Comunidad",
          maxLength: 150,
        },
        {
          id: "portada_link",
          type: "link",
          label: "Portada de la Comunidad",
          helper: "Plantilla lista para editar en Canva",
          url: "https://canva.link/k5fdlq8qn7tngni",
          buttonText: "🎨 Abrir plantilla de portada",
        },
        {
          id: "portada_hecha",
          type: "yesno",
          label: "¿Ya subiste tu portada?",
          options: SI_NO,
        },
        {
          id: "icono_link",
          type: "link",
          label: "Icono de la Comunidad",
          helper: "Plantilla lista para editar en Canva",
          url: "https://canva.link/0pxdupydxfx101n",
          buttonText: "🎨 Abrir plantilla de icono",
        },
        {
          id: "icono_hecho",
          type: "yesno",
          label: "¿Ya subiste tu icono?",
          options: SI_NO,
        },
      ],
    },
    {
      id: "categorias-reglas",
      heading: "Categorías y reglas",
      fields: [
        {
          id: "categorias",
          type: "list",
          label: "Planifica y configura las categorías",
          helper: "Escribe mínimo 3",
          minItems: 3,
          addLabel: "+ Añadir categoría",
        },
        {
          id: "reglas",
          type: "list",
          label: "Configura las reglas de tu comunidad",
          helper: "En total son 3, máximo 30 caracteres cada una",
          minItems: 3,
          maxItems: 3,
          itemMaxLength: 30,
          addLabel: "+ Añadir regla",
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
          type: "list",
          label: "¿Qué incluye cada plan?",
          helper: "Mínimo 5 cosas",
          minItems: 5,
          addLabel: "+ Añadir beneficio",
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
          type: "list",
          label: "3 a 5 cosas que ofreces por cada nivel",
          minItems: 3,
          addLabel: "+ Añadir beneficio",
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
          maxLength: 1000,
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
          type: "list",
          label: "Nombre de tus 9 niveles",
          helper: "Intenta que sea temático y personalizado para tu comunidad",
          minItems: 9,
          maxItems: 9,
          addLabel: "+ Añadir nivel",
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
          type: "list",
          label: "Escribe tu temario",
          helper: "Mínimo 2, máximo 15 módulos/cursos",
          minItems: 2,
          maxItems: 15,
          addLabel: "+ Añadir módulo/curso",
        },
        {
          id: "nombres_videos",
          type: "list",
          label: "Nombres de los videos dentro de cada módulo/curso",
          minItems: 1,
          addLabel: "+ Añadir video",
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

export function getFlatFields(day: number): MissionField[] {
  return flatFields(day);
}

const MULTI_VALUE_TYPES: FieldType[] = ["list", "multiselect", "range"];

export function isMultiValueField(field: MissionField): boolean {
  return MULTI_VALUE_TYPES.includes(field.type);
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

  if (field.type === "list") {
    const arr = Array.isArray(v) ? v : [];
    const filled = arr.filter((x) => x.trim().length > 0).length;
    return filled >= (field.minItems ?? 1);
  }

  if (field.type === "range") {
    const arr = Array.isArray(v) ? v : [];
    return arr.length === 2 && arr.every((x) => x.trim().length > 0);
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
    .filter((f) => !NO_INFO_TYPES.includes(f.type))
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
