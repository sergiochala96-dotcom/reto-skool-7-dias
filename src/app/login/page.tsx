import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import GoogleButton from "@/components/GoogleButton";
import { signInWithEmail } from "@/app/actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-12 md:w-1/2">
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
            <h1 className="text-2xl font-bold text-white">Skooly</h1>
            <p className="mt-1 text-sm text-white/60">
              Inicia sesión para continuar tu misión
            </p>
          </div>

          <GoogleButton />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wide text-white/40">o</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <AuthForm action={signInWithEmail} mode="login" />

          <p className="mt-6 text-center text-sm text-white/60">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-fuchsia-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden md:block md:w-1/2">
        <Image
          src="/login-lobby.webp"
          alt="Comunidad Skool"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}
