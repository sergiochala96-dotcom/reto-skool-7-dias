import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { LegalSection as Section } from "@/components/LegalLayout";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Reembolsos y cancelación | Skooly",
  description: "Cómo cancelar tu suscripción a Skooly y cuándo aplican los reembolsos.",
};

const mail = (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-purple-700 underline">
    {SUPPORT_EMAIL}
  </a>
);

export default function ReembolsosPage() {
  return (
    <LegalLayout title="Reembolsos y cancelación">
      <p className="mt-6 text-base leading-relaxed text-purple-950/80">
        Esta política aplica a los planes de pago de <strong>Skooly</strong> (Premium y VIP). El plan
        Standard es gratuito y no tiene cobros.
      </p>

      <Section title="Cómo cancelar">
        <p>Puedes cancelar tu suscripción cuando quieras, sin permanencia:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Desde el <strong>portal del cliente de Creem</strong>: el enlace llega en el recibo que
            recibes por correo después de cada pago.
          </li>
          <li>O escribiéndonos a {mail} desde el correo de tu cuenta.</li>
        </ul>
        <p>
          Al cancelar no se vuelve a cobrar y conservas tu acceso hasta el final del período que ya
          pagaste.
        </p>
      </Section>

      <Section title="Reembolsos">
        <p>
          Como el acceso a Skooly es digital y empieza apenas pagas, los pagos ya realizados{" "}
          <strong>no son reembolsables</strong>. Por eso puedes cancelar antes de la renovación si
          no quieres seguir.
        </p>
        <p>Hacemos excepciones en estos casos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cobro duplicado o monto incorrecto.</li>
          <li>Cobro posterior a una cancelación que ya habías confirmado.</li>
          <li>Cuando la ley aplicable en tu país lo exija.</li>
        </ul>
      </Section>

      <Section title="Cómo pedir una revisión de un cobro">
        <p>
          Escríbenos a {mail} con el correo de tu cuenta y, si lo tienes, el recibo del cobro. Te
          respondemos en un máximo de 3 días hábiles. Los reembolsos aprobados se devuelven al mismo
          medio de pago a través de Creem.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Consulta también nuestros{" "}
          <Link href="/terminos" className="font-semibold text-purple-700 underline">
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="font-semibold text-purple-700 underline">
            política de privacidad
          </Link>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
