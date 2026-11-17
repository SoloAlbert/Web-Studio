/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   Este diseño sirve para bautizos, baby showers y primeras comuniones.
   ===================================================================== */
window.EVENTO = {
  catalogo: { nombre: "Bautizo Cielo", detalle: "Azul cielo · También para baby shower" },

  tipo: "bautizo",
  emblema: "nube",

  pretitulo: "Mi bautizo",
  nombres: { principal: "Mateo" },
  frase: "Acompáñanos en este día tan especial",
  tituloCorto: "el bautizo de Mateo",

  fecha: "2027-08-10T12:00:00-06:00",
  duracionHoras: 6,

  intro: true,
  portada: { imagen: null },

  mensaje: "Con mucha alegría queremos compartir contigo el día en que Mateo recibirá el sacramento del bautismo.",
  cita: { texto: "Dejen que los niños vengan a mí.", autor: "Marcos 10:14" },

  familia: [
    { titulo: "Mis papás", nombres: ["Daniela Ortiz", "Andrés Navarro"] },
    { titulo: "Mis padrinos", nombres: ["Karla Ortiz", "Miguel Salinas"] },
  ],

  lugares: [
    {
      tipo: "Ceremonia",
      nombre: "Parroquia de la Asunción",
      hora: "12:00 p.m.",
      direccion: "Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Parroquia+de+la+Asuncion+CDMX",
    },
    {
      tipo: "Recepción",
      nombre: "Terraza Las Nubes",
      hora: "2:00 p.m.",
      direccion: "Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Ciudad+de+Mexico",
    },
  ],

  itinerario: null,

  vestimenta: { codigo: "Casual elegante", detalle: "Te sugerimos colores claros.", colores: ["#dbe8f6", "#f6efe2", "#ffffff"], nota: null },

  galeria: ["fotos/1.svg", "fotos/2.svg", "fotos/3.svg", "fotos/4.svg", "fotos/5.svg"],

  regalos: {
    mensaje: "Tu cariño es el mejor regalo. Si deseas tener un detalle con Mateo:",
    mesas: [{ tienda: "Amazon", numero: null, url: "https://www.amazon.com.mx/baby-reg/homepage" }],
    transferencia: null,
    nota: null,
  },

  hospedaje: null,

  confirmacion: { whatsapp: "", fechaLimite: "1 de agosto de 2027", maxPersonas: 5 },

  musica: null,

  hashtag: null,
  despedida: "¡Tu presencia me alegra mucho!",
};
