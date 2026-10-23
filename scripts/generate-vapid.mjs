// Genera el par de claves para las notificaciones push (se hace UNA sola vez).
//   npm run vapid
// - La clave PÚBLICA va en NEXT_PUBLIC_VAPID_PUBLIC_KEY (Vercel y .env.local).
// - La clave PRIVADA va en VAPID_PRIVATE_KEY (Vercel y .env.local). No la compartas con nadie.
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log("\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=" + publicKey);
console.log("VAPID_PRIVATE_KEY=" + privateKey + "\n");
