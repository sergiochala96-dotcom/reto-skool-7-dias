import Link from "next/link";

export default function CaptacionFooter() {
  return (
    <footer className="bg-[#160a26] px-4 py-4 text-center text-sm text-white/60">
      <p>Derechos Reservados - Neobrand Academy 2026</p>
      <p className="mt-1 text-xs">
        <Link href="/privacidad" className="underline decoration-white/30 hover:text-white">
          Política de privacidad
        </Link>
      </p>
    </footer>
  );
}
