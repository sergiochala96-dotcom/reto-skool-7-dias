import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MISSIONS } from "@/lib/challenge";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 text-5xl">🎮</div>
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          Reto de 7 Días
        </h1>
        <p className="mt-4 text-lg text-white/70">
          Completa una misión cada día, desbloquea la siguiente y llega al
          Cofre del Tesoro final.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/registro"
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 py-3 font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110"
          >
            Comenzar el reto
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {MISSIONS.map((m) => (
            <div
              key={m.day}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                Día {m.day}
              </p>
              <p className="mt-1 font-semibold">
                {m.emoji} {m.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
