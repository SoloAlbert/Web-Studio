// Crea la invitación de un cliente nuevo copiando la demo de su tipo de evento.
// Uso:  npm run nuevo -- boda juan-y-ana
//       (después edita sitio/juan-y-ana/datos.js y el <title> de su index.html)
const fs = require("fs");
const path = require("path");

const [tipo, nombre] = process.argv.slice(2);
const SITIO = path.join(__dirname, "sitio");
const demos = fs
  .readdirSync(SITIO)
  .filter((d) => d.startsWith("demo-"))
  .map((d) => d.slice(5));

if (!tipo || !nombre) {
  console.log("\nUso:  npm run nuevo -- <tipo> <nombre-del-enlace>");
  console.log("Ej.:  npm run nuevo -- boda juan-y-ana");
  console.log(`Tipos disponibles: ${demos.join(", ")}\n`);
  process.exit(1);
}
if (!demos.includes(tipo)) {
  console.error(`\nNo existe la plantilla "${tipo}". Disponibles: ${demos.join(", ")}\n`);
  process.exit(1);
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(nombre)) {
  console.error("\nEl nombre del enlace solo puede llevar minúsculas, números y guiones. Ej.: xv-sofia\n");
  process.exit(1);
}
const destino = path.join(SITIO, nombre);
if (fs.existsSync(destino)) {
  console.error(`\nYa existe sitio/${nombre}. Elige otro nombre.\n`);
  process.exit(1);
}

fs.cpSync(path.join(SITIO, "demo-" + tipo), destino, { recursive: true });
console.log(`\nListo: se creó sitio/${nombre}`);
console.log(`1. Edita sitio/${nombre}/datos.js con los datos del cliente.`);
console.log(`2. Cambia el <title> y las etiquetas og: de sitio/${nombre}/index.html.`);
console.log(`3. Pon sus fotos en sitio/${nombre}/fotos/`);
console.log(`4. Pruébala con "npm start" en http://localhost:3000/${nombre}/\n`);
