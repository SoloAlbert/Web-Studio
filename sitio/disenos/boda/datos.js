/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   - Cambia los textos entre comillas.
   - Si no quieres una sección, ponle null.
   - Las fotos van en la carpeta "fotos" de este mismo evento.
   ===================================================================== */
window.EVENTO = {
  catalogo: { nombre: "Boda Clásica", detalle: "Marfil y dorado · Personalízalo con tus datos" },

  tipo: "boda",
  emblema: "anillos", // anillos | corona | nube | birrete | globos

  pretitulo: "Nuestra boda",
  nombres: { principal: "María", conector: "&", segundo: "Alejandro" },
  frase: "¡Nos casamos!",
  tituloCorto: "la boda de María y Alejandro", // se usa en el mensaje de WhatsApp y el calendario

  // Fecha y hora del evento. "-06:00" = hora del centro de México.
  fecha: "2027-05-15T19:00:00-06:00",
  duracionHoras: 7,

  intro: true, // pantalla de bienvenida "Abrir invitación"
  portada: { imagen: null, video: null }, // imagen: "fotos/portada.jpg" · video de fondo: "portada.mp4" (corto y sin audio)

  mensaje: "Nuestra historia merece celebrarse contigo. Nos encantaría que fueras parte de este día tan especial.",
  cita: { texto: "El amor es paciente, es bondadoso… todo lo soporta.", autor: "1 Corintios 13" },

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
      direccion: "Coyoacán, Ciudad de México",
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

  // Video (opcional): { youtube: "https://youtu.be/...", titulo: "Nuestra historia" }  o  { archivo: "video.mp4" }
  // Agrega vertical: true si el video es vertical (grabado con el celular).
  video: null,

  galeria: ["fotos/1.svg", "fotos/2.svg", "fotos/3.svg", "fotos/4.svg", "fotos/5.svg"],

  regalos: {
    mensaje: "Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros:",
    // numero: número de evento de la mesa de regalos
    mesas: [{ tienda: "Liverpool", numero: null, url: "https://mesaderegalos.liverpool.com.mx/" }],
    // Para transferencia: { banco: "", titular: "", clabe: "" }
    transferencia: null,
    nota: "También habrá lluvia de sobres el día del evento.",
  },

  hospedaje: [
    { nombre: "Hoteles en Coyoacán", detalle: "Opciones a 5 minutos del salón", url: "https://www.google.com/maps/search/?api=1&query=hoteles+Coyoacan" },
  ],

  confirmacion: {
    whatsapp: "", // WhatsApp de quien recibe las confirmaciones: 52 + 10 dígitos
    fechaLimite: "1 de mayo de 2027",
    maxPersonas: 4,
  },

  musica: null, // ej. "musica.mp3" dentro de esta carpeta

  hashtag: "#MaríaYAlejandro2027",
  despedida: "¡Te esperamos para celebrar juntos el inicio de nuestra nueva vida!",
};
