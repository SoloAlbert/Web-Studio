# LocalConnect · Invitaciones web

## Ver las invitaciones en tu compu y celular
1. En VS Code abre la terminal (Ctrl + ñ) dentro de esta carpeta.
2. Escribe `npm start`
3. Abre http://localhost:3000/ en el navegador.
   En el celular (misma red WiFi) usa la dirección "En tu celular" que aparece en la terminal.
   La primera vez Windows puede preguntar por el Firewall: permite "Redes privadas".
4. Para detenerlo: Ctrl + C

## Crear la invitación de un cliente
```
npm run nuevo -- boda juan-y-ana
```
1. Edita `sitio/juan-y-ana/datos.js` (textos, fecha, lugares, WhatsApp…).
2. Cambia el `<title>` y las etiquetas `og:` en `sitio/juan-y-ana/index.html`
   (es lo que se ve al compartir el enlace por WhatsApp).
3. Pon sus fotos en `sitio/juan-y-ana/fotos/` (JPG de máx. ~300 KB cada una).
4. Revisa en http://localhost:3000/juan-y-ana/

## Pases personalizados (sin costo extra de sistema)
Agrega al final del enlace el nombre del invitado y número de pases:
```
https://tudominio.com/juan-y-ana/?invitado=Familia%20Pérez&pases=4
```
La invitación mostrará "Esta invitación es para: Familia Pérez — Pase válido para 4 personas"
y el formulario solo dejará elegir hasta 4 personas.

## Publicar cambios en localconnect.studio
Se publica solo con GitHub Pages al subir cambios a la rama `main`:
```
git add -A
git commit -m "Describe el cambio"
git push
```
En 1–2 minutos el cambio aparece en https://localconnect.studio
(el avance se ve en GitHub → repositorio → pestaña "Actions").

## Estructura
```
sitio/                     ← lo que se publica en localconnect.studio
  index.html               ← página principal / catálogo
  plantillas/comun/        ← motor (invitacion.js) y estilos base (base.css)
  plantillas/boda/tema.css ← colores y fuentes de cada tipo de evento
  demo-boda/               ← invitación de ejemplo (se copia para cada cliente)
servidor.js                ← servidor local de pruebas
nuevo-evento.js            ← comando "npm run nuevo"
docs/                      ← plan de negocio (privado: no se sube a GitHub)
.github/workflows/         ← publicación automática en GitHub Pages
```
