"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { updateAvatar } from "@/app/actions";
import type { AuthState } from "@/app/actions";

export default function Avatar({
  avatarUrl,
  nombre,
  size = 64,
  editable = false,
}: {
  avatarUrl: string | null;
  nombre: string;
  size?: number;
  editable?: boolean;
}) {
  const initial = nombre.charAt(0).toUpperCase();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updateAvatar,
    undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const circle = (
    <span
      className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={nombre}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );

  if (!editable) return circle;

  return (
    <div className="flex flex-col items-center gap-1">
      <form action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="group relative rounded-full transition disabled:opacity-60"
        >
          {circle}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
            {pending ? "..." : "📷 Cambiar"}
          </span>
        </button>
      </form>
      {state?.error && (
        <p className="max-w-[10rem] text-center text-[11px] text-red-300">
          {state.error}
        </p>
      )}
    </div>
  );
}
