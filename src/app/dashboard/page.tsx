import { getSidebarData } from "@/lib/sidebar-data";
import { TOTAL_DAYS, WELCOME_VIDEO_URL } from "@/lib/challenge";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import ChallengePath from "@/components/ChallengePath";
import ChallengePathDesktop from "@/components/ChallengePathDesktop";
import Episode2Card from "@/components/Episode2Card";
import Avatar from "@/components/Avatar";
import SkoolyLogo from "@/components/SkoolyLogo";
import WelcomeVideoModal from "@/components/WelcomeVideoModal";
import MetaRegistrationEvent from "@/components/MetaRegistrationEvent";
import EpisodeStickyHeader from "@/components/EpisodeStickyHeader";
import { PushPromptCard } from "@/components/PushNotifications";
import JoinRewards from "@/components/JoinRewards";
import JoinTiles from "@/components/JoinTiles";
import RightRail from "@/components/RightRail";
import StatsBar from "@/components/StatsBar";

export default async function DashboardPage() {
  const {
    nombre,
    user,
    avatarUrl,
    admin,
    completedDays,
    welcomeVideoSeen,
    notifications,
    plan,
    coins,
    lives,
  } = await getSidebarData();
  const completedList = Array.from(completedDays);
  const completedCount = completedList.length;

  const supabase = await createClient();

  if (!welcomeVideoSeen) {
    await supabase
      .from("profiles")
      .update({ welcome_video_seen: true })
      .eq("id", user.id);
  }

  // El Episodio 2 está bloqueado salvo con plan Premium/VIP o si el admin lo abre usuario por
  // usuario desde el panel de admin: episode2_locked_override = false => desbloqueado.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("episode2_locked_override")
    .eq("id", user.id)
    .single();
  // Los planes Premium y VIP incluyen el Episodio 2: se abre solo, sin tocar nada.
  // Qué comunidades ya verificó (las recompensas de 50 monedas se canjean con un código).
  const { data: verifiedRows } = await supabase
    .from("coin_transactions")
    .select("ref")
    .eq("user_id", user.id)
    .in("reason", ["verificado", "instalar"]);
  const verified = new Set((verifiedRows ?? []).map((r) => r.ref as string));
  const claimed = {
    whatsapp: verified.has("whatsapp"),
    skool: verified.has("skool"),
    install: verified.has("app"),
  };

  const episode2Locked = profileRow?.episode2_locked_override !== false && plan === "standard";

  return (
    <div className="flex min-h-screen flex-col bg-ink md:flex-row">
      {!welcomeVideoSeen && (
        <WelcomeVideoModal src={WELCOME_VIDEO_URL} />
      )}
      <MetaRegistrationEvent
        userId={user.id}
        isNew={Date.now() - new Date(user.created_at).getTime() < 15 * 60 * 1000}
      />
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={completedList}
        notifications={notifications}
        plan={plan}
        coins={coins}
        lives={lives}
      />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-6 md:py-5">
        <div className="mx-auto max-w-2xl md:max-w-7xl">
          {/* En computadora con pantalla mediana, las estadísticas van arriba a la derecha; en
              pantallas grandes viven en la columna derecha. */}
          <div className="mb-2 hidden justify-end md:max-[1399px]:flex">
            <StatsBar completedDays={completedList} coins={coins} lives={lives} />
          </div>

          <div className="mb-8 text-center md:mb-9">
            <div className="mb-3 flex justify-center md:mb-2">
              <Avatar avatarUrl={avatarUrl} nombre={nombre} size={64} editable />
            </div>
            <p className="text-sm text-white/50 md:text-lg">Hola, {nombre} 👋</p>
            <h1 className="text-2xl font-bold text-white md:mt-0.5 md:text-4xl md:font-extrabold">
              Tu progreso en <SkoolyLogo />
            </h1>
            <p className="mt-1 text-sm text-white/60 md:mt-1.5 md:text-lg">
              {completedCount}/{TOTAL_DAYS} días completados
            </p>
          </div>

          {/* Con pantalla grande estas recompensas están en la columna derecha; en el celular son los
              dos iconos cuadrados fijos bajo la tarjeta del episodio (JoinTiles). */}
          <JoinRewards claimed={claimed} className="mx-auto mb-5 max-w-md max-md:hidden min-[1400px]:hidden" />

          {/* Invitación a activar los avisos: llega tras el primer día completado. */}
          {completedDays.size >= 1 && <PushPromptCard userKey={user.email ?? user.id} />}

          {/* Los episodios. En el celular, la tarjeta amarilla de arriba se queda pegada mientras se ven
              sus puntos y cambia al llegar al Episodio 2 (por eso van juntos en este bloque). */}
          <div>
            <EpisodeStickyHeader completed={completedCount} total={TOTAL_DAYS} />
            <JoinTiles claimed={claimed} />
            <div className="max-md:hidden">
              <ChallengePathDesktop completedDays={completedList} />
            </div>
            <div id="episodio-1" className="md:hidden">
              <ChallengePath completedDays={completedList} />
            </div>

            {/* El Episodio 2 lo ve todo el mundo; está bloqueado salvo con plan Premium/VIP o acceso
                abierto a mano desde el panel de admin. */}
            <div id="episodio-2">
              {/* Separador entre episodios (computadora): una línea con el nombre del siguiente. */}
              <div className="mx-auto mt-20 flex max-w-3xl items-center gap-4 max-md:hidden" role="separator">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-400/70" />
                <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-6 py-2 text-sm font-extrabold uppercase tracking-widest text-sky-300">
                  Episodio 2
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-400/70" />
              </div>
              <Episode2Card locked={episode2Locked} admin={admin} />
            </div>
          </div>
        </div>
      </main>

      <RightRail completedDays={completedList} coins={coins} lives={lives} claimed={claimed} />
    </div>
  );
}
