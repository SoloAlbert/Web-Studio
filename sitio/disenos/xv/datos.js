/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   ===================================================================== */
window.EVENTO = {
  catalogo: { nombre: "XV Años Rosa", detalle: "Rosa y lila · Personalízalo con tus datos" },

  tipo: "xv",
  emblema: "corona",

  pretitulo: "Mis XV años",
  nombres: { principal: "Sofía" },
  frase: "¡Acompáñame a celebrar!",
  tituloCorto: "los XV años de Sofía",

  fecha: "2027-09-28T19:00:00-06:00",
  duracionHoras: 7,

  intro: true,
  portada: { imagen: null },

  mensaje: "Hay momentos que se viven una sola vez y quiero compartir este contigo. Celebremos juntos mis quince años.",
  cita: null,

  familia: [
    { titulo: "Mis papás", nombres: ["Patricia Ruiz", "Fernando Castillo"] },
    { titulo: "Mis padrinos", nombres: ["Claudia y Roberto Méndez"] },
  ],

  lugares: [
    {
      tipo: "Misa de acción de gracias",
      nombre: "Templo de Santo Domingo",
      hora: "6:00 p.m.",
      direccion: "Centro, Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Templo+de+Santo+Domingo+CDMX",
    },
    {
      tipo: "Fiesta",
      nombre: "Salón Cristal",
      hora: "8:00 p.m.",
      direccion: "Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Ciudad+de+Mexico",
    },
  ],

  itinerario: [
    { hora: "6:00 p.m.", actividad: "Misa" },
    { hora: "8:00 p.m.", actividad: "Recepción" },
    { hora: "9:00 p.m.", actividad: "Vals" },
    { hora: "9:30 p.m.", actividad: "Cena" },
    { hora: "10:30 p.m.", actividad: "Baile sorpresa" },
  ],

  vestimenta: {
    codigo: "Formal",
    detalle: "Vestido de cóctel o largo · Traje",
    colores: ["#e9c9d8", "#cdb6e3", "#f3e0c7"],
    nota: "El color rosa está reservado para la quinceañera.",
  },

  // Video (opcional): { youtube: "https://youtu.be/...", titulo: "Nuestra historia" }  o  { archivo: "video.mp4" }
  // Agrega vertical: true si el video es vertical (grabado con el celular).
  video: null,

  galeria: ["fotos/1.svg", "fotos/2.svg", "fotos/3.svg", "fotos/4.svg", "fotos/5.svg"],

  regalos: {
    mensaje: "Tu presencia es el mejor regalo. Si deseas tener un detalle conmigo, habrá lluvia de sobres.",
    mesas: [],
    transferencia: null,
    nota: null,
  },

  hospedaje: null,

  // evento: id del evento en el panel de invitados (localconnect.studio/panel). null = sin panel.
  confirmacion: {
    evento: null,
    whatsapp: "", fechaLimite: "15 de septiembre de 2027", maxPersonas: 4 },

  musica: null,

  hashtag: "#MisXVSofía",
  despedida: "¡Gracias por ser parte de mi historia! Te espero para celebrar.",
};
