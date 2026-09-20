export type Mission = {
  day: number;
  title: string;
  emoji: string;
  intro: string;
};

export const MISSIONS: Mission[] = [
  {
    day: 1,
    title: "Inicia el Reto",
    emoji: "🚀",
    intro: "Define tu audiencia y tu avatar ideal: la base de todo lo que construirás en este reto.",
  },
  {
    day: 2,
    title: "Identidad de tu Skool",
    emoji: "🪪",
    intro: "Crea tu Skool y dale identidad: nombre, portada, icono y tu modelo de monetización.",
  },
  {
    day: 3,
    title: "Configura tu Fachada",
    emoji: "🏪",
    intro: "Construye la fachada de tu Skool: lo primero que ven los visitantes antes de unirse.",
  },
  {
    day: 4,
    title: "Comunidad, Calendario y Niveles",
    emoji: "🏘️",
    intro: "Dale vida a tu comunidad: el primer post, tu calendario de clases y el sistema de niveles.",
  },
  {
    day: 5,
    title: "Crea tu Mapa de Ruta",
    emoji: "🗺️",
    intro: "Diseña el camino de aprendizaje que tus miembros seguirán paso a paso.",
  },
  {
    day: 6,
    title: "Miembros Fundadores",
    emoji: "🏆",
    intro: "Es hora de invitar a tus primeros miembros fundadores y activar tu descubrimiento en Skool.",
  },
  {
    day: 7,
    title: "Nutrición de Comunidad",
    emoji: "🌱",
    intro: "Define cómo vas a mantener viva tu comunidad después del lanzamiento.",
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
