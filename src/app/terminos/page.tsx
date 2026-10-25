import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { LegalSection as Section } from "@/components/LegalLayout";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones | Skooly",
  description:
    "Condiciones de uso de Skooly: planes, pagos, suscripciones, cancelación, reembolsos y uso aceptable.",
};

const mail = (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-purple-700 underline">
    {SUPPORT_EMAIL}
  </a>
);

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y condiciones">
      <p className="mt-6 text-base leading-relaxed text-purple-950/80">
        Estos términos regulan el uso de <strong>Skooly</strong> y de los planes que ofrecemos. Al
        crear una cuenta o contratar un plan aceptas estas condiciones. Si no estás de acuerdo, no
        uses el servicio.
      </p>

      <Section title="1. Quiénes somos">
        <p>
          Skooly es un servicio digital operado por <strong>Neobrand Academy</strong> (Sergio Chala,
          persona natural, Colombia). Para cualquier consulta escríbenos a {mail}.
        </p>
      </Section>

      <Section title="2. Qué es Skooly">
        <p>
          Skooly es una aplicación web, instalable en el celular, que te guía con una misión diaria
          durante un reto de 7 días para crear tu comunidad en Skool. Incluye misiones guiadas,
          plantillas de prompts de IA, seguimiento de tu progreso y avisos opcionales. Skooly no es
          Skool: la comunidad que creas vive en tu propia cuenta de Skool, que se rige por los
          términos de esa plataforma.
        </p>
      </Section>

      <Section title="3. Tu cuenta">
        <ul className="list-disc space-y-1 pl-5">
          <li>Debes tener capacidad legal para contratar y dar datos verdaderos al registrarte.</li>
          <li>Eres responsable de la seguridad de tu contraseña y de lo que ocurra en tu cuenta.</li>
          <li>Tu cuenta es personal: no la compartas ni la revendas.</li>
        </ul>
      </Section>

      <Section title="4. Planes y precios">
        <p>Ofrecemos tres planes. Los precios están en dólares estadounidenses (USD):</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Standard — $0:</strong> acceso gratuito al reto de 7 días.
          </li>
          <li>
            <strong>Premium — $5 al mes:</strong> el reto de 7 días, el acceso al Episodio 2
            (&quot;Escala tu Skool&quot;) y recursos nuevos como prompts y estrategias antichurn.
          </li>
          <li>
            <strong>VIP — $25 al mes:</strong> todo lo del plan Premium, clases en vivo semanales y
            acceso a la membresía de Skool de Neobrand Academy.
          </li>
        </ul>
        <p>
          Podemos mejorar o actualizar el contenido de cada plan con el tiempo. Si cambiamos el
          precio de una suscripción activa, te avisaremos antes de que se aplique al siguiente
          cobro.
        </p>
      </Section>

      <Section title="5. Pagos y suscripciones">
        <p>
          Los planes de pago son suscripciones mensuales que se renuevan automáticamente hasta que
          las canceles. Los pagos los procesa <strong>Creem</strong>, que actúa como vendedor
          autorizado (&quot;Merchant of Record&quot;): es quien te cobra, emite el recibo y aplica
          los impuestos que correspondan según tu país. Al pagar también aceptas las condiciones de
          Creem. Nosotros no vemos ni guardamos los datos de tu tarjeta.
        </p>
      </Section>

      <Section title="6. Cancelación y reembolsos">
        <p>
          Puedes cancelar tu suscripción cuando quieras desde el portal del cliente de Creem (el
          enlace llega en el recibo de tu pago) o escribiéndonos a {mail}. Al cancelar no se hacen
          nuevos cobros y conservas el acceso hasta el final del período que ya pagaste.
        </p>
        <p>
          Los pagos ya realizados <strong>no se reembolsan</strong>, salvo cuando haya un error de
          cobro (por ejemplo, un cargo duplicado) o la ley aplicable lo exija. Más detalles en
          nuestra{" "}
          <Link href="/reembolsos" className="font-semibold text-purple-700 underline">
            política de reembolsos y cancelación
          </Link>
          .
        </p>
      </Section>

      <Section title="6 bis. Cambios de plan">
        <p>
          Si ya tienes un plan de pago y pasas a uno superior (por ejemplo, de Premium a VIP), tu
          suscripción actual se actualiza, el nuevo plan se activa al instante y se te cobra al
          momento la diferencia proporcional del período en curso. No se crea una segunda
          suscripción. Para bajar de plan, cancela el actual y contrata el menor cuando termine tu
          período pagado.
        </p>
      </Section>

      <Section title="7. Clases en vivo y membresía de Skool (plan VIP)">
        <p>
          Las clases en vivo del plan VIP se realizan cada semana y se anuncian con anticipación por
          correo o dentro de la membresía de Skool. Si no puedes asistir, puedes ponerte al día con
          los materiales que se compartan. El acceso a la membresía de Skool se otorga a través de
          esa plataforma, que se rige por sus propios términos, y depende de que tu suscripción
          esté activa: si la cancelas, el acceso termina al final del período pagado.
        </p>
      </Section>

      <Section title="8. Sin garantía de resultados">
        <p>
          Skooly te da método, herramientas y acompañamiento, pero{" "}
          <strong>no garantizamos ingresos, número de miembros ni resultados específicos</strong>.
          Lo que logres depende de tu trabajo, tu nicho y tu constancia.
        </p>
      </Section>

      <Section title="9. Uso aceptable">
        <ul className="list-disc space-y-1 pl-5">
          <li>No uses Skooly para actividades ilegales, engañosas o que dañen a otras personas.</li>
          <li>No intentes acceder a cuentas ajenas ni alterar el funcionamiento de la app.</li>
          <li>
            No copies, revendas ni distribuyas el contenido de pago (plantillas, recursos o
            grabaciones) fuera de tu uso personal.
          </li>
        </ul>
        <p>Podemos suspender o cerrar cuentas que incumplan estas reglas.</p>
      </Section>

      <Section title="10. Propiedad intelectual">
        <p>
          La app, su diseño, la mascota Skooly, los textos y los materiales son de Neobrand
          Academy. Tu suscripción te da una licencia personal, limitada y no transferible para
          usarlos. El contenido que tú escribes dentro de las misiones sigue siendo tuyo.
        </p>
      </Section>

      <Section title="11. Limitación de responsabilidad">
        <p>
          Ofrecemos Skooly &quot;tal como está&quot;, sin garantizar que funcione sin
          interrupciones ni errores. En la medida permitida por la ley, nuestra responsabilidad
          total frente a ti se limita a lo que hayas pagado por el plan en los últimos 12 meses.
        </p>
      </Section>

      <Section title="12. Cambios y terminación">
        <p>
          Podemos actualizar estos términos; publicaremos la versión nueva en esta página con su
          fecha. Si sigues usando Skooly después del cambio, lo aceptas. Puedes dejar de usar el
          servicio cuando quieras, y nosotros podemos terminarlo o cerrar una cuenta por
          incumplimiento de estos términos.
        </p>
      </Section>

      <Section title="13. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de Colombia. Tus datos personales se tratan según
          nuestra{" "}
          <Link href="/privacidad" className="font-semibold text-purple-700 underline">
            política de privacidad
          </Link>
          .
        </p>
      </Section>

      <Section title="14. Contacto">
        <p>Soporte y consultas: {mail}. Respondemos en un máximo de 3 días hábiles.</p>
      </Section>
    </LegalLayout>
  );
}
