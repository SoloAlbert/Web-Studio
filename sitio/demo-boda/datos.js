/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   - Cambia los textos entre comillas.
   - Si no quieres una sección, bórrala completa o ponle null.
   - Las fotos van en la carpeta "fotos" de este mismo evento.
   ===================================================================== */
window.EVENTO = {
  tipo: "boda", // boda | xv | bautizo | graduacion | cumple

  pretitulo: "Nuestra boda",
  nombres: { principal: "María", conector: "&", segundo: "Alejandro" },
  frase: "¡Nos casamos!",
  tituloCorto: "la boda de María y Alejandro", // se usa en el mensaje de WhatsApp y el calendario

  // Fecha y hora del evento principal. El "-06:00" es la hora del centro de México.
  fecha: "2027-05-15T19:00:00-06:00",
  duracionHoras: 7,

  // Pantalla de bienvenida con botón "Abrir invitación" (true / false)
  intro: true,

  // Foto de portada (opcional). Ej.: "fotos/portada.jpg". Déjalo en null para usar el fondo del tema.
  portada: { imagen: null },

  mensaje:
    "Nuestra historia merece celebrarse contigo. Nos encantaría que fueras parte de este día tan especial.",
  cita: {
    texto: "El amor es paciente, es bondadoso… todo lo soporta.",
    autor: "1 Corintios 13",
  },

  familia: [
    { titulo: "Padres de la novia", nombres: ["Rosa Hernández", "Jorge López"] },
    { titulo: "Padres del novio", nombres: ["Laura Martínez", "Ricardo Gómez"] },
    { titulo: "Padrinos", nombres: ["Ana y Luis Ramírez"] },
  ],

  lugares: [
    {
      tipo: "Ceremonia religiosa",
      nombre: "Parroquia de San Juan Bautista",
      hora: "5:00 p.m.",
      direccion: "Jardín Hidalgo, Coyoacán, CDMX",
      mapa: "https://www.google.com/maps/search/?api=1&query=Parroquia+San+Juan+Bautista+Coyoacan",
    },
    {
      tipo: "Recepción",
      nombre: "Jardín Los Olivos",
      hora: "7:00 p.m.",
      direccion: "Dirección del salón, Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Coyoacan+CDMX",
    },
  ],

  itinerario: [
    { hora: "5:00 p.m.", actividad: "Ceremonia religiosa" },
    { hora: "7:00 p.m.", actividad: "Recepción y cóctel" },
    { hora: "8:30 p.m.", actividad: "Cena" },
    { hora: "9:30 p.m.", actividad: "Primer baile" },
    { hora: "10:00 p.m.", actividad: "¡A bailar!" },
  ],

  vestimenta: {
    codigo: "Formal",
    detalle: "Caballeros: traje. Damas: vestido largo.",
    colores: ["#d9c7a7", "#a8b5a0", "#c9a9a6", "#6b7a8f"],
    nota: "El color blanco está reservado para la novia.",
  },

  galeria: [
    "fotos/foto-1.svg",
    "fotos/foto-2.svg",
    "fotos/foto-3.svg",
    "fotos/foto-4.svg",
    "fotos/foto-5.svg",
  ],

  regalos: {
    mensaje: "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros:",
    mesas: [{ tienda: "Liverpool", numero: "51234567", url: "https://mesaderegalos.liverpool.com.mx/" }],
    transferencia: { banco: "Banco de ejemplo", titular: "María López Hernández", clabe: "000000000000000000" },
    nota: "También habrá lluvia de sobres el día del evento.",
  },

  // Hoteles cercanos (opcional; pon null para ocultar)
  hospedaje: null,

  confirmacion: {
    // Número de WhatsApp de quien recibe las confirmaciones: 52 + 10 dígitos
    whatsapp: "520000000000",
    fechaLimite: "1 de mayo de 2027",
    maxPersonas: 4,
  },

  // Música de fondo (opcional): pon el archivo en esta carpeta, ej. "musica.mp3"
  musica: null,

  hashtag: "#MaríaYAlejandro2027",
  despedida: "¡Te esperamos para celebrar juntos el inicio de nuestra nueva vida!",
};
