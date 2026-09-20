import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import GoogleButton from "@/components/GoogleButton";
import { signUpWithEmail } from "@/app/actions";

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🏆</div>
          <h1 className="text-2xl font-bold text-white">Únete a Skooly</h1>
          <p className="mt-1 text-sm text-white/60">
            Reto de Skool en 7 Días · 7 misiones, 1 tesoro final
          </p>
        </div>

        <GoogleButton />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wide text-white/40">o</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <AuthForm action={signUpWithEmail} mode="registro" />

        <p className="mt-6 text-center text-sm text-white/60">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-fuchsia-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
