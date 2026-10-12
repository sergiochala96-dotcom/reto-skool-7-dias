// Configuración de las páginas de captación (/reto) y de gracias (/gracias).

// Formulario de Systeme.io (Nombre + Correo). El formulario de /reto es propio,
// pero al enviarlo guardamos el contacto en Systeme.io con el mismo endpoint que
// usa su formulario embebido (así se dispara la automatización del correo de acceso).
// Estos valores salen de la página del formulario en Systeme.io (ID de la página
// y del botón "enviar"). Si se recrea el formulario allá, hay que actualizarlos.
export const SYSTEME_OPTIN = {
  url: "https://www.sergiochala.com/public/45640087875610c5b07eeb837d1a1f18e3215a51/show",
  entityId: "4354526b-8920-4f87-bcbe-bb5e459cc262",
};

// Comunidad/boletín de WhatsApp "Universo Skool".
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/CmjqJnIevwW6V7wv03p3FQ";

// Video de la página de gracias. Mientras sea null, la página muestra un espacio
// reservado para el video. Acepta un .mp4 directo o un enlace de YouTube con
// formato https://www.youtube.com/embed/ID
export const GRACIAS_VIDEO_URL: string | null = "https://www.youtube.com/embed/jxwq8aQm5pI";

// Workshop EN VIVO (se ofrece en el Episodio 2 bloqueado del panel).
export const WORKSHOP_URL = "https://pay.hotmart.com/M107993635C";

// Inicio del workshop: 21 de octubre de 2026, 8:00 pm (hora de Colombia, UTC-5).
export const WORKSHOP_START = "2026-10-21T20:00:00-05:00";

// Porcentaje de cupos vendidos del workshop que se muestra en la barra de avance.
export const WORKSHOP_SOLD_PERCENT = 20;
