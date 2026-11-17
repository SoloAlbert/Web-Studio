# LocalConnect · Invitaciones digitales

Sitio: https://localconnect.studio

## Ver el sitio en tu compu y celular
1. En VS Code abre la terminal (Ctrl + ñ) dentro de esta carpeta.
2. Escribe `node servidor.js`
3. Abre http://localhost:3000/ en el navegador.
   En el celular (misma red WiFi) usa la dirección "En tu celular" que aparece en la terminal.
4. Para detenerlo: Ctrl + C

## Datos del negocio (WhatsApp y redes)
Se cambian una sola vez en `sitio/plantillas/comun/marca.js`
y se actualizan en todo el sitio y en todas las invitaciones.

## Crear la invitación de un cliente
```
node nuevo-evento.js boda juan-y-ana
```
Diseños disponibles: boda, xv, bautizo, graduacion, cumpleanos

1. Edita `sitio/juan-y-ana/datos.js` (textos, fecha, lugares y su WhatsApp en `confirmacion`).
2. Cambia el `<title>` y las etiquetas `og:` en `sitio/juan-y-ana/index.html`
   (es lo que se ve al compartir el enlace por WhatsApp).
3. Cambia las fotos de `sitio/juan-y-ana/fotos/` por las del cliente (JPG de máx. ~300 KB).
4. Revisa en http://localhost:3000/juan-y-ana/
5. Al publicar queda en https://localconnect.studio/juan-y-ana

## Pases personalizados
Agrega al final del enlace el nombre del invitado y número de pases:
```
https://localconnect.studio/juan-y-ana/?invitado=Familia%20Pérez&pases=4
```

## Publicar cambios en localconnect.studio
```
git add -A
git commit -m "Describe el cambio"
git push
```
En 1–2 minutos el cambio aparece en el sitio (avance en GitHub → pestaña "Actions").

## Estructura
```
sitio/                       ← todo lo que se publica
  index.html                 ← página principal de LocalConnect
  assets/                    ← estilos, logo y vistas previas del sitio
  disenos/<tipo>/            ← colección de diseños (base para cada cliente)
  plantillas/comun/          ← motor de invitaciones, estilos base y marca.js
  plantillas/<tipo>/tema.css ← colores y tipografías de cada tipo de evento
  <cliente>/                 ← invitaciones de clientes
servidor.js                  ← servidor local
nuevo-evento.js              ← crea la invitación de un cliente
docs/                        ← documentos privados (no se suben)
.github/workflows/           ← publicación automática
```
