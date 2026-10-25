import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Episode2SectionView from "@/components/Episode2SectionView";
import Sidebar from "@/components/Sidebar";
import { getEpisode2Section } from "@/lib/episodio2";
import { requireEpisode2Access } from "@/lib/episodio2Access";

export const metadata: Metadata = {
  title: "Episodio 2 | Skooly",
};

export default async function Episodio2SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getEpisode2Section(slug);
  if (!section) notFound();

  const { nombre, user, avatarUrl, admin, completedDays, notifications, plan } =
    await requireEpisode2Access();

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#3b0764,#0f0721_65%)] md:flex-row">
      <Sidebar
        nombre={nombre}
        email={user.email ?? ""}
        avatarUrl={avatarUrl}
        admin={admin}
        completedDays={Array.from(completedDays)}
        notifications={notifications}
        plan={plan}
      />

      <main className="flex-1 px-4 py-10 lg:px-10">
        <Episode2SectionView section={section} admin={admin} />
      </main>
    </div>
  );
}
