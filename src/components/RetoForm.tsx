"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarContacto } from "@/app/reto/actions";

const INPUT =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/40";

export default function RetoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await registrarContacto(name, email);
      if (result.ok) {
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
