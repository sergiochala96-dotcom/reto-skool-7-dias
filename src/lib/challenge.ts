export type Mission = {
  day: number;
  title: string;
  emoji: string;
  objetivo: string;
  tareas: string[];
  entregable: string;
};

// Contenido placeholder generado a partir de los títulos del reto.
// Edita objetivo / tareas / entregable de cada día con tu contenido real.
export const MISSIONS: Mission[] = [
  {
    day: 1,
    title: "¡Inicia los Skool Games!",
    emoji: "🚀",
    objetivo:
      "Dar la bienvenida al reto, activar tu mentalidad de jugador y preparar tu espacio de trabajo dentro de Skool.",
    tareas: [
      "Completa tu perfil de Skool con foto y una frase que te represente.",
      "Preséntate en la comunidad contando qué quieres lograr en estos 7 días.",
      "Define tu meta personal para el final del reto.",
    ],
    entregable: "Un post de presentación en la comunidad de Skool.",
  },
  {
    day: 2,
    title: "Nicho y Modelo de Negocio",
    emoji: "🎯",
    objetivo:
      "Definir con claridad a quién le vas a vender, qué problema resuelves y cómo vas a monetizar tu comunidad.",
    tareas: [
      "Escribe en una frase tu nicho y a quién ayudas.",
      "Elige tu modelo de negocio (membresía, curso, coaching, mixto).",
      "Anota 3 problemas puntuales que tu comunidad resolverá.",
    ],
    entregable: "Ficha de nicho + modelo de negocio (una página).",
  },
  {
    day: 3,
    title: "About Page y Precios",
    emoji: "💰",
    objetivo:
      "Construir la página 'Acerca de' de tu Skool y definir tu estructura de precios y planes.",
    tareas: [
      "Redacta tu About Page: quién eres, qué ofreces y por qué unirse.",
      "Define entre 1 y 3 planes de precios con lo que incluye cada uno.",
      "Agrega tu propuesta de valor en una sola frase potente.",
    ],
    entregable: "About Page publicada + tabla de precios definida.",
  },
  {
    day: 4,
    title: "Community, Calendar, Niveles",
    emoji: "🏘️",
    objetivo:
      "Configurar la estructura interna de tu comunidad: categorías, calendario de eventos y sistema de niveles.",
    tareas: [
      "Crea las categorías principales de tu Community.",
      "Programa al menos 1 evento en el Calendar.",
      "Configura tu sistema de niveles y las recompensas de cada uno.",
    ],
    entregable: "Comunidad con categorías, 1 evento y niveles activos.",
  },
  {
    day: 5,
    title: "Crea tu Mapa de Ruta",
    emoji: "🗺️",
    objetivo:
      "Diseñar el mapa de ruta (roadmap) que tus miembros seguirán paso a paso dentro de tu comunidad.",
    tareas: [
      "Define las etapas o módulos principales del recorrido.",
      "Ordena los pasos de menor a mayor complejidad.",
      "Agrega una meta clara al final de cada etapa.",
    ],
    entregable: "Mapa de ruta visual o documento con las etapas definidas.",
  },
  {
    day: 6,
    title: "Configura tu Classroom",
    emoji: "🎓",
    objetivo:
      "Dejar listo el Classroom de tu Skool con al menos el primer curso o módulo de contenido.",
    tareas: [
      "Crea la estructura de tu primer curso (módulos y lecciones).",
      "Sube o enlaza el contenido de la primera lección.",
      "Revisa que el acceso y el orden del contenido sean claros.",
    ],
    entregable: "Classroom con al menos 1 curso y su primera lección lista.",
  },
  {
    day: 7,
    title: "Miembros fundadores",
    emoji: "🏆",
    objetivo:
      "Preparar y lanzar la invitación a tus primeros miembros fundadores para arrancar tu comunidad con fuerza.",
    tareas: [
      "Define el beneficio exclusivo para miembros fundadores.",
      "Escribe el mensaje/invitación de lanzamiento.",
      "Comparte el enlace de tu comunidad con tu primera lista de prospectos.",
    ],
    entregable: "Invitación enviada a tus primeros miembros fundadores.",
  },
];

export const TOTAL_DAYS = MISSIONS.length;

// El reto de 7 días + el cofre es el "Episodio 1". Cuando se agreguen más
// días más adelante (Episodio 2, etc.), esto pasará a ser una lista.
export const CURRENT_EPISODE_LABEL = "Episodio 1:";
export const CURRENT_EPISODE_NAME = "Crea tu Skool";
export const NEXT_EPISODE_TEASER = "Episodio 2: Próximamente";

export function getMission(day: number): Mission | undefined {
  return MISSIONS.find((m) => m.day === day);
}
