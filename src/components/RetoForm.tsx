"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearCuentaReto } from "@/app/reto/actions";
import AccountExistsDialog from "@/components/AccountExistsDialog";
import GoogleButton from "@/components/GoogleButton";
import type { Attribution } from "@/lib/traffic";
import { trackEvent } from "@/lib/metaPixel";
import { CAPTURE_COOKIE, type Capture } from "@/lib/retoCapture";

const INPUT =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/40";

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

// showGoogle: la página lo apaga cuando se abre dentro de Facebook/Instagram, donde Google
// bloquea el inicio de sesión.
export default function RetoForm({ showGoogle = true }: { showGoogle?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<{ text: string } | null>(null);
  const [existsOpen, setExistsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Si Supabase pide confirmar el correo, se muestra este aviso en vez de entrar al panel.
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
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
    const password = String(data.get("password") ?? "");
    setError(null);
    startTransition(async () => {
      // Mismo ID de evento en el píxel (navegador) y en la API de Conversiones (servidor)
      // para que Meta cuente un solo Lead.
      const eventId = crypto.randomUUID();
      const result = await crearCuentaReto(name, email, password, attributionRef.current, {
        eventId,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
        sourceUrl: window.location.href,
      });
      if (result.ok) {
        trackEvent("Lead", { content_name: "Reto Skool 7 dias" }, eventId);
        if (result.needsConfirmation) setConfirmEmail(email.trim());
        else router.push("/dashboard");
      } else if (result.exists) {
        // Correo ya registrado: se avisa en una ventana emergente, más visible que una línea roja.
        setExistsOpen(true);
      } else {
        setError({ text: result.error });
      }
    });
  }

  // Con Google se sale de la página y se pierden los UTM y las cookies de Meta: se guardan
  // en una cookie de corta vida que /auth/callback lee al volver (ver lib/retoCapture.ts).
  function saveCaptureForGoogle() {
    try {
      const capture: Capture = {
        attribution: attributionRef.current,
        tracking: {
          eventId: crypto.randomUUID(),
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          sourceUrl: window.location.href,
        },
      };
      document.cookie = `${CAPTURE_COOKIE}=${encodeURIComponent(JSON.stringify(capture))}; path=/; max-age=1800; SameSite=Lax; Secure`;
    } catch {
      // sin cookies: el lead se registra igual, solo sin origen
    }
  }

  if (confirmEmail) {
    return (
      <div className="rounded-2xl bg-emerald-500/15 px-4 py-5 text-center text-white">
        <p className="text-3xl">📬</p>
        <p className="mt-2 text-lg font-extrabold">¡Casi listo! Confirma tu correo</p>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Te enviamos un correo a <strong>{confirmEmail}</strong>. Ábrelo y toca el botón para
          activar tu cuenta y entrar a Skooly.
        </p>
        <p className="mt-2 text-xs text-white/60">
          Si no lo ves, revisa Promociones o Spam.
        </p>
      </div>
    );
  }

  return (
    <div>
      {existsOpen && <AccountExistsDialog onClose={() => setExistsOpen(false)} />}
      {showGoogle && (
        <>
          <GoogleButton beforeRedirect={saveCaptureForGoogle} />
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-xs uppercase tracking-wide text-white/50">o con tu correo</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>
        </>
      )}

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
        <div>
          <label htmlFor="reto-password" className="mb-1 block text-sm font-semibold text-white/90">
            Crea tu contraseña
          </label>
          <div className="relative">
            <input
              id="reto-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              maxLength={72}
              className={`${INPUT} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:text-gray-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <path d="m1 1 22 22" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-100"
          >
            {error.text}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 w-full rounded-xl bg-amber-400 px-6 py-4 text-lg font-extrabold text-black shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Creando tu cuenta..." : "Crear mi cuenta gratis"}
        </button>
      </form>
    </div>
  );
}
