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
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updateAvatar,
    undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const circle = (
    <span
      className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-400/30 to-purple-500/30"
      style={{ width: size, height: size }}
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
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-fuchsia-200/80"
          style={{ width: size * 0.6, height: size * 0.6 }}
        >
          <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2.5c-3.33 0-10 1.67-10 5V22h20v-2.5c0-3.33-6.67-5-10-5Z" />
        </svg>
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
