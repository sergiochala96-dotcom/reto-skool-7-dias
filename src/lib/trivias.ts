// Trivia del día: cada día de juego (empieza a las 6:00 a. m. de Colombia) toca una trivia nueva de 3
// preguntas. Cada respuesta fallada cuesta una vida; sin vidas no se puede terminar y se pierden las
// monedas. Quien la completa gana monedas de oro una sola vez por día. Las trivias rotan en el orden de esta lista y,
// al terminarla, vuelven a empezar: para variar basta con agregar más al final.
//
// CONTENIDO PROVISIONAL: preguntas de ejemplo de cultura general sobre comunidades, marketing e IA.
// Las respuestas correctas NO se envían al navegador: el servidor revela cada una al responder.

export type TriviaQuestion = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3; // posición de la opción correcta
  explain: string;
};

export type Trivia = { id: string; title: string; emoji: string; questions: TriviaQuestion[] };

export const QUESTIONS_PER_TRIVIA = 3; // preguntas por trivia del día
export const TRIVIA_REWARD = 5; // monedas de oro por completar la trivia del día

// Día 0 de la rotación (la primera trivia sale este día).
const FIRST_DAY = "2026-10-26";

const RAW_TRIVIAS: Trivia[] = [
  {
    id: "comunidades",
    title: "Comunidades online: lo básico",
    emoji: "🏘️",
    questions: [
      {
        q: "¿Qué es una comunidad online?",
        options: [
          "Una lista de correos que nadie lee",
          "Un grupo con un interés en común que interactúa en un mismo espacio digital",
          "Un anuncio pagado en redes",
          "Un sitio web sin interacción",
        ],
        answer: 1,
        explain: "Lo que la hace comunidad es la interacción entre personas con un interés compartido.",
      },
      {
        q: "¿Qué hace que los miembros se queden en una comunidad?",
        options: [
          "Que no haya reglas",
          "Que haya muchas notificaciones",
          "Sentirse parte y recibir valor de forma constante",
          "Que sea gratis para siempre",
        ],
        answer: 2,
        explain: "Pertenencia y valor constante son las dos razones más fuertes para quedarse.",
      },
      {
        q: "¿Cuál es una buena forma de recibir a un miembro nuevo?",
        options: [
          "Saludarlo por su nombre y decirle qué hacer primero",
          "Esperar a que pregunte",
          "Enviarle diez enlaces a la vez",
          "No decirle nada",
        ],
        answer: 0,
        explain: "Un saludo personal y un primer paso claro evitan que se pierda.",
      },
      {
        q: "¿Qué es la «promesa» de una comunidad?",
        options: [
          "El precio de la membresía",
          "El logo del grupo",
          "El resultado concreto que ayudas a lograr",
          "El número de miembros",
        ],
        answer: 2,
        explain: "La promesa explica qué ganará la persona al unirse.",
      },
      {
        q: "¿Qué publicación conviene fijar arriba en una comunidad?",
        options: [
          "Un meme viejo",
          "La bienvenida con los primeros pasos",
          "Una discusión sin terminar",
          "Un anuncio de otra marca",
        ],
        answer: 1,
        explain: "Lo primero que ve alguien nuevo debe orientarlo.",
      },
      {
        q: "¿Qué ayuda más a que un miembro nuevo se quede en tu comunidad?",
        options: [
          "Que nadie le escriba al entrar",
          "Una bienvenida personal y un primer paso claro",
          "Mandarle 20 enlaces de golpe",
          "Pedirle que compre otra membresía enseguida",
        ],
        answer: 1,
        explain: "Una bienvenida cercana y una primera acción sencilla hacen que la persona se sienta parte desde el primer día.",
      },
    ],
  },
  {
    id: "retencion",
    title: "Retención de miembros",
    emoji: "🛡️",
    questions: [
      {
        q: "¿Qué es el «churn»?",
        options: [
          "El porcentaje de miembros que se da de baja",
          "El número de publicaciones al día",
          "El precio de un plan",
          "Un tipo de anuncio",
        ],
        answer: 0,
        explain: "Churn es la tasa de bajas: cuántos se van en un período.",
      },
      {
        q: "¿Cuándo es más fácil perder a un miembro?",
        options: [
          "Después de un año",
          "Cuando gana un premio",
          "Nunca se pierde",
          "En su primera semana, si no hace nada",
        ],
        answer: 3,
        explain: "Si no tiene un primer resultado pronto, se desconecta.",
      },
      {
        q: "¿Qué mensaje funciona mejor con alguien inactivo?",
        options: [
          "Uno que lo culpe por no participar",
          "Uno personal, breve y con una razón para volver",
          "Uno larguísimo con todas las novedades",
          "Ninguno, mejor ignorarlo",
        ],
        answer: 1,
        explain: "Personal, corto y sin culpas: da una razón concreta para regresar.",
      },
      {
        q: "¿Para qué sirve una encuesta de salida?",
        options: [
          "Para que se queden por obligación",
          "Para cobrarles de nuevo",
          "Para publicar sus respuestas",
          "Para entender por qué se van y mejorar",
        ],
        answer: 3,
        explain: "Sus respuestas muestran qué arreglar para retener a los demás.",
      },
      {
        q: "Normalmente, ¿qué cuesta menos?",
        options: [
          "Conseguir un cliente nuevo",
          "Retener a uno que ya tienes",
          "Cuestan exactamente lo mismo",
          "Depende del color del logo",
        ],
        answer: 1,
        explain: "Retener suele costar bastante menos que captar a alguien nuevo.",
      },
      {
        q: "Un miembro lleva semanas sin entrar. ¿Qué es lo más útil?",
        options: [
          "Ignorarlo, ya volverá solo",
          "Eliminarlo de la comunidad",
          "Escribirle con interés real y una razón concreta para volver",
          "Subirle el precio",
        ],
        answer: 2,
        explain: "Un mensaje cercano con un motivo concreto para volver recupera más gente que el silencio.",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing digital esencial",
    emoji: "📣",
    questions: [
      {
        q: "¿Qué es el público objetivo?",
        options: [
          "Todas las personas de internet",
          "Tus competidores",
          "El grupo de personas a las que ayuda tu oferta",
          "Los miembros que más hablan",
        ],
        answer: 2,
        explain: "Conocer a quién le hablas hace que tu mensaje sea más claro.",
      },
      {
        q: "¿Qué es un llamado a la acción (CTA)?",
        options: [
          "La indicación clara de qué hacer a continuación",
          "El título de un video",
          "El precio final",
          "Un tipo de letra",
        ],
        answer: 0,
        explain: "Por ejemplo: «Únete gratis» o «Descarga la guía».",
      },
      {
        q: "¿Qué mide la tasa de conversión?",
        options: [
          "Cuántas personas ven un anuncio",
          "El porcentaje que hace la acción que buscas",
          "Cuánto gastas",
          "La velocidad de tu página",
        ],
        answer: 1,
        explain: "Es el porcentaje de visitantes que completa la acción deseada.",
      },
      {
        q: "¿Qué es el «gancho» (hook) de un video corto?",
        options: [
          "El final del video",
          "La música de fondo",
          "Los hashtags",
          "Los primeros segundos que captan la atención",
        ],
        answer: 3,
        explain: "Si no atrapas en los primeros segundos, la persona sigue de largo.",
      },
      {
        q: "¿Qué es un «lead»?",
        options: [
          "Una persona que dejó sus datos de contacto por interés",
          "Un tipo de anuncio",
          "Un cliente que canceló",
          "Una publicación fijada",
        ],
        answer: 0,
        explain: "Un lead es un posible cliente que mostró interés dejando sus datos.",
      },
      {
        q: "En marketing digital, ¿qué es un embudo?",
        options: [
          "Un tipo de anuncio",
          "El camino que recorre una persona desde que te conoce hasta que compra",
          "Una herramienta para editar videos",
          "El número de seguidores que tienes",
        ],
        answer: 1,
        explain: "El embudo describe las etapas por las que pasa alguien: conocerte, confiar y comprar.",
      },
    ],
  },
  {
    id: "meta-ads",
    title: "Anuncios en Meta: primeros pasos",
    emoji: "📢",
    questions: [
      {
        q: "¿Para qué sirve el píxel de Meta?",
        options: [
          "Para editar imágenes",
          "Para medir lo que hacen las personas en tu página",
          "Para enviar correos",
          "Para cambiar el logo",
        ],
        answer: 1,
        explain: "El píxel registra acciones (visitas, registros) para medir y optimizar.",
      },
      {
        q: "¿Cómo conviene empezar con anuncios?",
        options: [
          "Con todo el presupuesto de golpe",
          "Sin ninguna prueba",
          "Con un presupuesto pequeño y varias versiones del anuncio",
          "Copiando exactamente el de otro",
        ],
        answer: 2,
        explain: "Probar en pequeño te dice qué funciona antes de invertir más.",
      },
      {
        q: "¿Qué significa CPC?",
        options: [
          "Costo por clic",
          "Clientes por campaña",
          "Contenido para comunidad",
          "Conversión por compra",
        ],
        answer: 0,
        explain: "CPC es lo que pagas, en promedio, por cada clic en tu anuncio.",
      },
      {
        q: "¿Por qué esperar unos días antes de apagar un anuncio?",
        options: [
          "Porque los anuncios no cuestan nada",
          "Para que Meta cobre más",
          "Porque se gasta menos",
          "Para juntar datos suficientes antes de decidir",
        ],
        answer: 3,
        explain: "Con pocos datos es fácil tomar una mala decisión.",
      },
      {
        q: "Al probar creativos, ¿qué es lo mejor?",
        options: [
          "Cambiar todo a la vez",
          "No medir nada",
          "Cambiar una sola cosa por prueba (gancho, imagen o texto)",
          "Repetir siempre el mismo",
        ],
        answer: 2,
        explain: "Cambiando una sola variable sabes qué fue lo que mejoró el resultado.",
      },
      {
        q: "En Meta Ads, ¿para qué sirve el público (audiencia) de un anuncio?",
        options: [
          "Para elegir el color del anuncio",
          "Para escribir el texto",
          "Para medir los me gusta",
          "Para decidir a qué personas se les muestra",
        ],
        answer: 3,
        explain: "El público define quién ve tu anuncio; elegirlo bien evita gastar en personas que no te interesan.",
      },
    ],
  },
  {
    id: "contenido",
    title: "Contenido y constancia",
    emoji: "🎬",
    questions: [
      {
        q: "¿Qué es un calendario de contenido?",
        options: [
          "Un plan de qué publicar y cuándo",
          "Una lista de seguidores",
          "Un reporte de ventas",
          "Una app de música",
        ],
        answer: 0,
        explain: "Planificar evita improvisar y ayuda a mantener la constancia.",
      },
      {
        q: "¿Para qué sirve reutilizar un mismo contenido en varios formatos?",
        options: [
          "Para confundir a la gente",
          "Para llegar a más personas sin empezar de cero",
          "Para publicar menos",
          "No sirve para nada",
        ],
        answer: 1,
        explain: "Un video puede ser también un post, un correo y un carrusel.",
      },
      {
        q: "¿Qué es un contenido «evergreen»?",
        options: [
          "Uno que solo sirve un día",
          "Uno que solo habla de tecnología",
          "Uno que sigue siendo útil con el paso del tiempo",
          "Uno de color verde",
        ],
        answer: 2,
        explain: "El contenido evergreen sigue trayendo gente mucho después de publicarse.",
      },
      {
        q: "¿Qué pesa más a largo plazo?",
        options: [
          "Publicar perfecto una sola vez",
          "La suerte",
          "Copiar tendencias sin pensar",
          "La constancia",
        ],
        answer: 3,
        explain: "Publicar con regularidad suele superar a la perfección ocasional.",
      },
      {
        q: "¿Qué dato ayuda a mejorar tu contenido?",
        options: [
          "Ver cuáles publicaciones generan más respuestas y guardados",
          "Contar las letras de cada post",
          "La hora en la que dormiste",
          "Ninguno",
        ],
        answer: 0,
        explain: "Lo que ya funciona te indica qué repetir y qué cambiar.",
      },
      {
        q: "¿Qué da mejores resultados al crear contenido?",
        options: [
          "Copiar lo que hacen los demás",
          "Publicar solo cuando tengas ganas",
          "Publicar con constancia, mejorando poco a poco",
          "Publicar una vez al año algo perfecto",
        ],
        answer: 2,
        explain: "La constancia construye confianza y te da práctica; la perfección total casi nunca llega.",
      },
    ],
  },
  {
    id: "ofertas",
    title: "Ofertas y precios",
    emoji: "💰",
    questions: [
      {
        q: "¿Qué es una oferta clara?",
        options: [
          "Un descuento sin explicación",
          "Una página con muchas imágenes",
          "El resultado que prometes, lo que incluye y su precio",
          "Un anuncio sin texto",
        ],
        answer: 2,
        explain: "Resultado, contenido y precio: así la persona entiende qué compra.",
      },
      {
        q: "¿Qué es una suscripción?",
        options: [
          "Un pago único",
          "Un pago que se repite cada período hasta cancelar",
          "Un regalo",
          "Una factura vieja",
        ],
        answer: 1,
        explain: "Se cobra de forma recurrente, por ejemplo cada mes.",
      },
      {
        q: "¿Qué es un bono?",
        options: [
          "Un extra que suma valor a la oferta",
          "Una multa",
          "Un tipo de impuesto",
          "Un reembolso automático",
        ],
        answer: 0,
        explain: "Los bonos complementan la oferta principal con algo útil.",
      },
      {
        q: "¿Qué conviene evitar en una página de ventas?",
        options: [
          "Explicar qué incluye",
          "Mostrar el precio",
          "Dar información clara",
          "Prometer resultados garantizados que no puedes cumplir",
        ],
        answer: 3,
        explain: "Las promesas exageradas dañan la confianza y pueden traer problemas.",
      },
      {
        q: "¿Para qué sirve la prueba social?",
        options: [
          "Para decorar la página",
          "Para esconder el precio",
          "Para mostrar opiniones y resultados reales de clientes reales",
          "Para que parezca que hay más gente",
        ],
        answer: 2,
        explain: "Muestra que otras personas confían, siempre que sea verdadera.",
      },
      {
        q: "¿Qué hace más atractiva una oferta?",
        options: [
          "Que sea muy larga y confusa",
          "Que no diga el precio",
          "Que se parezca a todas las demás",
          "Que deje claro el resultado que la persona va a lograr",
        ],
        answer: 3,
        explain: "La gente compra un resultado: cuanto más claro, más fácil es decidir.",
      },
    ],
  },
  {
    id: "email",
    title: "Email marketing",
    emoji: "📧",
    questions: [
      {
        q: "¿Qué es una secuencia de correos?",
        options: [
          "Un correo muy largo",
          "Una serie de correos programados que se envían en orden",
          "Una lista de contactos",
          "Un correo sin asunto",
        ],
        answer: 1,
        explain: "Se envían automáticamente, uno tras otro, según un calendario.",
      },
      {
        q: "¿Qué influye más para que abran tu correo?",
        options: [
          "El asunto",
          "El color del fondo",
          "La firma",
          "El día del año",
        ],
        answer: 0,
        explain: "El asunto es lo primero que se ve y decide si se abre.",
      },
      {
        q: "¿Qué es segmentar una lista?",
        options: [
          "Borrar a todos",
          "Enviar siempre lo mismo",
          "Dividirla por intereses o comportamiento",
          "Duplicar los correos",
        ],
        answer: 2,
        explain: "Así cada grupo recibe mensajes más relevantes.",
      },
      {
        q: "¿Qué pasa cuando alguien se da de baja de tu lista?",
        options: [
          "Debes seguir escribiéndole",
          "Debes enviarle más correos",
          "Se le suman correos nuevos",
          "Debes dejar de enviarle correos",
        ],
        answer: 3,
        explain: "Respetar la baja es una buena práctica y suele ser obligatorio.",
      },
      {
        q: "¿Qué debe tener un buen correo de bienvenida?",
        options: [
          "Un agradecimiento y un primer paso claro",
          "Diez ofertas distintas",
          "Solo un enlace sin texto",
          "Nada, mejor no enviarlo",
        ],
        answer: 0,
        explain: "Agradecer y orientar hace que la persona se sienta bien recibida.",
      },
      {
        q: "¿Qué parte de un correo decide en gran medida si lo abren?",
        options: [
          "El asunto",
          "La firma",
          "El color del fondo",
          "El pie de página",
        ],
        answer: 0,
        explain: "El asunto es lo primero que se ve en la bandeja de entrada y decide si abren o no.",
      },
    ],
  },
  {
    id: "ia",
    title: "IA para creadores",
    emoji: "🤖",
    questions: [
      {
        q: "¿Qué es un «prompt»?",
        options: [
          "Un tipo de anuncio",
          "Una contraseña",
          "La instrucción que le das a una IA",
          "Un archivo de imagen",
        ],
        answer: 2,
        explain: "Un prompt es el texto con el que le pides algo a la inteligencia artificial.",
      },
      {
        q: "¿Qué mejora un prompt?",
        options: [
          "Dar contexto, un rol y el formato que esperas",
          "Escribir lo más corto posible",
          "No explicar nada",
          "Usar solo mayúsculas",
        ],
        answer: 0,
        explain: "Cuanto más claro el contexto y el formato, mejor la respuesta.",
      },
      {
        q: "¿Qué conviene hacer con lo que genera la IA?",
        options: [
          "Publicarlo sin leerlo",
          "Revisarlo y adaptarlo a tu estilo",
          "Borrarlo siempre",
          "Venderlo como si fuera de otra persona",
        ],
        answer: 1,
        explain: "La IA es un borrador: tú pones el criterio y tu voz.",
      },
      {
        q: "¿Qué NO deberías escribir en un prompt?",
        options: [
          "Tu nicho",
          "El tono que quieres",
          "Un ejemplo",
          "Contraseñas o datos privados de otras personas",
        ],
        answer: 3,
        explain: "Nunca compartas datos sensibles con herramientas de IA.",
      },
      {
        q: "¿Qué significa que una IA «alucine»?",
        options: [
          "Que se queda dormida",
          "Que es muy rápida",
          "Que inventa información que parece real",
          "Que traduce idiomas",
        ],
        answer: 2,
        explain: "Por eso conviene verificar los datos importantes.",
      },
      {
        q: "Al usar IA para escribir, ¿qué mejora más el resultado?",
        options: [
          "Escribir un pedido muy corto y vago",
          "Pedirle que adivine qué necesitas",
          "Darle contexto: quién eres, a quién le hablas y qué quieres lograr",
          "Usar siempre la primera respuesta sin revisarla",
        ],
        answer: 2,
        explain: "Cuanto más contexto le des, más útil y específica será la respuesta.",
      },
    ],
  },
  {
    id: "lanzamientos",
    title: "Lanzamientos y lista de espera",
    emoji: "🚀",
    questions: [
      {
        q: "¿Qué es una lista de espera?",
        options: [
          "Un grupo de interesados que se apuntan antes de que abras cupos",
          "Una fila de pagos pendientes",
          "Un tipo de anuncio",
          "Una lista de reembolsos",
        ],
        answer: 0,
        explain: "Te deja medir la demanda y lanzar con gente esperando.",
      },
      {
        q: "¿Qué hace creíble una lista de espera?",
        options: [
          "Inventar que se agotó",
          "Una fecha de apertura y cupos limitados que sean reales",
          "No dar ninguna información",
          "Cambiar la fecha cada día",
        ],
        answer: 1,
        explain: "La escasez solo funciona a largo plazo si es verdadera.",
      },
      {
        q: "¿Cuándo conviene avisar de la apertura?",
        options: [
          "Nunca",
          "Cuando ya se cerró",
          "Con fecha, hora y enlace claros, primero a la lista de espera",
          "Sin dar enlace",
        ],
        answer: 2,
        explain: "Quien esperó merece enterarse primero y sin confusiones.",
      },
      {
        q: "¿Qué conviene medir en un lanzamiento?",
        options: [
          "Solo los likes",
          "Nada",
          "El color del botón",
          "Registros, aperturas de correo y ventas",
        ],
        answer: 3,
        explain: "Esos números muestran dónde se cae la gente y qué mejorar.",
      },
      {
        q: "Si dices «cupos limitados», ¿qué debe pasar?",
        options: [
          "Que realmente sean limitados",
          "Que no importe el número",
          "Que se amplíen siempre",
          "Que no se cumpla",
        ],
        answer: 0,
        explain: "Cumplir lo que dices es la base de la confianza.",
      },
      {
        q: "¿Para qué sirve una lista de espera antes de un lanzamiento?",
        options: [
          "Juntar personas interesadas que quieran comprar cuando abras",
          "Esconder el lanzamiento",
          "Bajar el precio sin avisar",
          "Cancelar el lanzamiento",
        ],
        answer: 0,
        explain: "La lista reúne a quienes ya levantaron la mano, así llegas al lanzamiento con gente lista para comprar.",
      },
    ],
  },
  {
    id: "engagement",
    title: "Participación y niveles",
    emoji: "🎮",
    questions: [
      {
        q: "¿Qué ofrece normalmente una comunidad de pago?",
        options: [
          "Solo publicidad",
          "Contenido, acompañamiento y una comunidad de personas afines",
          "Nada concreto",
          "Únicamente descuentos",
        ],
        answer: 1,
        explain: "El valor está en el contenido, la guía y el entorno.",
      },
      {
        q: "¿Para qué sirve un evento en vivo en una comunidad?",
        options: [
          "Para aburrir",
          "Para cerrar el grupo",
          "Para conectar con los miembros y resolver dudas en tiempo real",
          "Para borrar publicaciones",
        ],
        answer: 2,
        explain: "Los eventos en vivo refuerzan la cercanía y la participación.",
      },
      {
        q: "¿Qué es gamificar una comunidad?",
        options: [
          "Prohibir participar",
          "Cobrar por cada mensaje",
          "Cerrar los comentarios",
          "Premiar la participación con puntos, niveles o recompensas",
        ],
        answer: 3,
        explain: "Los puntos y niveles motivan a participar con constancia.",
      },
      {
        q: "¿Qué es una ruta de aprendizaje?",
        options: [
          "Un camino ordenado de pasos para lograr un resultado",
          "Un mapa de carreteras",
          "Una lista de reglas",
          "Un tipo de membresía",
        ],
        answer: 0,
        explain: "Le dice a cada miembro qué hacer primero y qué después.",
      },
      {
        q: "¿Qué es un «miembro fundador»?",
        options: [
          "El que más publica",
          "El administrador",
          "Alguien que se une entre los primeros",
          "El que paga menos",
        ],
        answer: 2,
        explain: "Los primeros miembros ayudan a dar forma y confianza a la comunidad.",
      },
      {
        q: "¿Para qué sirven los niveles en una comunidad?",
        options: [
          "Para que los miembros se sientan reconocidos y quieran participar más",
          "Para ocultar el contenido",
          "Para cobrar más",
          "Para que nadie participe",
        ],
        answer: 0,
        explain: "Los niveles reconocen la participación y dan una meta visible a quien quiere avanzar.",
      },
    ],
  },
];

// Cada tema tiene 6 preguntas y se reparte en dos trivias de 3: los días 1 a 10 salen las
// primeras partes y los días 11 a 20, las segundas (20 días de material; después vuelve a empezar).
export const TRIVIAS: Trivia[] = [
  ...RAW_TRIVIAS.map((t) => ({ ...t, questions: t.questions.slice(0, QUESTIONS_PER_TRIVIA) })),
  ...RAW_TRIVIAS.map((t) => ({
    ...t,
    id: `${t.id}-2`,
    title: `${t.title} II`,
    questions: t.questions.slice(QUESTIONS_PER_TRIVIA, QUESTIONS_PER_TRIVIA * 2),
  })),
];

// Fecha del "día de juego" (YYYY-MM-DD): el día cambia a las 6:00 a. m. de Colombia, la misma hora a
// la que se rellenan las vidas.
export function playDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(
    new Date(now.getTime() - 6 * 3_600_000)
  );
}

// La trivia que toca hoy (rota por día de juego).
export function getTodayTrivia(now: Date = new Date()): { trivia: Trivia; date: string } {
  const date = playDateKey(now);
  const days = Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${FIRST_DAY}T00:00:00Z`)) / 86_400_000);
  const index = ((days % TRIVIAS.length) + TRIVIAS.length) % TRIVIAS.length;
  return { trivia: TRIVIAS[index], date };
}
