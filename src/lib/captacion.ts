// Configuración de las páginas de captación (/reto) y de gracias (/gracias).

// (Antes aquí estaba el formulario de Systeme.io que disparaba el correo de acceso. Como /reto
// ahora crea la cuenta directamente, el contacto se guarda por la API de Systeme.io, ver
// lib/registrarLead.ts. Los datos del formulario viejo están en el historial de git.)

// Comunidad/boletín de WhatsApp "Universo Skool".
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/CmjqJnIevwW6V7wv03p3FQ";

// Comunidad gratuita en Skool (misión inicial 1 del panel).
export const SKOOL_COMMUNITY_URL = "https://www.skool.com/the-creators-community-4018/about";

// Video de la página de gracias. Mientras sea null, la página muestra un espacio
// reservado para el video. Acepta un .mp4 directo o un enlace de YouTube con
// formato https://www.youtube.com/embed/ID
export const GRACIAS_VIDEO_URL: string | null = "https://www.youtube.com/embed/jxwq8aQm5pI";

// Workshop EN VIVO (se ofrece en el Episodio 2 bloqueado del panel).
export const WORKSHOP_URL = "https://pay.hotmart.com/M107993635C?checkoutMode=10";

// Inicio del workshop: 28 de octubre de 2026, 8:00 pm (hora de Colombia, UTC-5).
export const WORKSHOP_START = "2026-10-28T20:00:00-05:00";

// Porcentaje de cupos vendidos del workshop que se muestra en la barra de avance.
export const WORKSHOP_SOLD_PERCENT = 20;

// Monedas de oro por instalar la app en el celular (una sola vez).
export const INSTALL_REWARD = 100;
