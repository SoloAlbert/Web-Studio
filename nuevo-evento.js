// Crea la invitación de un cliente copiando un diseño de la colección.
// Uso:  node nuevo-evento.js boda juan-y-ana
//       → queda publicada en localconnect.studio/juan-y-ana
const fs = require("fs");
const path = require("path");

const [tipo, nombre] = process.argv.slice(2);
const SITIO = path.join(__dirname, "sitio");
const DISENOS = path.join(SITIO, "disenos");
const RESERVADOS = ["disenos", "plantillas", "assets"];
const tipos = fs.readdirSync(DISENOS).filter((d) => fs.statSync(path.join(DISENOS, d)).isDirectory());

function salir(msj) {
  console.error(`\n${msj}\n`);
  process.exit(1);
}

if (!tipo || !nombre) {
  salir(`Uso:  node nuevo-evento.js <diseño> <nombre-del-enlace>\nEj.:  node nuevo-evento.js boda juan-y-ana\nDiseños: ${tipos.join(", ")}`);
}
if (!tipos.includes(tipo)) salir(`No existe el diseño "${tipo}". Disponibles: ${tipos.join(", ")}`);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(nombre)) salir("El enlace solo puede llevar minúsculas, números y guiones. Ej.: xv-sofia");
if (RESERVADOS.includes(nombre)) salir(`"${nombre}" es un nombre reservado del sitio. Elige otro.`);

const destino = path.join(SITIO, nombre);
if (fs.existsSync(destino)) salir(`Ya existe sitio/${nombre}. Elige otro nombre.`);

fs.cpSync(path.join(DISENOS, tipo), destino, { recursive: true });

// index.html: rutas un nivel más arriba y sin la imagen de la colección
const html = path.join(destino, "index.html");
fs.writeFileSync(
  html,
  fs
    .readFileSync(html, "utf8")
    .replaceAll("../../plantillas/", "../plantillas/")
    .replace(
      /\s*<meta property="og:image"[^>]*>/,
      `\n  <!-- Foto al compartir por WhatsApp (dirección completa):\n  <meta property="og:image" content="https://localconnect.studio/${nombre}/fotos/portada.jpg"> -->`
    )
);

// datos.js: quita la barra de la colección
const datos = path.join(destino, "datos.js");
fs.writeFileSync(datos, fs.readFileSync(datos, "utf8").replace(/^\s*catalogo:.*\n\n?/m, ""));

console.log(`
Listo: se creó sitio/${nombre}

  1. Edita sitio/${nombre}/datos.js con los datos del cliente
     (no olvides su número en confirmacion.whatsapp).
  2. Cambia el <title> y las etiquetas og: de sitio/${nombre}/index.html.
  3. Cambia las fotos de sitio/${nombre}/fotos/ por las del cliente.
  4. Revísala en http://localhost:3000/${nombre}/
  5. Al publicarla quedará en https://localconnect.studio/${nombre}
`);
