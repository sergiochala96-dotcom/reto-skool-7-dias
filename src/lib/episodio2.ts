// Contenido del Episodio 2: "Escala tu Skool" (incluido en los planes Premium y VIP).
//
// CONTENIDO PROVISIONAL: textos y prompts de ejemplo mientras se prepara el material definitivo.
// Para editar o agregar contenido basta con cambiar esta lista: cada sección es una página en
// /episodio-2/[id] y sus bloques se muestran en el orden en que aparecen aquí.

export type Episode2Block =
  | { type: "text"; title: string; body: string[] } // caja con uno o más párrafos
  | { type: "steps"; title: string; items: string[] } // lista numerada
  | { type: "prompt"; title: string; text: string }; // prompt para copiar

export type Episode2Section = {
  id: string; // se usa en la dirección: /episodio-2/[id]
  emoji: string;
  title: string;
  intro: string;
  blocks: Episode2Block[];
};

export const EPISODE_2_SECTIONS: Episode2Section[] = [
  {
    id: "antichurn",
    emoji: "🛡️",
    title: "Estrategias antichurn",
    intro:
      "El churn es el porcentaje de miembros que se van de tu comunidad. Retener a quien ya está cuesta mucho menos que conseguir a alguien nuevo: estas son las bases para que se queden.",
    blocks: [
      {
        type: "text",
        title: "Por qué se van los miembros",
        body: [
          "Casi siempre es por una de tres razones: no supieron por dónde empezar, dejaron de ver el valor de lo que pagan, o sintieron que nadie notaba su ausencia.",
          "Tu trabajo es atacar cada momento: la primera semana (que entren y hagan algo), el primer mes (que vean un resultado) y después (que sigan sintiéndose parte).",
        ],
      },
      {
        type: "steps",
        title: "Rutina semanal antichurn",
        items: [
          "Da la bienvenida a cada miembro nuevo por su nombre, en las primeras 24 horas.",
          "Publica un post fijo cada semana (por ejemplo, el lunes: «reto de la semana»).",
          "Programa al menos un evento en vivo o una sesión de preguntas al mes.",
          "Escribe a quien lleva 7 días sin entrar con un mensaje corto y personal.",
          "Reconoce públicamente a quien avanza: un comentario tuyo vale más que un descuento.",
          "Pregunta cada mes qué les gustaría ver y cumple al menos una petición.",
        ],
      },
      {
        type: "prompt",
        title: "Mensaje de bienvenida personalizado",
        text: "Actúa como el administrador de una comunidad de [tu nicho]. Escribe un mensaje de bienvenida cálido y breve (máximo 80 palabras) para un miembro nuevo llamado [nombre]. Debe: 1) agradecerle por unirse, 2) decirle cuál es el primer paso que debe dar hoy, 3) invitarle a presentarse en la comunidad con una pregunta concreta. Tono cercano, sin sonar a robot.",
      },
      {
        type: "prompt",
        title: "Mensaje para un miembro inactivo (7 días)",
        text: "Escribe 3 versiones de un mensaje directo para un miembro de mi comunidad de [tu nicho] que lleva 7 días sin entrar. Reglas: no culpar, no sonar desesperado, ofrecer un motivo concreto para volver (por ejemplo, [novedad o próximo evento]) y terminar con una pregunta fácil de responder. Máximo 50 palabras cada versión.",
      },
      {
        type: "prompt",
        title: "Encuesta de salida: por qué te vas",
        text: "Crea una encuesta de 5 preguntas para quien cancela su membresía en mi comunidad de [tu nicho]. Incluye: el motivo principal (opciones de elección múltiple), qué esperaba y no encontró, qué fue lo más útil, qué cambiaría y si volvería en el futuro. Que se responda en menos de 2 minutos y con tono amable.",
      },
    ],
  },
  {
    id: "meta-ads",
    emoji: "📢",
    title: "Campañas de Meta Ads",
    intro:
      "Meta Ads (anuncios en Facebook e Instagram) puede traerte personas nuevas todos los días. Empieza pequeño, prueba varias ideas y deja que los números te digan cuál escalar.",
    blocks: [
      {
        type: "text",
        title: "La estructura básica",
        body: [
          "Una campaña tiene tres niveles: la campaña (el objetivo, por ejemplo clientes potenciales o registros), el conjunto de anuncios (a quién y con qué presupuesto) y el anuncio (lo que la persona ve).",
          "Empieza con un presupuesto diario pequeño y 3 anuncios distintos en el mismo conjunto. Cambia una sola cosa a la vez (el gancho, la imagen o el texto) para saber qué funcionó.",
        ],
      },
      {
        type: "steps",
        title: "Antes de lanzar tu primera campaña",
        items: [
          "Instala el píxel de Meta en tu página y verifica que registre los eventos.",
          "Ten lista una página de destino clara, rápida en el celular y con tu política de privacidad.",
          "Define una sola acción: dejar el correo, unirse a la comunidad o comprar.",
          "Prepara 3 creativos con ganchos distintos (video corto o imagen).",
          "Fija un presupuesto de prueba que puedas perder sin problema.",
          "Espera al menos 3 días antes de apagar o cambiar un anuncio.",
        ],
      },
      {
        type: "prompt",
        title: "10 ganchos para tus anuncios",
        text: "Soy creador de [tu nicho] y mi oferta es [qué ofreces] para [tu cliente ideal]. Escribe 10 ganchos de 1 línea para los primeros 3 segundos de un anuncio, con 5 ángulos distintos: dolor, deseo, curiosidad, prueba y objeción. Evita promesas de resultados garantizados o ingresos específicos.",
      },
      {
        type: "prompt",
        title: "Guion de video de 30 segundos",
        text: "Escribe un guion de video vertical de 30 segundos para un anuncio de [tu oferta] dirigido a [tu cliente ideal]. Estructura: gancho (3 s), problema (7 s), solución (10 s), cómo funciona (7 s) y llamado a la acción claro (3 s). Lenguaje hablado, frases cortas y sin promesas exageradas.",
      },
      {
        type: "prompt",
        title: "Texto principal del anuncio (3 versiones)",
        text: "Redacta 3 versiones del texto principal de un anuncio de Meta para [tu oferta]: una corta (2 líneas), una media (4 líneas) y una larga con historia. Todas deben abrir con un gancho, nombrar el problema de [tu cliente ideal], presentar [tu oferta] y terminar con un llamado a la acción hacia [tu enlace o acción].",
      },
      {
        type: "prompt",
        title: "Análisis semanal de resultados",
        text: "Estos son los resultados de mi campaña esta semana: inversión [monto], alcance [número], clics [número], costo por clic [monto], registros [número] y costo por registro [monto]. Analiza qué está funcionando y qué no, dime qué anuncio apagar, cuál conservar y qué 2 pruebas hacer la próxima semana. Explícalo simple, sin tecnicismos.",
      },
    ],
  },
  {
    id: "skoolkit",
    emoji: "🧰",
    title: "Configuración de Skoolkit",
    intro:
      "Deja tu comunidad lista para funcionar: una configuración ordenada desde el inicio te ahorra preguntas, ayuda a que los miembros se orienten y facilita todo lo que viene después.",
    blocks: [
      {
        type: "text",
        title: "Qué vas a lograr en esta sección",
        body: [
          "Al terminar tendrás tu configuración base definida: cómo se llama cada espacio, qué reglas rigen la comunidad, qué verá un miembro nuevo al entrar y qué rutina de contenido vas a mantener.",
          "Hazlo en una sola sesión de 30 a 45 minutos y vuelve a ajustarlo después de tus primeros miembros.",
        ],
      },
      {
        type: "steps",
        title: "Checklist de configuración inicial",
        items: [
          "Define el nombre y la promesa de tu comunidad en una sola frase.",
          "Crea las categorías de publicación (por ejemplo: bienvenida, preguntas, victorias, recursos).",
          "Escribe las reglas de la comunidad en 5 puntos o menos.",
          "Prepara tu publicación de bienvenida y fíjala arriba.",
          "Ordena tus clases o recursos en una ruta clara: qué ver primero y qué después.",
          "Revisa cómo se ve todo desde la cuenta de un miembro nuevo.",
        ],
      },
      {
        type: "prompt",
        title: "Categorías y reglas de tu comunidad",
        text: "Mi comunidad de [tu nicho] es para [tu cliente ideal] y su promesa es [promesa en una frase]. Propón: 1) 5 categorías de publicación con nombre corto y una descripción de una línea, y 2) 5 reglas de convivencia claras, amables y fáciles de aplicar. Tono cercano.",
      },
      {
        type: "prompt",
        title: "Publicación de bienvenida fijada",
        text: "Escribe la publicación de bienvenida fijada para mi comunidad de [tu nicho]. Debe incluir: quién soy, qué van a encontrar aquí, los 3 primeros pasos que debe dar un miembro nuevo, cómo participar y una pregunta para que se presente. Máximo 200 palabras, con formato fácil de leer en celular.",
      },
      {
        type: "prompt",
        title: "Ruta de aprendizaje para miembros nuevos",
        text: "Diseña una ruta de aprendizaje de 4 pasos para que un miembro nuevo de mi comunidad de [tu nicho] logre [primer resultado] en sus primeros 7 días. Para cada paso indica: el objetivo, la acción concreta, dónde hacerla y cómo sabrá que lo completó.",
      },
    ],
  },
  {
    id: "waitlist",
    emoji: "⏳",
    title: "Estrategia Waitlist",
    intro:
      "Una lista de espera te permite juntar interesados antes de abrir cupos, medir la demanda real y lanzar con gente esperándote. Aquí tienes el paso a paso y los textos para armarla.",
    blocks: [
      {
        type: "text",
        title: "Por qué funciona una lista de espera",
        body: [
          "Te dice si hay demanda antes de invertir más tiempo o dinero, crea expectativa con un motivo real (cupos limitados o una fecha de apertura) y te deja un grupo de personas listas para comprar el día del lanzamiento.",
          "La clave es ser honesto: si dices que hay cupos limitados, que lo sean de verdad.",
        ],
      },
      {
        type: "steps",
        title: "Paso a paso para montarla",
        items: [
          "Define qué abres, para quién y la fecha aproximada de apertura.",
          "Crea una página sencilla con una promesa clara y un solo campo: el correo.",
          "Ofrece un beneficio por apuntarse (precio de lanzamiento, bono o acceso anticipado).",
          "Envía 3 o 4 correos de calentamiento durante la espera, con contenido útil.",
          "Avisa un día antes de la apertura con el enlace y la hora exactas.",
          "Abre los cupos primero a la lista de espera y luego al público.",
        ],
      },
      {
        type: "prompt",
        title: "Titular y promesa de la página de espera",
        text: "Estoy preparando el lanzamiento de [tu oferta] para [tu cliente ideal]. Escribe 5 opciones de titular y subtítulo para la página de lista de espera, cada una con una promesa clara y realista, el beneficio de apuntarse ([beneficio por unirse]) y un botón de acción. Sin promesas de resultados garantizados.",
      },
      {
        type: "prompt",
        title: "Secuencia de 4 correos para la lista de espera",
        text: "Crea una secuencia de 4 correos para las personas en lista de espera de [tu oferta]. Correo 1: bienvenida y qué esperar. Correo 2: contenido útil sobre [problema de tu cliente]. Correo 3: historia o caso real, sin inventar cifras. Correo 4: aviso de apertura con fecha [fecha] y enlace. Asuntos cortos y cuerpo de máximo 150 palabras.",
      },
      {
        type: "prompt",
        title: "Mensaje de apertura de cupos (WhatsApp)",
        text: "Escribe un mensaje corto de WhatsApp para avisar que se abren los cupos de [tu oferta] a mi lista de espera. Debe incluir: la fecha y hora de apertura [fecha y hora], cuántos cupos hay [número], el beneficio para quienes estaban en la lista y el enlace [enlace]. Máximo 60 palabras y 2 emojis.",
      },
    ],
  },
];

export function getEpisode2Section(id: string): Episode2Section | undefined {
  return EPISODE_2_SECTIONS.find((s) => s.id === id);
}
