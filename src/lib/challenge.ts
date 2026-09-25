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

export type Episode2Checkpoint = {
  id: string;
  emoji: string;
  title: string;
};

export const EPISODE_2_LABEL = "Episodio 2:";
export const EPISODE_2_NAME = "Escala tu Skool";

export const EPISODE_2_CHECKPOINTS: Episode2Checkpoint[] = [
  { id: "oferta-paga", emoji: "💰", title: "Lanza tu oferta paga" },
  { id: "referidos", emoji: "🔗", title: "Consigue referidos" },
  { id: "ads-pagados", emoji: "📢", title: "Escala con ads pagados" },
  { id: "eventos-en-vivo", emoji: "🎥", title: "Activa tus eventos en vivo" },
  { id: "gamifica", emoji: "🎮", title: "Gamifica tu comunidad" },
];

export function getMission(day: number): Mission | undefined {
  return MISSIONS.find((m) => m.day === day);
}

// Video corto de Skooly que se reproduce al entrar a cada día (mientras se
// vaya subiendo uno por día). Alojado en Supabase Storage (bucket público
// "day-videos").
const SUPABASE_STORAGE_BASE =
  "https://umvvcfjhlkvfpnpvbfkv.supabase.co/storage/v1/object/public/day-videos";

export const DAY_INTRO_VIDEOS: Record<number, string> = {
  1: `${SUPABASE_STORAGE_BASE}/dia-1-intro.mp4`,
  2: `${SUPABASE_STORAGE_BASE}/dia-2-intro.mp4`,
  3: `${SUPABASE_STORAGE_BASE}/dia-3-intro.mp4`,
  4: `${SUPABASE_STORAGE_BASE}/dia-4-intro.mp4`,
  5: `${SUPABASE_STORAGE_BASE}/dia-5-intro.mp4`,
  6: `${SUPABASE_STORAGE_BASE}/dia-6-intro.mp4`,
  7: `${SUPABASE_STORAGE_BASE}/dia-7-intro.mp4`,
};

export function getDayIntroVideo(day: number): string | undefined {
  return DAY_INTRO_VIDEOS[day];
}

// Video de bienvenida que se muestra una única vez, la primera vez que un
// usuario entra al dashboard tras crear su cuenta (ver profiles.welcome_video_seen).
export const WELCOME_VIDEO_URL = `${SUPABASE_STORAGE_BASE}/welcome-intro.mp4`;
