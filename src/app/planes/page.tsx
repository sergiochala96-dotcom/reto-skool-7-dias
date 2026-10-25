import { permanentRedirect } from "next/navigation";

// La página de ventas ahora es la portada (/). Este enlace antiguo lleva a la sección de planes.
export default function PlanesPage() {
  permanentRedirect("/#planes");
}
