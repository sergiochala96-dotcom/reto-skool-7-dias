import type { Metadata } from "next";
import Link from "next/link";
import CaptacionFooter from "@/components/CaptacionFooter";

export const metadata: Metadata = {
  title: "Política de privacidad | Skooly",
  description:
    "Cómo Neobrand Academy recolecta, usa y protege tus datos personales en Skooly y en el Reto de Skool en 7 Días.",
};

const CONTACT_EMAIL = "hola@sergiochala.com";
const UPDATED = "Octubre de 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-purple-950">{title}</h2>
      <div className="mt-2 space-y-3 text-base leading-relaxed text-purple-950/80">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-white bg-[radial-gradient(ellipse_at_top_right,#ede9fe_0%,transparent_55%)] px-4 py-10 text-purple-950 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/reto" className="text-sm font-semibold text-purple-700 hover:underline">
            ← Volver
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-purple-950/60">Última actualización: {UPDATED}</p>

          <p className="mt-6 text-base leading-relaxed text-purple-950/80">
            En Neobrand Academy (&quot;nosotros&quot;) cuidamos tus datos personales. Esta política
            explica qué información recolectamos cuando usas <strong>Skooly</strong> y el{" "}
            <strong>Reto de Skool en 7 Días</strong>, para qué la usamos y cómo puedes ejercer tus
            derechos.
          </p>

          <Section title="1. Responsable del tratamiento">
            <p>
              Neobrand Academy es la responsable de tus datos. Puedes escribirnos para cualquier
              tema de privacidad a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-purple-700 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="2. Qué datos recolectamos">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Datos que nos das:</strong> tu nombre y tu correo electrónico (en el
                formulario de acceso o al crear tu cuenta), y las respuestas que escribes dentro de
                las misiones de la app.
              </li>
              <li>
                <strong>Datos de tu cuenta:</strong> si inicias sesión con Google, recibimos tu
                nombre, correo y foto de perfil que Google comparte con nosotros.
              </li>
              <li>
                <strong>Datos de uso:</strong> qué días del reto completas y cuándo fue tu última
                actividad.
              </li>
              <li>
                <strong>Datos técnicos y de origen:</strong> de qué enlace o anuncio llegaste
                (etiquetas como utm_source o utm_medium), el tipo de navegador, el tipo de dispositivo
                (computadora, Android o iPhone) y la dirección IP.
              </li>
              <li>
                <strong>Avisos en tu dispositivo:</strong> si activas las notificaciones, guardamos
                el identificador técnico que tu navegador nos da para poder enviártelas. Puedes
                desactivarlas cuando quieras desde la configuración de tu navegador o teléfono.
              </li>
            </ul>
          </Section>

          <Section title="3. Para qué usamos tus datos">
            <ul className="list-disc space-y-1 pl-5">
              <li>Darte acceso a la app y guardar tu progreso y tus respuestas.</li>
              <li>
                Enviarte por correo tu acceso, recordatorios del reto y comunicaciones sobre
                Skooly, nuestros talleres y productos. Puedes darte de baja cuando quieras.
              </li>
              <li>Entender de dónde llegan las personas y mejorar nuestras campañas.</li>
              <li>
                Medir el rendimiento de nuestros anuncios y mostrarte publicidad relevante (ver
                sección 5).
              </li>
            </ul>
          </Section>

          <Section title="4. Con quién compartimos tus datos">
            <p>
              No vendemos tus datos. Usamos proveedores que los procesan por nuestra cuenta y solo
              para prestarte el servicio:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Supabase y Vercel: almacenamiento de la base de datos y alojamiento de la app.</li>
              <li>Systeme.io: envío de correos electrónicos y gestión de la lista de contactos.</li>
              <li>ManyChat y Meta (Instagram y Facebook): mensajes y publicidad.</li>
              <li>Google: inicio de sesión con tu cuenta de Google.</li>
              <li>Hotmart: procesamiento de pagos de talleres y productos que compres.</li>
              <li>
                Creem: procesamiento de los pagos de las suscripciones (Premium y VIP). Creem actúa
                como vendedor autorizado, recibe tus datos de pago y nosotros no los vemos ni los
                guardamos.
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies y píxel de Meta">
            <p>
              Usamos el <strong>píxel de Meta</strong> para medir cuántas personas visitan nuestras
              páginas, cuántas dejan su correo y cuántas completan el reto, y para crear audiencias
              publicitarias. Este píxel puede guardar cookies en tu navegador y enviar a Meta
              información como las páginas que visitas y datos de contacto cifrados (por ejemplo, tu
              correo convertido en un código irreconocible). Meta usa esos datos según su propia
              política de privacidad.
            </p>
            <p>
              Puedes desactivar las cookies de seguimiento desde la configuración de tu navegador o
              desde tus preferencias de anuncios en Facebook e Instagram.
            </p>
          </Section>

          <Section title="6. Tus derechos">
            <p>
              Conforme a la Ley 1581 de 2012 de Colombia y demás normas aplicables, puedes en
              cualquier momento: conocer los datos que tenemos sobre ti, actualizarlos o
              rectificarlos, pedir que los eliminemos, revocar tu autorización y presentar quejas
              ante la autoridad competente. Para ejercer estos derechos escríbenos a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-purple-700 underline">
                {CONTACT_EMAIL}
              </a>
              . Respondemos tu solicitud en el menor tiempo posible.
            </p>
          </Section>

          <Section title="7. Seguridad y conservación">
            <p>
              Aplicamos medidas técnicas para proteger tu información, como conexiones cifradas y
              control de acceso. Conservamos tus datos mientras tengas una relación con nosotros o
              hasta que nos pidas eliminarlos.
            </p>
          </Section>

          <Section title="8. Cambios a esta política">
            <p>
              Si actualizamos esta política, publicaremos la nueva versión en esta página con la
              fecha de actualización.
            </p>
          </Section>
        </div>
      </main>
      <CaptacionFooter />
    </div>
  );
}
