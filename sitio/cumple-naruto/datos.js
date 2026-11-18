/* =====================================================================
   DATOS DEL EVENTO — este es el ÚNICO archivo que se edita por cliente.
   Fiesta infantil temática con personajes animados.
   ===================================================================== */
window.EVENTO = {
  tipo: "ninja",
  emblema: "shuriken",

  pretitulo: "¡Cumplo 4 años!",
  nombres: { principal: "Santiago" },
  frase: "¡Fiesta ninja de Naruto!",
  tituloCorto: "la fiesta de Naruto de Santiago",

  fecha: "2027-03-20T14:00:00-06:00",
  duracionHoras: 5,

  intro: true,
  textos: { intro: "Tienes una misión secreta", familia: "¡Te esperamos!", galeria: "Mis fotos", cuentaFin: "¡Hoy es la misión!" },
  portada: { imagen: null },

  mensaje: "¡Atención, ninjas! Santiago cumple 4 años y te invita a una misión muy especial: jugar, reír, romper la piñata y comer mucho pastel.",
  cita: null,

  familia: [{ titulo: "Sus papás", nombres: ["Ana López", "Luis Martínez"] }],

  lugares: [
    {
      tipo: "Cuartel ninja",
      nombre: "Jardín de Eventos Los Pinos",
      hora: "2:00 p.m.",
      direccion: "Coyoacán, Ciudad de México",
      mapa: "https://www.google.com/maps/search/?api=1&query=Coyoacan+CDMX",
    },
  ],

  itinerario: [
    { hora: "2:00 p.m.", actividad: "Llegada de los ninjas" },
    { hora: "2:30 p.m.", actividad: "Entrenamiento y juegos" },
    { hora: "4:00 p.m.", actividad: "Piñata" },
    { hora: "4:30 p.m.", actividad: "Pastel y sorpresas" },
  ],

  vestimenta: { codigo: "¡Ven vestido de ninja!", detalle: "Naranja, azul o negro. ¡Habrá premio al mejor disfraz!", colores: ["#f26b1d", "#1f2a44", "#151b2c", "#ffc94a"], nota: null },

  video: null,

  galeria: ["fotos/1.svg", "fotos/2.svg", "fotos/3.svg", "fotos/4.svg", "fotos/5.svg"],

  regalos: { mensaje: "Tu presencia es el mejor regalo. Si quieres traer algo, a Santiago le encantan los juguetes y los libros.", mesas: [], transferencia: null, nota: null },

  hospedaje: null,

  // Personajes animados. Para usar otro personaje, cambia la imagen
  // (PNG con fondo transparente, GIF, SVG o animación Lottie .json).
  // animacion: cruzar | asomarse | saltar | flotar | ninja | lanzar
  personajes: [
    { imagen: "personajes/naruto-corriendo.png", mira: "izquierda", piernas: 0.73, separa: 0.45, animacion: "cruzar", seccion: "portada", tamano: "110px" },
    { imagen: "personajes/kakashi.png", mira: "izquierda", animacion: "asomarse", asomo: 0.04, giro: 0, seccion: "mensaje", lado: "derecha", posicion: "abajo", tamano: "130px" },
    { imagen: "personajes/shuriken.svg", animacion: "lanzar", seccion: "cuenta", posicion: "arriba" },
    { imagen: "personajes/naruto.png", animacion: "ninja", seccion: "lugares", tamano: "88px" },
    { imagen: "personajes/kakashi.png", mira: "izquierda", animacion: "asomarse", asomo: 0.04, giro: 0, seccion: "vestimenta", lado: "izquierda", posicion: "abajo", tamano: "130px" },
    { imagen: "personajes/naruto.png", animacion: "saltar", seccion: "confirmar", lado: "derecha", tamano: "80px" },
    { imagen: "personajes/naruto-corriendo.png", mira: "izquierda", piernas: 0.73, separa: 0.45, animacion: "cruzar", seccion: "despedida", lado: "derecha", tamano: "100px" },
  ],

  // evento: id del evento en el panel de invitados (localconnect.studio/panel). null = sin panel.
  confirmacion: {
    evento: null,
    whatsapp: "", fechaLimite: "13 de marzo de 2027", maxPersonas: 4 },

  musica: null,

  hashtag: "#MisiónNinjaSanti",
  despedida: "¡Te espero, ninja!",
};
