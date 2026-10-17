"use client";

import { useEffect } from "react";
import { trackEvent, trackOnce } from "@/lib/metaPixel";
import { LEAD_PENDING_COOKIE } from "@/lib/retoCapture";

// Dispara CompleteRegistration una sola vez cuando la persona acaba de crear su cuenta
// (la cuenta se creó hace pocos minutos). Se recuerda en el navegador para no repetirlo.
//
// Además, si la cuenta se creó con Google desde /reto, el servidor ya mandó el Lead a Meta
// y dejó el ID del evento en una cookie: aquí se dispara el mismo Lead en el píxel con ese
// ID (para que Meta cuente uno solo) y se borra la cookie.
export default function MetaRegistrationEvent({
  userId,
  isNew,
}: {
  userId: string;
  isNew: boolean;
}) {
  useEffect(() => {
    try {
      const pending = document.cookie
        .split("; ")
        .find((c) => c.startsWith(LEAD_PENDING_COOKIE + "="))
        ?.split("=")[1];
      if (pending) {
        trackEvent("Lead", { content_name: "Reto Skool 7 dias" }, pending);
        document.cookie = `${LEAD_PENDING_COOKIE}=; path=/; max-age=0`;
      }
    } catch {
      // sin cookies: el Lead ya llegó a Meta desde el servidor
    }

    if (!isNew) return;
    trackOnce(`registration_${userId}`, () =>
      trackEvent("CompleteRegistration", { content_name: "Skooly" })
    );
  }, [userId, isNew]);

  return null;
}
