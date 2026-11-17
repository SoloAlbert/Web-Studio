/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   ===================================================================== */
window.EVENTO = {
  catalogo: { nombre: "Graduación Gala", detalle: "Negro y dorado · Personalízalo con tus datos" },

  tipo: "graduacion",
  emblema: "birrete",

  pretitulo: "Mi graduación",
  nombres: { principal: "Daniela" },
  frase: "Generación 2023 – 2027",
  tituloCorto: "la graduación de Daniela",

  fecha: "2027-07-20T18:00:00-06:00",
  duracionHoras: 7,

  intro: true,
  portada: { imagen: null },

  mensaje: "Después de años de esfuerzo, desvelos y aprendizaje, llegó el momento de celebrar. Acompáñame a festejar este gran logro.",
  cita: { texto: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", autor: "Robert Collier" },

  familia: [{ titulo: "Mis papás", nombres: ["Gabriela Torres", "Héctor Vargas"] }],

  // Títulos de sección personalizados (opcional)
  textos: { familia: "Con el orgullo de" },

  lugares: [
    {
      tipo: "Ceremonia de graduación",
      nombre: "Auditorio Universitario",
      hora: "6:00 p.m.",
      direccion: "Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Ciudad+Universitaria+CDMX",
    },
    {
      tipo: "Cena de gala",
      nombre: "Salón Imperial",
      hora: "9:00 p.m.",
      direccion: "Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Ciudad+de+Mexico",
    },
  ],

  itinerario: [
    { hora: "6:00 p.m.", actividad: "Entrega de títulos" },
    { hora: "9:00 p.m.", actividad: "Cena de gala" },
    { hora: "10:30 p.m.", actividad: "Brindis" },
    { hora: "11:00 p.m.", actividad: "¡Fiesta!" },
  ],

  vestimenta: { codigo: "Etiqueta", detalle: "Vestido largo · Traje oscuro", colores: ["#121318", "#d4af37", "#f3ece0"], nota: null },

  // Video (opcional): { youtube: "https://youtu.be/...", titulo: "Nuestra historia" }  o  { archivo: "video.mp4" }
  // Agrega vertical: true si el video es vertical (grabado con el celular).
  video: null,

  galeria: ["fotos/1.svg", "fotos/2.svg", "fotos/3.svg", "fotos/4.svg", "fotos/5.svg"],

  regalos: null,
  hospedaje: null,

  // evento: id del evento en el panel de invitados (localconnect.studio/panel). null = sin panel.
  confirmacion: {
    evento: null,
    whatsapp: "", fechaLimite: "10 de julio de 2027", maxPersonas: 3 },

  musica: null,

  hashtag: "#Generación2027",
  despedida: "¡Gracias por ser parte de este logro!",
};
