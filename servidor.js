// Servidor local para ver las invitaciones en tu compu y en tu celular.
// Uso:  npm start   (y abre la dirección que aparece en pantalla)
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const RAIZ = path.join(__dirname, "sitio");
const PUERTO = Number(process.env.PORT) || 3000;
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let ruta;
    try {
      ruta = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    let archivo = path.normalize(path.join(RAIZ, ruta));
    if (!archivo.startsWith(RAIZ)) {
      res.writeHead(403);
      return res.end();
    }
    fs.stat(archivo, (err, st) => {
      if (!err && st.isDirectory()) {
        if (!ruta.endsWith("/")) {
          res.writeHead(301, { Location: ruta + "/" });
          return res.end();
        }
        archivo = path.join(archivo, "index.html");
      }
      fs.readFile(archivo, (e, datos) => {
        if (e) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end("No encontrado: " + ruta);
        }
        res.writeHead(200, {
          "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(datos);
      });
    });
  })
  .listen(PUERTO, "0.0.0.0", () => {
    console.log("\n  Servidor de invitaciones listo\n");
    console.log(`  En esta compu:   http://localhost:${PUERTO}/`);
    for (const lista of Object.values(os.networkInterfaces())) {
      for (const red of lista || []) {
        if (red.family === "IPv4" && !red.internal) {
          console.log(`  En tu celular:   http://${red.address}:${PUERTO}/   (misma red WiFi)`);
        }
      }
    }
    console.log("\n  Para detenerlo presiona Ctrl + C\n");
  });
