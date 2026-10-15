"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarContacto } from "@/app/reto/actions";
import type { Attribution } from "@/lib/traffic";
import { trackEvent } from "@/lib/metaPixel";

const INPUT =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/40";

export default function RetoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const attributionRef = useRef<Attribution>({});

  // Origen del tráfico: etiquetas UTM del enlace (y la página de la que viene). Se
  // recuerdan en la sesión por si la persona recarga la página antes de enviar.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl: Attribution = {
        utm_source: params.get("utm_source") ?? undefined,
        utm_medium: params.get("utm_medium") ?? undefined,
        utm_campaign: params.get("utm_campaign") ?? undefined,
        utm_content: params.get("utm_content") ?? undefined,
        utm_term: params.get("utm_term") ?? undefined,
        referrer: document.referrer || undefined,
      };
      const hasUtm = Object.entries(fromUrl).some(([k, v]) => k.startsWith("utm_") && v);
      const saved = sessionStorage.getItem("reto_attribution");
      if (hasUtm) {
        attributionRef.current = fromUrl;
        sessionStorage.setItem("reto_attribution", JSON.stringify(fromUrl));
      } else if (saved) {
        attributionRef.current = JSON.parse(saved) as Attribution;
      } else {
        attributionRef.current = fromUrl;
      }
    } catch {
      // sin sessionStorage: se envía lo que haya en la URL al momento de enviar
    }
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await registrarContacto(name, email, attributionRef.current);
      if (result.ok) {
        trackEvent("Lead", { content_name: "Reto Skool 7 dias" });
        router.push("/gracias");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <label htmlFor="reto-name" className="mb-1 block text-sm font-semibold text-white/90">
          Tu nombre
        </label>
        <input
          id="reto-name"
          name="name"
          type="text"
          autoComplete="given-name"
          placeholder="Ej: María"
          required
          maxLength={80}
          className={INPUT}
        />
      </div>
      <div>
        <label htmlFor="reto-email" className="mb-1 block text-sm font-semibold text-white/90">
          Tu correo (mejor si es Gmail)
        </label>
        <input
          id="reto-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tucorreo@gmail.com"
          required
          maxLength={200}
          className={INPUT}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-xl bg-amber-400 px-6 py-4 text-lg font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Enviando..." : "Quiero mi acceso"}
      </button>
    </form>
  );
}
