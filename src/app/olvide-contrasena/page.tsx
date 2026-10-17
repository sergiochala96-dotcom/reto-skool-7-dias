import Image from "next/image";
import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default async function OlvideContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Image
            src="/mascota-skooly.png"
            alt="Skooly"
            width={96}
            height={96}
            className="mx-auto mb-2 h-24 w-24 object-contain"
            priority
          />
          <h1 className="text-2xl font-extrabold text-white">¿Olvidaste tu contraseña?</h1>
          <p className="mt-1 text-sm text-white/60">
            Escribe tu correo y te enviamos un enlace para elegir una nueva
          </p>
        </div>

        <ForgotPasswordForm expiredLink={error === "enlace"} />

        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/login" className="font-medium text-fuchsia-400 hover:underline">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
