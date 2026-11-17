/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   Sirve para cumpleaños infantiles y de adultos.
   ===================================================================== */
window.EVENTO = {
  catalogo: { nombre: "Cumpleaños Fiesta", detalle: "Colorido · Para niños y adultos" },

  tipo: "cumpleanos",
  emblema: "globos",

  pretitulo: "¡Cumplo 30!",
  nombres: { principal: "Carlos" },
  frase: "¡Vamos a celebrar!",
  tituloCorto: "el cumpleaños de Carlos",

  fecha: "2027-10-12T18:00:00-06:00",
  duracionHoras: 6,

  intro: true,
  portada: { imagen: null },

  mensaje: "Treinta años se celebran en grande y quiero que estés ahí. Habrá música, comida y muchas sorpresas.",
  cita: null,

  familia: null,

  lugares: [
    {
      tipo: "La fiesta",
      nombre: "Terraza Rooftop 30",
      hora: "6:00 p.m.",
      direccion: "Roma Norte, Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Roma+Norte+CDMX",
    },
  ],

  itinerario: [
    { hora: "6:00 p.m.", actividad: "Llegada y botanas" },
    { hora: "7:30 p.m.", actividad: "Cena" },
    { hora: "8:30 p.m.", actividad: "Pastel" },
    { hora: "9:00 p.m.", actividad: "Karaoke y baile" },
  ],

  vestimenta: { codigo: "Casual · Toque neón", detalle: "Trae algo de color, ¡habrá fotos!", colores: ["#ff8a5c", "#ffd23f", "#4cc9f0", "#b388ff"], nota: null },

  galeria: ["fotos/1.svg", "fotos/2.svg", "fotos/3.svg", "fotos/4.svg", "fotos/5.svg"],

  regalos: { mensaje: "Lo más importante es que vengas. Si quieres darme algo, habrá caja de sobres.", mesas: [], transferencia: null, nota: null },

  hospedaje: null,

  confirmacion: { whatsapp: "", fechaLimite: "5 de octubre de 2027", maxPersonas: 2 },

  musica: null,

  hashtag: "#Los30DeCarlos",
  despedida: "¡Te espero para festejar en grande!",
};
