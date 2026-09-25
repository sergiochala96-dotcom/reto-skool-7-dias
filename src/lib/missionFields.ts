export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "yesno"
  | "multiselect"
  | "list"
  | "range"
  | "slider"
  | "pricing"
  | "bonos"
  | "terminos"
  | "modulos"
  | "temario"
  | "prompt"
  | "link"
  | "check"
  | "info";

export type MissionField = {
  id: string;
  label: string;
  type: FieldType;
  helper?: string;
  placeholder?: string;
  options?: { value: string; label: string; description?: string; icon?: string }[];
  display?: "pills" | "dropdown" | "icon-cards" | "boxes";
  inlineBadge?: boolean;
  confirm?: { id: string; label: string };
  promptText?: string;
  /** Para campos "prompt": inputs editables que el usuario llena y que reemplazan los {{id}} dentro de promptText. */
  promptVars?: { id: string; label: string; placeholder: string }[];
  infoText?: string;
  url?: string;
  buttonText?: string;
  emphasis?: boolean;
  maxLength?: number;
  minLines?: number;
  minSelect?: number;
  minItems?: number;
  maxItems?: number;
  itemPlaceholder?: string;
  itemPlaceholders?: string[];
  itemMaxLength?: number;
  /** Para campos "list": chips de ejemplo no clicables que se muestran arriba de las cajas de texto, para inspirar. */
  examples?: string[];
  addLabel?: string;
  badgeLabel?: string;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  moodMap?: { max: number; emoji: string; text: string; color: "red" | "orange" | "green" }[];
  required?: boolean;
  showIf?: { field: string; equals: string };
  syncTitlesFrom?: string;
  /** Para campos "yesno": si eligen la opción "no", muestra un popup con este mensaje y un botón de WhatsApp. No bloquea la respuesta. */
  noPopup?: { message: string; whatsappUrl: string; buttonLabel: string };
};

export type MissionSection = {
  id: string;
  heading: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePosition?: "above-heading" | "below-heading";
  layout?: "default" | "split-calendar";
  fields: MissionField[];
  /** Skooly + globo de texto diciendo qué hacer en este paso (solo en modo paso a paso). */
  mascot?: string;
  /** Si se define, la mascota se muestra justo después de este campo en vez de arriba de la sección. */
  mascotAfterField?: string;
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
      id: "canal",
      heading: "Tu canal y tu audiencia",
      mascot: "/mascota-canal.png",
      fields: [
        {
          id: "red_favorita",
          type: "select",
          display: "icon-cards",
          label: "Tu red social principal",
          options: [
            { value: "instagram", label: "Instagram", icon: "instagram" },
            { value: "youtube", label: "YouTube", icon: "youtube" },
            { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
            { value: "tiktok", label: "TikTok", icon: "tiktok" },
            { value: "facebook", label: "Facebook", icon: "facebook" },
            { value: "email", label: "Email", icon: "email" },
            { value: "otra", label: "Otra", icon: "otra" },
          ],
        },
      ],
    },
    {
      id: "usuario",
      heading: "Tu usuario",
      mascot: "/mascota-usuario.png",
      fields: [
        {
          id: "canal_usuario",
          type: "text",
          label: "Tu usuario en tu canal preferido",
          placeholder: "@tu_usuario",
          inlineBadge: true,
          badgeLabel: "Tu Usuario:",
        },
      ],
    },
    {
      id: "seguidores",
      heading: "Tus seguidores",
      mascot: "/mascota-seguidores.png",
      fields: [
        {
          id: "canal_seguidores",
          type: "select",
          display: "boxes",
          label: "Seguidores o lista que tienes",
          options: [
            { value: "0-100", label: "0-100 seguidores" },
            { value: "100-1000", label: "100 - 1.000 seguidores" },
            { value: "1000-10000", label: "1.000 - 10.000 seguidores" },
            { value: "10000-100000", label: "10.000 - 100.000 seguidores" },
            { value: "100000+", label: "Más de 100.000 seguidores" },
          ],
        },
      ],
    },
    {
      id: "nicho",
      heading: "Tu nicho",
      mascot: "/mascota-nicho.png",
      fields: [
        {
          id: "nicho",
          type: "select",
          display: "dropdown",
          label: "Escoge tu nicho",
          options: NICHOS,
        },
      ],
    },
    {
      id: "avatar",
      heading: "Tu avatar",
      mascot: "/mascota-avatar.png",
      fields: [
        {
          id: "avatar_genero",
          type: "select",
          display: "icon-cards",
          label: "Identifica tu avatar",
          options: [
            { value: "hombres", label: "Hombres", icon: "hombre" },
            { value: "mujeres", label: "Mujeres", icon: "mujer" },
            { value: "ambos", label: "Ambos", icon: "ambos" },
          ],
        },
        {
          id: "edad",
          type: "multiselect",
          label: "Rango de edades de tu avatar",
          helper: "Selecciona una o varias",
          options: [
            { value: "18-24", label: "18-24 años" },
            { value: "25-34", label: "25-34 años" },
            { value: "35-44", label: "35-44 años" },
            { value: "45-54", label: "45-54 años" },
            { value: "55-65", label: "55-65 años" },
            { value: "65+", label: "65+ Años" },
          ],
        },
      ],
    },
    {
      id: "problemas",
      heading: "Problemas de tu avatar",
      mascot: "/mascota-problemas.png",
      fields: [
        {
          id: "problemas_prompt",
          type: "prompt",
          label: "Prompt para encontrar los problemas de tu avatar",
          promptText:
            "Actúa como un experto en investigación de audiencias y marketing digital.\n\nMi nicho es: {{nicho}}\n\nAyúdame a identificar los 10 problemas, frustraciones y dolores más comunes que enfrenta mi avatar ideal dentro de este nicho, antes de encontrar una solución.\n\nPara cada problema:\n- Descríbelo en una frase clara y directa.\n- Explica brevemente por qué le duele.\n- Explica qué consecuencia le genera en su día a día si no lo resuelve.\n\nPresenta la respuesta en una lista numerada del 1 al 10, con lenguaje sencillo, como si se lo estuvieras explicando a la propia persona.",
          promptVars: [
            { id: "nicho", label: "Tu nicho", placeholder: "Ej: fitness para mujeres 40+" },
          ],
        },
        {
          id: "problemas_avatar",
          type: "list",
          label: "Problemas de tu avatar",
          helper: "Escribe mínimo 3",
          minItems: 3,
          addLabel: "+ Añadir problema",
          itemPlaceholder: "Ej: no sabe por dónde empezar",
          badgeLabel: "Problema",
          examples: [
            "No sabe por dónde empezar",
            "Se siente abrumado con tanta información gratis y contradictoria",
          ],
        },
      ],
    },
    {
      id: "deseos",
      heading: "Deseos de tu avatar",
      mascot: "/mascota-deseos.png",
      fields: [
        {
          id: "deseos_prompt",
          type: "prompt",
          label: "Prompt para encontrar los deseos de tu avatar",
          promptText:
            "Actúa como un experto en investigación de audiencias y marketing digital.\n\nMi nicho es: {{nicho}}\n\nAyúdame a identificar los 10 deseos, sueños y resultados que más anhela mi avatar ideal dentro de este nicho, es decir, en qué le gustaría convertirse o qué le gustaría lograr en su vida o negocio.\n\nPara cada deseo:\n- Descríbelo en una frase clara y directa.\n- Explica por qué es importante para esa persona.\n- Explica cómo se sentiría al lograrlo.\n\nPresenta la respuesta en una lista numerada del 1 al 10, con lenguaje claro y motivador.",
          promptVars: [
            { id: "nicho", label: "Tu nicho", placeholder: "Ej: fitness para mujeres 40+" },
          ],
        },
        {
          id: "deseos_avatar",
          type: "list",
          label: "Deseos de tu avatar",
          helper: "Escribe mínimo 3",
          minItems: 3,
          addLabel: "+ Añadir deseo",
          itemPlaceholder: "Ej: quiere generar ingresos extra",
          badgeLabel: "Deseo",
          examples: [
            "Quiere generar ingresos extra sin renunciar a su trabajo actual",
            "Quiere sentirse parte de una comunidad que lo entienda",
          ],
        },
      ],
    },
    {
      id: "diferenciacion-bonos",
      heading: "Diferenciación y Bonos",
      mascot: "/mascota-diferenciacion-bonos.png",
      fields: [
        {
          id: "diferenciacion",
          type: "list",
          label: "¿Qué te diferencia?",
          helper: "Escribe mínimo 3",
          minItems: 3,
          addLabel: "+ Añadir diferencial",
          badgeLabel: "Diferencia",
          examples: [
            "Acompañamiento personalizado, no solo contenido grabado",
            "Resultados comprobados con casos reales de otros alumnos",
          ],
        },
        {
          id: "oferta_bonos",
          type: "bonos",
          label: "Bonos de tu Oferta Grand Slam",
          helper: "Describe la oferta irresistible de tu comunidad",
        },
      ],
    },
    {
      id: "garantia-escasez-urgencia",
      heading: "Garantía, Escasez y Urgencia",
      mascot: "/mascota-garantia-escasez-urgencia.png",
      fields: [
        {
          id: "oferta_terminos",
          type: "terminos",
          label: "Garantía, escasez y urgencia de tu oferta",
          helper: "Termina de armar tu Oferta Grand Slam",
        },
      ],
    },
  ],

  2: [
    {
      id: "crea-skool",
      heading: "Crea tu Skool",
      mascot: "/mascota-crea-skool.png",
      mascotAfterField: "crear_skool_link",
      image: "/skool-ejemplo-cta.png",
      imageWidth: 1369,
      imageHeight: 825,
      fields: [
        {
          id: "crear_skool_link",
          type: "link",
          label: "Crea tu Skool",
          helper: "Regístrate gratis con este enlace",
          url: "https://www.skool.com/signup?ref=182fe0d3c1db4272a1f3e479073168be",
          buttonText: "Crear mi Skool",
          emphasis: true,
        },
        {
          id: "skool_creado",
          type: "yesno",
          label: "¿Ya creaste tu Skool?",
          options: SI_NO,
          noPopup: {
            message:
              "Aún no te sientes seguro creando tu Skool. ¿Tienes dudas? Ponte en contacto con Sergio y su equipo para ayudarte a resolver esas dudas.",
            whatsappUrl:
              "https://api.whatsapp.com/send?phone=573015144829&text=Hola%20Sergio%20y%20equipo,%20quiero%20info%20de%20como%20crear%20mi%20Skool,%20a%C3%BAn%20tengo%20dudas...",
            buttonLabel: "Quiero info sobre Skool",
          },
        },
      ],
    },
    {
      id: "identidad",
      heading: "Identidad de tu comunidad",
      mascot: "/mascota-identidad.png",
      image: "/skool-ejemplo-identidad.png",
      imageWidth: 1091,
      imageHeight: 280,
      fields: [
        {
          id: "nombre_comunidad_prompt",
          type: "prompt",
          label: "Prompt para inspirarte con el nombre",
          promptText:
            "Actúa como un experto en branding y naming.\n\nMi nicho es: {{nicho}}\n\nAyúdame a generar 15 ideas de nombres para mi comunidad en Skool. Los nombres deben:\n- Ser cortos (máximo 3 palabras).\n- Ser fáciles de recordar y pronunciar.\n- Transmitir pertenencia y resultado, no solo el tema.\n- No sonar genéricos ni copiar marcas ya conocidas.\n\nOrganiza las 15 ideas en 3 grupos de 5: nombres directos (dicen el resultado), nombres aspiracionales (dicen la transformación) y nombres con personaje o apodo propio.",
          promptVars: [
            { id: "nicho", label: "Tu nicho", placeholder: "Ej: fitness para mujeres 40+" },
          ],
        },
        {
          id: "nombre_comunidad",
          type: "text",
          label: "Nombre de la Comunidad",
          maxLength: 30,
        },
        {
          id: "descripcion_comunidad_prompt",
          type: "prompt",
          label: "Prompt para escribir tu descripción",
          promptText:
            "Actúa como un copywriter experto en páginas de venta.\n\nMi nicho es: {{nicho}}\n\nEscribe 5 opciones de descripción para mi comunidad en Skool, de máximo 150 caracteres cada una.\n\nCada opción debe:\n- Comunicar con claridad la promesa principal (el resultado que la persona va a lograr).\n- Generar curiosidad para que quiera unirse.\n- Usar un tono cercano y directo, sin tecnicismos.\n\nIndica el conteo de caracteres al lado de cada opción.",
          promptVars: [
            { id: "nicho", label: "Tu nicho", placeholder: "Ej: fitness para mujeres 40+" },
          ],
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
          confirm: { id: "portada_hecha", label: "Ya subí mi portada" },
        },
        {
          id: "icono_link",
          type: "link",
          label: "Icono de la Comunidad",
          helper: "Plantilla lista para editar en Canva",
          url: "https://canva.link/0pxdupydxfx101n",
          buttonText: "🎨 Abrir plantilla de icono",
          confirm: { id: "icono_hecho", label: "Ya subí mi ícono" },
        },
      ],
    },
    {
      id: "categorias",
      heading: "Categorías",
      mascot: "/mascota-categorias.png",
      fields: [
        {
          id: "categorias",
          type: "list",
          label: "Planifica y configura las categorías",
          helper: "Escribe mínimo 3",
          minItems: 3,
          addLabel: "+ Añadir categoría",
          badgeLabel: "Categoría",
          itemPlaceholders: ["Ejemplo: Preséntate", "Ejemplo: Victorias", "Ejemplo: Comunicados"],
        },
      ],
    },
    {
      id: "reglas",
      heading: "Reglas",
      mascot: "/mascota-reglas.png",
      fields: [
        {
          id: "reglas",
          type: "list",
          label: "Configura las reglas de tu comunidad",
          helper: "En total son 3, máximo 30 caracteres cada una",
          minItems: 3,
          maxItems: 3,
          itemMaxLength: 30,
          addLabel: "+ Añadir regla",
          badgeLabel: "Regla",
          itemPlaceholders: [
            "Ejemplo: Sé positivo",
            "Ejemplo: No auto promociones / No Spam",
            "Ejemplo: Asiste a las clases en vivo",
          ],
        },
      ],
    },
    {
      id: "monetizacion",
      heading: "Modelo de monetización",
      mascot: "/mascota-monetizacion.png",
      fields: [
        {
          id: "monetizacion_modelo",
          type: "pricing",
          label: "Elige tu modelo de monetización",
        },
      ],
    },
  ],

  3: [
    {
      id: "presentacion",
      heading: "Presentación",
      mascot: "/mascota-presentacion.png",
      mascotAfterField: "video_prompt",
      image: "/skool-ejemplo-about.png",
      imageWidth: 1080,
      imageHeight: 1080,
      imagePosition: "above-heading",
      fields: [
        {
          id: "video_prompt",
          type: "prompt",
          label: "Prompt para crear tu video VSL (2 a 5 min)",
          promptText:
            "Actúa como guionista experto en video sales letters (VSL) para comunidades online. Escribe el guion completo de un video de presentación de entre 2 y 5 minutos para mi comunidad de Skool. El objetivo del video es enseñar la comunidad por dentro para reducir el sentimiento de riesgo de quien está dudando en unirse. Usa esta estructura:\n\n1) Introducción breve: da contexto de lo que van a ver y recuerda la promesa principal de mi comunidad.\n2) Destripe de la comunidad paso a paso: muestra TODA la comunidad por dentro — la interacción y preguntas de los miembros, todos los cursos que hay, el calendario de clases en vivo, y los recursos/herramientas disponibles. Esta es la parte más importante del video: la objeción #1 de quien duda es no saber qué se va a encontrar adentro.\n3) Autoridad: habla de los resultados o testimonios que respaldan que el método funciona y que puedo llevarlos de A a B.\n4) Urgencia y escasez: explica por qué deberían entrar ahora y no la próxima semana (ej: el precio va a subir pronto, los cupos son limitados, o es por tiempo limitado). Aclara que quien entra ahora mantiene ese precio de por vida mientras siga dentro.\n5) Llamado a la acción final: explica el paso a paso exacto para unirse (dónde dar clic, cómo crear la cuenta, cómo pagar), recordando la promesa y qué van a lograr si entran. Deja claro que no tienen nada que perder porque siempre pueden cancelar y no se les vuelve a cobrar.\n\nMi comunidad es sobre: [describe tu nicho aquí].",
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
      mascot: "/mascota-descripcion.png",
      fields: [
        {
          id: "descripcion_prompt",
          type: "prompt",
          label: "Prompt para tu descripción (500 a 1.000 caracteres)",
          promptText:
            "Actúa como copywriter experto en descripciones de comunidades de Skool que convierten. Escribe la descripción de mi comunidad en español, de entre 500 y 1000 caracteres en total, como un texto fluido (sin poner números ni títulos de cada parte), siguiendo esta estructura de 8 partes:\n\n1) Título llamativo: una frase poderosa que capture atención al toque, con emojis o símbolos (✅🚀🔥), prometiendo un beneficio claro o una transformación. Ej: '🛡️ La Comunidad #1 para [Avatar/Nicho] que quiere [Gran Beneficio Prometido]'.\n2) Oferta especial limitada (urgencia + escasez): usa frases como 'solo hasta [fecha]' o 'solo X plazas', y menciona que el precio actual será de por vida si entran ahora. Esto genera FOMO.\n3) Beneficio principal: en 1 o 2 líneas, lo más potente que van a lograr, enfocado en el resultado deseado, no en el proceso.\n4) Lista detallada de lo que incluye: 5 a 7 beneficios concretos con bullets, cada uno con un emoji y su valor aproximado si se puede, para aumentar el valor percibido.\n5) Valor total percibido vs. precio actual: muestra cuánto valdría todo junto comparado con lo que cuesta entrar (idealmente un precio ridículamente bajo frente al valor).\n6) Llamada a la acción clara: di exactamente qué hacer y cómo, paso a paso simple.\n7) Garantía o cancelación simple: remarca que no hay riesgo, frases como 'cancelá cuando quieras' funcionan muy bien.\n8) Cierre emocional y cercano: termina con una frase amistosa que invite a unirse.\n\nMi nicho es: [describe tu nicho aquí]. Tono: cercano y motivador.",
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
      mascot: "/mascota-resenas.png",
      fields: [
        {
          id: "resenas_info",
          type: "info",
          label: "Cómo funcionan las reseñas en Skool",
          infoText:
            "Solo las personas que lleven mínimo 1 mes dentro y sean usuarios pagados podrán dejarte una reseña pública en tu Skool.",
        },
        {
          id: "resenas_entendido",
          type: "yesno",
          label: "¿Entendiste cómo funcionan las reseñas?",
          options: SI_NO,
        },
      ],
    },
  ],

  4: [
    {
      id: "post-bienvenida",
      heading: "Post fijado de bienvenida",
      mascot: "/mascota-post-bienvenida.png",
      image: "/skool-ejemplo-post.png",
      imageWidth: 993,
      imageHeight: 621,
      imagePosition: "above-heading",
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
          type: "select",
          display: "boxes",
          label: "¿Agregaste una imagen, GIF o video al post?",
          options: [
            { value: "foto", label: "Foto" },
            { value: "video", label: "Video" },
            { value: "gif", label: "GIF" },
            { value: "nada", label: "Nada" },
          ],
        },
        { id: "post_categoria", type: "text", label: "Escribe la categoría del post" },
        {
          id: "post_publicado",
          type: "check",
          label: "¿Ya publicaste y fijaste el post?",
        },
      ],
    },
    {
      id: "calendario",
      heading: "Calendario",
      mascot: "/mascota-calendario.png",
      layout: "split-calendar",
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
      mascot: "/mascota-niveles.png",
      fields: [
        {
          id: "niveles_nombres",
          type: "list",
          label: "Nombre de tus 9 niveles",
          helper: "Intenta que sea temático y personalizado para tu comunidad",
          minItems: 9,
          maxItems: 9,
          badgeLabel: "Nivel",
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
      mascot: "/mascota-modulos.png",
      fields: [
        {
          id: "portadas_modulos_link",
          type: "link",
          label: "Plantilla de portadas para tus módulos",
          helper: "Plantilla lista para editar en Canva",
          url: "https://canva.link/geob0uij4tnruda",
          buttonText: "🎨 Abrir plantilla de portadas",
        },
        {
          id: "modulos_preview",
          type: "modulos",
          label: "Tus primeros 2 módulos",
          helper: "Así se verían dentro de tu Skool. Edita el título (máx. 50) y la descripción (máx. 200) de cada uno.",
        },
      ],
    },
    {
      id: "temario",
      heading: "Temario",
      mascot: "/mascota-temario.png",
      fields: [
        {
          id: "temario_prompt",
          type: "prompt",
          label: "Prompt para estructurar tu temario con IA",
          promptText:
            "Ayúdame a estructurar el temario de mi curso/comunidad. Mi método de enseñanza consiste en: [describe tu método]. Dime cuántos módulos o cursos debería tener (entre 2 y 15) y qué debería enseñar en cada uno, ordenado de lo más básico a lo más avanzado.",
        },
        {
          id: "temario_cursos",
          type: "temario",
          label: "Escribe tu temario",
          helper: "Mínimo 2, máximo 15 módulos/cursos. Cada uno con su lista de videos.",
          syncTitlesFrom: "modulos_preview",
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
      mascot: "/mascota-invitaciones.png",
      fields: [
        {
          id: "personas_invitadas",
          type: "slider",
          label: "¿Cuántas personas has invitado?",
          helper: "Arrastra el punto (puedes invitar gratis si es necesario)",
          sliderMin: 1,
          sliderMax: 20,
          sliderStep: 1,
          sliderUnit: "personas",
        },
        {
          id: "canales_invitacion",
          type: "multiselect",
          label: "¿Por dónde los invitaste?",
          options: [
            { value: "historias", label: "Historias", icon: "historias" },
            { value: "estados", label: "Estados", icon: "estados" },
            { value: "grupos", label: "Grupos", icon: "grupos" },
            { value: "carruseles", label: "Carruseles", icon: "carruseles" },
            { value: "reels", label: "Reels", icon: "reels" },
            { value: "emails", label: "Emails", icon: "email" },
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
      mascot: "/mascota-email.png",
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
      mascot: "/mascota-boost.png",
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
          display: "boxes",
          label: "¿Qué nivel de comisión definirás?",
          options: [
            {
              value: "off",
              label: "Apagada",
              description:
                "No vas a recibir tráfico de Skool. Te llevas el 100% del ingreso pero debes promocionar por tus propios medios.",
            },
            {
              value: "30",
              label: "30%",
              description: "Skool te da miembros y tú te quedas con el 70%.",
            },
            {
              value: "40",
              label: "40%",
              description: "Skool te trae miembros y vamos 50-50.",
            },
            {
              value: "50",
              label: "50%",
              description: "Skool te trae miembros y vamos 50-50.",
            },
            {
              value: "60",
              label: "60%",
              description:
                "Skool te traerá el máximo de miembros. Sin embargo, va a sacrificar algo de ganancia por ese crecimiento.",
            },
            {
              value: "70",
              label: "70%",
              description:
                "Skool te traerá el máximo de miembros. Sin embargo, va a sacrificar algo de ganancia por ese crecimiento.",
            },
          ],
          showIf: { field: "boost_activado", equals: "si" },
        },
        {
          id: "boost_disclaimer",
          type: "info",
          label: "Antes de decidir",
          infoText:
            "Cambiar tu % de impulso de crecimiento no se aplica a los clientes existentes: ellos mantienen el % con el que se unieron. Si no está pasando nada, considera empezar alto y luego bajarlo gradualmente una vez que empiece a funcionar. Si las cosas están funcionando, no necesitas cambiar nada; sin embargo, pujar más siempre te dará más. Puede tardar hasta 30 días en ver el impacto de los cambios: no lo cambies todo el tiempo, ten paciencia.",
          showIf: { field: "boost_activado", equals: "si" },
        },
      ],
    },
  ],

  7: [
    {
      id: "ritmo",
      heading: "Ritmo de publicación",
      mascot: "/mascota-ritmo.png",
      fields: [
        {
          id: "frecuencia",
          type: "slider",
          label: "Frecuencia de publicación",
          helper: "¿Cuántas veces publicarás en tu Skool?",
          sliderMin: 3,
          sliderMax: 14,
          sliderStep: 1,
          sliderUnit: "veces",
          moodMap: [
            { max: 4, emoji: "😢", text: "Uy, es muy poquito", color: "red" },
            { max: 6, emoji: "😐", text: "Uhm, podría ser mejor", color: "orange" },
            { max: 14, emoji: "😃", text: "Eso me gusta, publicarás con frecuencia", color: "green" },
          ],
        },
      ],
    },
    {
      id: "tematicas",
      heading: "Temáticas",
      mascot: "/mascota-tematicas.png",
      fields: [
        {
          id: "tematicas",
          type: "list",
          label: "¿Qué temáticas publicarás?",
          minItems: 1,
          addLabel: "+ Añadir temática",
          badgeLabel: "Temática",
        },
      ],
    },
    {
      id: "conversacion",
      heading: "Ideas para crear conversación",
      mascot: "/mascota-conversacion.png",
      fields: [
        {
          id: "como_conversacion",
          type: "list",
          label: "¿Cómo crearás conversación en tus publicaciones?",
          minItems: 1,
          addLabel: "+ Añadir idea",
          badgeLabel: "Idea",
        },
      ],
    },
    {
      id: "dinamicas",
      heading: "Dinámicas y retos",
      mascot: "/mascota-dinamicas.png",
      fields: [
        {
          id: "dinamicas",
          type: "yesno",
          label: "¿Harás dinámicas o retos semanales/mensuales?",
          options: SI_NO,
        },
        {
          id: "dinamicas_detalle",
          type: "list",
          label: "Cuéntanos brevemente qué tipo de dinámicas o retos",
          minItems: 1,
          addLabel: "+ Añadir dinámica",
          badgeLabel: "Dinámica/Reto",
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

export type PricingTier = {
  nombre: string;
  activo: boolean;
  precio: string;
  periodo: "mes" | "año" | "unico";
  beneficios: string[];
};

export type PricingData = {
  modelo?: "gratis" | "suscripcion" | "freemium" | "niveles" | "pago_unico";
  periodo?: "mensual" | "ambos" | "anual";
  precioMensual?: string;
  precioAnual?: string;
  precioUnico?: string;
  tiers?: PricingTier[];
};

export function parsePricing(value: string | undefined): PricingData {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as PricingData) : {};
  } catch {
    return {};
  }
}

function isPricingAnswered(data: PricingData): boolean {
  if (!data.modelo) return false;

  if (data.modelo === "gratis") return true;

  if (data.modelo === "pago_unico") return !!data.precioUnico?.trim();

  if (data.modelo === "suscripcion") {
    if (!data.periodo) return false;
    if (data.periodo !== "anual" && !data.precioMensual?.trim()) return false;
    if (data.periodo !== "mensual" && !data.precioAnual?.trim()) return false;
    return true;
  }

  if (data.modelo === "freemium" || data.modelo === "niveles") {
    const tiers = data.tiers ?? [];
    const tierOk = (t: PricingTier | undefined) =>
      !!t && !!t.precio.trim() && t.beneficios.some((b) => b.trim());
    const startIndex = data.modelo === "freemium" ? 1 : 0;
    for (let i = startIndex; i < 2; i++) {
      if (!tierOk(tiers[i])) return false;
    }
    const third = tiers[2];
    if (third?.activo && !tierOk(third)) return false;
    return true;
  }

  return false;
}

export type Bono = {
  nombre: string;
  incluye: string;
  valor: string;
};

export type BonosData = {
  bonos?: Bono[];
};

export function parseBonos(value: string | undefined): BonosData {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as BonosData) : {};
  } catch {
    return {};
  }
}

function isBonosAnswered(data: BonosData): boolean {
  const bonos = data.bonos ?? [];
  return bonos.filter((b) => b.nombre.trim() && b.incluye.trim() && b.valor.trim()).length >= 1;
}

export type TerminosData = {
  garantiaTipo?: "incondicional" | "condicional" | "resultado" | "sin_garantia";
  garantiaTexto?: string;
  escasezTipo?: "cupos" | "primeros_n" | "sin_escasez";
  escasezNumero?: string;
  urgenciaTipo?: "precio_sube" | "bono_se_pierde" | "sin_urgencia";
  urgenciaFecha?: string;
};

export function parseTerminos(value: string | undefined): TerminosData {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as TerminosData) : {};
  } catch {
    return {};
  }
}

function isTerminosAnswered(data: TerminosData): boolean {
  if (!data.garantiaTipo) return false;
  if (data.garantiaTipo !== "sin_garantia" && !data.garantiaTexto?.trim()) return false;

  if (!data.escasezTipo) return false;
  if ((data.escasezTipo === "cupos" || data.escasezTipo === "primeros_n") && !data.escasezNumero?.trim())
    return false;

  if (!data.urgenciaTipo) return false;
  if (
    (data.urgenciaTipo === "precio_sube" || data.urgenciaTipo === "bono_se_pierde") &&
    !data.urgenciaFecha?.trim()
  )
    return false;

  return true;
}

export type ModuloCard = {
  titulo: string;
  descripcion: string;
};

export type ModulosData = {
  modulos?: ModuloCard[];
};

export function parseModulos(value: string | undefined): ModulosData {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as ModulosData) : {};
  } catch {
    return {};
  }
}

function isModulosAnswered(data: ModulosData): boolean {
  const modulos = data.modulos ?? [];
  if (modulos.length < 2) return false;
  return modulos.slice(0, 2).every((m) => m.titulo.trim() && m.descripcion.trim());
}

export type CursoItem = {
  titulo: string;
  descripcion: string;
  videos: string[];
};

export type TemarioData = {
  cursos?: CursoItem[];
};

export function parseTemario(value: string | undefined): TemarioData {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? (parsed as TemarioData) : {};
  } catch {
    return {};
  }
}

function isTemarioAnswered(data: TemarioData): boolean {
  const cursos = data.cursos ?? [];
  if (cursos.length < 2) return false;
  const titlesOk = cursos.slice(0, 2).every((c) => c.titulo.trim());
  if (!titlesOk) return false;
  const totalVideos = cursos.reduce(
    (n, c) => n + (c.videos ?? []).filter((v) => v.trim()).length,
    0
  );
  return totalVideos >= 1;
}

function isVisible(field: MissionField, answers: Answers): boolean {
  if (!field.showIf) return true;
  return answers[field.showIf.field] === field.showIf.equals;
}

function isAnswered(field: MissionField, answers: Answers): boolean {
  const v = answers[field.id];

  if (field.type === "pricing") {
    return isPricingAnswered(parsePricing(typeof v === "string" ? v : undefined));
  }

  if (field.type === "bonos") {
    return isBonosAnswered(parseBonos(typeof v === "string" ? v : undefined));
  }

  if (field.type === "terminos") {
    return isTerminosAnswered(parseTerminos(typeof v === "string" ? v : undefined));
  }

  if (field.type === "modulos") {
    return isModulosAnswered(parseModulos(typeof v === "string" ? v : undefined));
  }

  if (field.type === "temario") {
    return isTemarioAnswered(parseTemario(typeof v === "string" ? v : undefined));
  }

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

  if (field.type === "select" || field.type === "yesno" || field.type === "check") {
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

// Los campos "link" con confirm añaden un check virtual (ej: "ya subí mi
// portada") que se cuenta como requerido aunque no exista como su propio
// MissionField en la sección — se renderiza embebido dentro de LinkField.
function expandFields(fields: MissionField[]): MissionField[] {
  return fields.flatMap((f) => {
    if (f.type === "link" && f.confirm) {
      const check: MissionField = { id: f.confirm.id, type: "check", label: f.confirm.label };
      return [f, check];
    }
    return [f];
  });
}

function requiredVisibleFrom(fields: MissionField[], answers: Answers): MissionField[] {
  return expandFields(fields)
    .filter((f) => !NO_INFO_TYPES.includes(f.type))
    .filter((f) => f.required !== false)
    .filter((f) => isVisible(f, answers));
}

function requiredVisibleFields(day: number, answers: Answers): MissionField[] {
  return requiredVisibleFrom(flatFields(day), answers);
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

// Igual que countRequiredFields pero acotado a un subconjunto de campos
// (por ejemplo, los de una sola sección), para mostrar el avance paso a
// paso dentro de una misión.
export function countFieldsAnswered(
  fields: MissionField[],
  answers: Answers
): { total: number; done: number } {
  const required = requiredVisibleFrom(fields, answers);
  const done = required.filter((f) => isAnswered(f, answers)).length;
  return { total: required.length, done };
}
