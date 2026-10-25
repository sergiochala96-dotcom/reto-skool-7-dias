import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/legal";

export default function CaptacionFooter() {
  const link = "underline decoration-white/30 hover:text-white";
  return (
    <footer className="bg-[#160a26] px-4 py-4 text-center text-sm text-white/60">
      <p>Derechos Reservados - Neobrand Academy 2026</p>
      <p className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        <Link href="/terminos" className={link}>
          Términos y condiciones
        </Link>
        <Link href="/privacidad" className={link}>
          Política de privacidad
        </Link>
        <Link href="/reembolsos" className={link}>
          Reembolsos y cancelación
        </Link>
        <a href={`mailto:${SUPPORT_EMAIL}`} className={link}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </footer>
  );
}
