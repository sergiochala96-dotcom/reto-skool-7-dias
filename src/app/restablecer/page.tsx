import Image from "next/image";
import ResetPasswordForm from "@/components/ResetPasswordForm";

// Se llega aquí desde el enlace del correo de "olvidé mi contraseña" (la ruta es privada:
// sin la sesión que abre ese enlace, el sistema manda a /login).
export default function RestablecerPage() {
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
          <h1 className="text-2xl font-extrabold text-white">Elige tu contraseña nueva</h1>
          <p className="mt-1 text-sm text-white/60">
            Con ella vas a entrar a Skooly de ahora en adelante
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </main>
  );
}
