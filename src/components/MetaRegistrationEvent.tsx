"use client";

import { useEffect } from "react";
import { trackEvent, trackOnce } from "@/lib/metaPixel";

// Dispara CompleteRegistration una sola vez cuando la persona acaba de crear su cuenta
// (la cuenta se creó hace pocos minutos). Se recuerda en el navegador para no repetirlo.
export default function MetaRegistrationEvent({
  userId,
  isNew,
}: {
  userId: string;
  isNew: boolean;
}) {
  useEffect(() => {
    if (!isNew) return;
    trackOnce(`registration_${userId}`, () =>
      trackEvent("CompleteRegistration", { content_name: "Skooly" })
    );
  }, [userId, isNew]);

  return null;
}
