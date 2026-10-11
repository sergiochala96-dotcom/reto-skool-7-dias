// Configuración de las páginas de captación (/reto) y de gracias (/gracias).

// Formulario de Systeme.io (Nombre + Correo). La redirección a /gracias después
// de enviar se configura dentro de Systeme.io, en los ajustes del formulario.
export const SYSTEME_FORM = {
  scriptId: "form-script-tag-25772352",
  src: "https://www.sergiochala.com/public/remote/page/45640087875610c5b07eeb837d1a1f18e3215a51.js",
};

// Comunidad/boletín de WhatsApp "Universo Skool".
export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/CmjqJnIevwW6V7wv03p3FQ";

// Video de la página de gracias. Mientras sea null, la página no muestra el
// bloque de video (y el botón de WhatsApp queda solo). Acepta un .mp4 directo
// o un enlace de YouTube con formato https://www.youtube.com/embed/ID
export const GRACIAS_VIDEO_URL: string | null = null;
