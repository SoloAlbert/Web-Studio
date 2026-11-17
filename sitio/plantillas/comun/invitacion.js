/* =====================================================================
   Motor de invitaciones — LocalConnect
   Lee window.EVENTO (definido en el datos.js de cada evento) y arma la
   página completa. NO hace falta editar este archivo para cada cliente:
   solo se edita datos.js.
   ===================================================================== */
(function () {
  "use strict";

  // Datos del negocio (plantillas/comun/marca.js).
  const MARCA = Object.assign({ nombre: "LocalConnect", sitio: "https://localconnect.studio", whatsapp: "" }, window.MARCA);

  const E = window.EVENTO;
  // Diseño de la colección: muestra la barra "Quiero este diseño".
  const CAT = E && E.catalogo;
  const app = document.getElementById("app");
  if (!E || !app) {
    document.body.innerHTML =
      '<p style="padding:2rem;font-family:sans-serif">No se encontró datos.js o el contenedor #app.</p>';
    return;
  }

  // ---------- utilidades ----------
  const esc = (t) =>
    String(t == null ? "" : t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const hay = (v) => (Array.isArray(v) ? v.length > 0 : !!v);
  const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  const tz = E.zonaHoraria || "America/Mexico_City";
  const fechaEvento = new Date(E.fecha);
  const fechaValida = !isNaN(fechaEvento);

  const fmt = (opts) => new Intl.DateTimeFormat("es-MX", { timeZone: tz, ...opts });
  const fechaLarga = fechaValida
    ? fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(fechaEvento)
    : "";
  const fechaLargaTitulo = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);
  const horaEvento = fechaValida ? fmt({ hour: "numeric", minute: "2-digit", hour12: true }).format(fechaEvento) : "";
  const fechaCorta = (() => {
    if (!fechaValida) return "";
    const p = fmt({ day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(fechaEvento);
    const v = (t) => (p.find((x) => x.type === t) || {}).value;
    return `${v("day")} · ${v("month")} · ${v("year")}`;
  })();

  // Íconos de línea (SVG en línea, heredan el color del texto).
  const ICONOS = {
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mapa: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    regalo: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8C9 8 7 7 7.5 5S11 4.5 12 8zm0 0c3 0 5-1 4.5-3S13 4.5 12 8z"/>',
    vestimenta: '<path d="M9 3l3 3 3-3 4 3-2 4-2-1v12H9V9L7 10 5 6z"/>',
    musica: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    silencio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M3 3l18 18"/>',
    mensaje: '<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z"/>',
    corazon: '<path d="M12 21s-7.5-4.6-9.5-9.4C1.2 8.3 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.8 3.8 4.5 7.1C19.5 16.4 12 21 12 21z"/>',
    copiar: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    hotel: '<path d="M3 21V7l9-4 9 4v14M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"/>',
    // Emblemas de portada
    anillos: '<circle cx="9" cy="14.5" r="5.5"/><circle cx="15" cy="14.5" r="5.5"/><path d="M7 5.5L8.3 3.5h1.4L11 5.5 9 8z"/>',
    corona: '<path d="M4 18L3 8l5 4 4-7 4 7 5-4-1 10z"/><path d="M4 21h16"/><circle cx="12" cy="3" r=".8"/>',
    nube: '<path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 9.1 4.5 4.5 0 0 0 7 18z"/><path d="M19.5 2.5v3M18 4h3M4 3v2M3 4h2"/>',
    birrete: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3.5 2.6 8.5 2.6 12 0v-5M22 9v6"/>',
    globos: '<ellipse cx="9" cy="8" rx="4.2" ry="5.2"/><ellipse cx="16.2" cy="10" rx="3.4" ry="4.3"/><path d="M8.3 13.4h1.4M9 13.4c0 3 2.6 4.2 3 8.6M16.2 14.4c0 3-3.6 4.2-4.2 7.6"/>',
    flecha: '<path d="M15 18l-6-6 6-6"/>',
  };
  const icono = (n) =>
    `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ""}</svg>`;

  const seccion = (id, titulo, contenido, clase = "") =>
    `<section id="${id}" class="seccion ${clase} revelar"><div class="seccion__contenido">` +
    (titulo ? `<h2 class="titulo">${esc(titulo)}</h2><div class="divisor" aria-hidden="true"></div>` : "") +
    contenido +
    `</div></section>`;

  // Pase personalizado por enlace: ?invitado=Familia%20Pérez&pases=4
  const params = new URLSearchParams(location.search);
  const invitado = (params.get("invitado") || "").trim().slice(0, 80);
  const pases = Math.max(0, Math.min(20, parseInt(params.get("pases"), 10) || 0));

  // ---------- Panel de invitados (Firebase / Firestore) ----------
  // Se activa cuando datos.js tiene confirmacion.evento = "<id del evento en el panel>".
  const FB = window.FIREBASE_CONFIG;
  const EVENTO_ID = E.confirmacion && E.confirmacion.evento;
  const USA_PANEL = !!(FB && FB.projectId && EVENTO_ID && !CAT);
  const INV_ID = USA_PANEL && /^[A-Za-z0-9]{10,40}$/.test(params.get("i") || "") ? params.get("i") : null;
  const API = USA_PANEL
    ? `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents/eventos/${encodeURIComponent(EVENTO_ID)}`
    : "";
  const aCampos = (o) => {
    const fields = {};
    for (const [k, v] of Object.entries(o)) {
      if (v instanceof Date) fields[k] = { timestampValue: v.toISOString() };
      else if (Number.isInteger(v)) fields[k] = { integerValue: String(v) };
      else if (v === null || v === undefined) fields[k] = { nullValue: null };
      else fields[k] = { stringValue: String(v) };
    }
    return { fields };
  };
  const deCampos = (d) => {
    const o = {};
    for (const [k, v] of Object.entries((d && d.fields) || {})) {
      if ("integerValue" in v) o[k] = Number(v.integerValue);
      else if ("doubleValue" in v) o[k] = v.doubleValue;
      else if ("stringValue" in v) o[k] = v.stringValue;
      else if ("timestampValue" in v) o[k] = v.timestampValue;
      else o[k] = null;
    }
    return o;
  };
  async function api(ruta, opciones = {}, mascara) {
    const q = new URLSearchParams({ key: FB.apiKey });
    if (mascara) {
      mascara.forEach((m) => q.append("updateMask.fieldPaths", m));
      q.append("currentDocument.exists", "true");
    }
    const r = await fetch(`${API}${ruta}?${q}`, { ...opciones, headers: { "Content-Type": "application/json" } });
    if (!r.ok) throw new Error("Firestore " + r.status);
    return r.json();
  }

  // ---------- secciones ----------
  function portada() {
    const n = E.nombres || {};
    const nombres = n.segundo
      ? `<span>${esc(n.principal)}</span><span class="conector">${esc(n.conector || "&")}</span><span>${esc(n.segundo)}</span>`
      : `<span>${esc(n.principal)}</span>`;
    const p = E.portada || {};
    const fondo = p.imagen ? ` style="--portada-img:url('${encodeURI(p.imagen)}')"` : "";
    const conFoto = p.imagen || p.video;
    // Video de fondo en la portada: corto (10–20 s), sin audio y ligero (< 8 MB).
    const videoFondo = p.video
      ? `<video class="portada__video" autoplay muted loop playsinline preload="auto"${p.imagen ? ` poster="${esc(p.imagen)}"` : ""}><source src="${esc(p.video)}" type="video/mp4"></video>`
      : "";
    return `
      <header class="portada${conFoto ? " portada--foto" : ""}"${fondo}>
        ${videoFondo}
        <div class="portada__contenido">
          ${E.emblema && ICONOS[E.emblema] ? `<div class="portada__emblema">${icono(E.emblema)}</div>` : ""}
          ${E.pretitulo ? `<p class="etiqueta">${esc(E.pretitulo)}</p>` : ""}
          <h1 class="portada__nombres">${nombres}</h1>
          ${E.frase ? `<p class="portada__frase">${esc(E.frase)}</p>` : ""}
          ${fechaCorta ? `<p class="portada__fecha">${fechaCorta}</p>` : ""}
        </div>
        <a class="portada__bajar" href="#contenido" aria-label="Ver la invitación">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9l6 6 6-6"/></svg>
        </a>
      </header>`;
  }

  const textoPases = (n) => `Pase válido para <strong>${n}</strong> ${n === 1 ? "persona" : "personas"}`;

  function pase() {
    // Con enlace personal del panel, el nombre y pases llegan después (ver aplicarInvitado).
    if (!invitado && !pases && !INV_ID) return "";
    return `
      <section class="seccion pase revelar"${!invitado && !pases ? " hidden" : ""}><div class="seccion__contenido">
        <p class="etiqueta">Esta invitación es para</p>
        <p class="pase__nombre"${invitado ? "" : " hidden"}>${esc(invitado)}</p>
        <p class="pase__numero"${pases ? "" : " hidden"}>${pases ? textoPases(pases) : ""}</p>
      </div></section>`;
  }

  function mensaje() {
    if (!E.mensaje && !E.cita) return "";
    return seccion(
      "mensaje",
      "",
      `${E.mensaje ? `<p class="mensaje__texto">${esc(E.mensaje)}</p>` : ""}
       ${E.cita ? `<blockquote class="cita">${esc(E.cita.texto)}${E.cita.autor ? `<cite>${esc(E.cita.autor)}</cite>` : ""}</blockquote>` : ""}`
    );
  }

  function cuentaRegresiva() {
    if (!fechaValida) return "";
    const caja = (id, txt) => `<div class="cuenta__caja"><span class="cuenta__num" data-c="${id}">0</span><span class="cuenta__txt">${txt}</span></div>`;
    return seccion(
      "cuenta",
      E.textos?.cuenta || "Faltan",
      `<div class="cuenta" role="timer">
         ${caja("d", "Días")}${caja("h", "Horas")}${caja("m", "Min")}${caja("s", "Seg")}
       </div>
       <p class="cuenta__fin" hidden>${esc(E.textos?.cuentaFin || "¡Llegó el gran día!")}</p>
       <p class="fecha-larga">${icono("calendario")} <span>${esc(fechaLargaTitulo)}</span></p>
       <p class="fecha-larga">${icono("reloj")} <span>${esc(horaEvento)}</span></p>
       <a class="boton boton--claro" target="_blank" rel="noopener" href="${calendarioURL()}">Agregar a mi calendario</a>`,
      "seccion--suave"
    );
  }

  function familia() {
    if (!hay(E.familia)) return "";
    const grupos = E.familia
      .map(
        (g) => `<div class="familia__grupo">
          <p class="etiqueta">${esc(g.titulo)}</p>
          ${lista(g.nombres).map((x) => `<p class="familia__nombre">${esc(x)}</p>`).join("")}
        </div>`
      )
      .join("");
    return seccion("familia", E.textos?.familia || "Con la bendición de", `<div class="familia">${grupos}</div>`);
  }

  function lugares() {
    if (!hay(E.lugares)) return "";
    const tarjetas = E.lugares
      .map(
        (l) => `<article class="tarjeta">
          ${icono("mapa")}
          <p class="etiqueta">${esc(l.tipo)}</p>
          <h3 class="tarjeta__titulo">${esc(l.nombre)}</h3>
          ${l.hora ? `<p class="tarjeta__hora">${icono("reloj")} ${esc(l.hora)}</p>` : ""}
          ${l.direccion ? `<p class="tarjeta__texto">${esc(l.direccion)}</p>` : ""}
          ${l.mapa ? `<a class="boton" target="_blank" rel="noopener" href="${esc(l.mapa)}">${icono("mapa")} Ver ubicación</a>` : ""}
        </article>`
      )
      .join("");
    return seccion("lugares", E.textos?.lugares || "¿Dónde y cuándo?", `<div class="tarjetas">${tarjetas}</div>`);
  }

  function itinerario() {
    if (!hay(E.itinerario)) return "";
    const pasos = E.itinerario
      .map((p) => `<li><span class="itinerario__hora">${esc(p.hora)}</span><span class="itinerario__act">${esc(p.actividad)}</span></li>`)
      .join("");
    return seccion("itinerario", E.textos?.itinerario || "Itinerario", `<ol class="itinerario">${pasos}</ol>`, "seccion--suave");
  }

  function vestimenta() {
    const v = E.vestimenta;
    if (!v) return "";
    return seccion(
      "vestimenta",
      E.textos?.vestimenta || "Código de vestimenta",
      `${icono("vestimenta")}
       <p class="vestimenta__codigo">${esc(v.codigo)}</p>
       ${v.detalle ? `<p>${esc(v.detalle)}</p>` : ""}
       ${hay(v.colores) ? `<div class="paleta">${v.colores.map((c) => `<span style="background:${esc(c)}" title="${esc(c)}"></span>`).join("")}</div>` : ""}
       ${v.nota ? `<p class="nota">${esc(v.nota)}</p>` : ""}`
    );
  }

  function galeria() {
    if (!hay(E.galeria)) return "";
    const fotos = E.galeria
      .map((f, i) => {
        const src = typeof f === "string" ? f : f.src;
        const alt = typeof f === "string" ? `Foto ${i + 1}` : f.alt || `Foto ${i + 1}`;
        return `<button class="galeria__item" data-i="${i}" aria-label="Ver ${esc(alt)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></button>`;
      })
      .join("");
    return seccion("galeria", E.textos?.galeria || "Nuestra historia", `<div class="galeria">${fotos}</div>`, "seccion--suave");
  }

  // Video de presentación: YouTube (recomendado) o archivo MP4 en la carpeta del evento.
  function video() {
    const v = E.video;
    if (!v || (!v.youtube && !v.archivo)) return "";
    const vertical = v.vertical ? " video--vertical" : "";
    let reproductor = "";
    if (v.youtube) {
      const m = String(v.youtube).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
      if (!m) return "";
      reproductor = `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&playsinline=1" title="${esc(v.titulo || "Video")}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    } else {
      reproductor = `<video controls playsinline preload="metadata"${v.poster ? ` poster="${esc(v.poster)}"` : ""}><source src="${esc(v.archivo)}" type="video/mp4"></video>`;
    }
    return seccion(
      "video",
      v.titulo || E.textos?.video || "Nuestro video",
      `${v.texto ? `<p>${esc(v.texto)}</p>` : ""}<div class="video${vertical}">${reproductor}</div>`
    );
  }

  function regalos() {
    const r = E.regalos;
    if (!r) return "";
    const mesas = lista(r.mesas)
      .map(
        (m) => `<div class="regalo">
          <p class="regalo__tienda">${esc(m.tienda)}</p>
          ${m.numero ? `<p class="regalo__dato">Evento: <strong>${esc(m.numero)}</strong></p>` : ""}
          ${m.url ? `<a class="boton boton--claro" target="_blank" rel="noopener" href="${esc(m.url)}">Ver mesa de regalos</a>` : ""}
        </div>`
      )
      .join("");
    const t = r.transferencia;
    const transf = t
      ? `<div class="regalo">
          <p class="regalo__tienda">Transferencia</p>
          ${t.banco ? `<p class="regalo__dato">${esc(t.banco)}</p>` : ""}
          ${t.titular ? `<p class="regalo__dato">${esc(t.titular)}</p>` : ""}
          ${t.clabe ? `<p class="regalo__dato">CLABE: <strong>${esc(t.clabe)}</strong></p>
             <button class="boton boton--claro" data-copiar="${esc(t.clabe)}">${icono("copiar")} Copiar CLABE</button>` : ""}
        </div>`
      : "";
    return seccion(
      "regalos",
      E.textos?.regalos || "Mesa de regalos",
      `${icono("regalo")}
       ${r.mensaje ? `<p>${esc(r.mensaje)}</p>` : ""}
       <div class="regalos">${mesas}${transf}</div>
       ${r.nota ? `<p class="nota">${esc(r.nota)}</p>` : ""}`
    );
  }

  function hospedaje() {
    if (!hay(E.hospedaje)) return "";
    const h = E.hospedaje
      .map(
        (x) => `<div class="regalo">
          <p class="regalo__tienda">${esc(x.nombre)}</p>
          ${x.detalle ? `<p class="regalo__dato">${esc(x.detalle)}</p>` : ""}
          ${x.url ? `<a class="boton boton--claro" target="_blank" rel="noopener" href="${esc(x.url)}">Ver hotel</a>` : ""}
        </div>`
      )
      .join("");
    return seccion("hospedaje", E.textos?.hospedaje || "Hospedaje sugerido", `${icono("hotel")}<div class="regalos">${h}</div>`, "seccion--suave");
  }

  function confirmacion() {
    const c = E.confirmacion;
    if (!c || (!c.whatsapp && !CAT && !USA_PANEL)) return "";
    const opciones = opcionesPersonas(pases || c.maxPersonas || 5);
    return seccion(
      "confirmar",
      E.textos?.confirmar || "Confirma tu asistencia",
      `${c.fechaLimite ? `<p>Por favor confírmanos antes del <strong>${esc(c.fechaLimite)}</strong>.</p>` : ""}
       <form class="formulario" novalidate>
         <label>Tu nombre
           <input name="nombre" required maxlength="80" autocomplete="name" value="${esc(invitado)}" placeholder="Nombre y apellido">
         </label>
         <fieldset class="opciones">
           <legend>¿Nos acompañas?</legend>
           <label><input type="radio" name="asiste" value="si" checked> ¡Sí, ahí estaré!</label>
           <label><input type="radio" name="asiste" value="no"> No podré asistir</label>
         </fieldset>
         <label class="campo-personas">Número de personas
           <select name="personas">${opciones}</select>
         </label>
         <label>Mensaje (opcional)
           <textarea name="mensaje" rows="3" maxlength="300" placeholder="Unas palabras para ${esc(E.nombres?.segundo ? "los novios" : E.nombres?.principal || "el festejado")}"></textarea>
         </label>
         <p class="formulario__error" hidden>Escribe tu nombre para confirmar.</p>
         <button class="boton boton--grande" type="submit">${icono("mensaje")} Confirmar por WhatsApp</button>
         <p class="formulario__aviso" hidden>En tu invitación, esta confirmación te llega directo a tu WhatsApp con el nombre del invitado, cuántas personas asistirán y su mensaje.</p>
       </form>
       <div class="gracias" hidden>
         ${icono("corazon")}
         <p class="gracias__titulo"></p>
         <p class="gracias__texto"></p>
         <a class="boton boton--claro gracias__whatsapp" target="_blank" rel="noopener" hidden>${icono("mensaje")} Avisar también por WhatsApp</a>
         <button class="gracias__cambiar" type="button">Cambiar mi respuesta</button>
       </div>`
    );
  }

  function opcionesPersonas(max) {
    return Array.from({ length: Math.max(1, max) }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
  }

  function despedida() {
    return `
      <section class="seccion despedida revelar"><div class="seccion__contenido">
        ${icono("corazon")}
        ${E.despedida ? `<p class="despedida__texto">${esc(E.despedida)}</p>` : ""}
        ${E.hashtag ? `<p class="hashtag">${esc(E.hashtag)}</p>` : ""}
        <p class="portada__nombres portada__nombres--chico">${esc(E.nombres?.principal)}${E.nombres?.segundo ? ` ${esc(E.nombres.conector || "&")} ${esc(E.nombres.segundo)}` : ""}</p>
      </div></section>
      <footer class="pie">
        Invitación digital hecha por <a href="${esc(MARCA.sitio)}" target="_blank" rel="noopener">${esc(MARCA.nombre)}</a>
      </footer>`;
  }

  function enlaceWhatsApp(texto) {
    const n = String(MARCA.whatsapp || "").replace(/\D/g, "");
    return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
  }

  function barraCatalogo() {
    if (!CAT) return "";
    return `
      <nav class="barra-catalogo" aria-label="Opciones del diseño">
        <a class="barra-catalogo__volver" href="${esc(CAT.volver || "../../#disenos")}" aria-label="Ver todos los diseños">${icono("flecha")}</a>
        <div class="barra-catalogo__info">
          <strong>${esc(CAT.nombre)}</strong>
          <span>${esc(CAT.detalle || "Personalízalo con tus datos")}</span>
        </div>
        <a class="barra-catalogo__boton" target="_blank" rel="noopener"
           href="${enlaceWhatsApp(`¡Hola ${MARCA.nombre}! Me interesa el diseño "${CAT.nombre}" para mi evento. ¿Me dan información?`)}">Lo quiero</a>
      </nav>`;
  }

  function intro() {
    if (E.intro === false || params.has("directo")) return "";
    const n = E.nombres || {};
    const ini = (t) => esc((t || "").trim().charAt(0).toUpperCase());
    const iniciales = n.segundo ? `${ini(n.principal)}<span>${esc(n.conector || "&")}</span>${ini(n.segundo)}` : ini(n.principal);
    return `
      <div class="intro" role="dialog" aria-label="Abrir invitación">
        <div class="intro__sello">${iniciales}</div>
        <p class="etiqueta">${esc(E.textos?.intro || "Tienes una invitación especial")}</p>
        <button class="boton boton--grande intro__abrir">Abrir invitación</button>
      </div>`;
  }

  // ---------- armado ----------
  document.documentElement.dataset.tema = E.tipo || "boda";
  if (CAT && !params.has("directo")) document.body.classList.add("con-barra");
  app.innerHTML =
    intro() +
    `<main class="invitacion">` +
    portada() +
    `<div id="contenido">` +
    pase() + mensaje() + cuentaRegresiva() + familia() + lugares() + itinerario() +
    vestimenta() + video() + galeria() + regalos() + hospedaje() + confirmacion() + despedida() +
    `</div></main>` +
    (params.has("directo") ? "" : barraCatalogo()) +
    (E.musica ? `<button class="musica" aria-label="Música" hidden>${icono("musica")}</button><audio loop preload="none" src="${esc(E.musica)}"></audio>` : "");

  // ---------- comportamiento ----------
  // Flecha discreta para bajar a la siguiente sección
  (function flechas() {
    const secciones = Array.from(app.querySelectorAll("#contenido > .seccion"));
    const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    secciones.forEach((s, i) => {
      const sig = secciones[i + 1];
      if (!sig) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "siguiente";
      b.setAttribute("aria-label", "Ir a la siguiente sección");
      b.innerHTML = chevron;
      b.addEventListener("click", () => sig.scrollIntoView({ behavior: "smooth", block: "start" }));
      s.appendChild(b);
    });
    // Enlaces directos a una sección, ej. …/#confirmar
    if (location.hash.length > 1) {
      const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (destino) setTimeout(() => destino.scrollIntoView({ block: "start" }), 50);
    }
    const bajar = app.querySelector(".portada__bajar");
    if (bajar && secciones[0]) {
      bajar.addEventListener("click", (e) => {
        e.preventDefault();
        secciones[0].scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  })();

  // Cuenta regresiva
  (function iniciarCuenta() {
    if (!fechaValida) return;
    const el = (k) => app.querySelector(`[data-c="${k}"]`);
    const cajas = app.querySelector(".cuenta");
    const fin = app.querySelector(".cuenta__fin");
    function tic() {
      let diff = Math.max(0, fechaEvento - Date.now());
      if (diff === 0) {
        cajas.hidden = true;
        fin.hidden = false;
        return clearInterval(t);
      }
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      el("d").textContent = d;
      el("h").textContent = String(h).padStart(2, "0");
      el("m").textContent = String(m).padStart(2, "0");
      el("s").textContent = String(s).padStart(2, "0");
    }
    const t = setInterval(tic, 1000);
    tic();
  })();

  // Enlace para Google Calendar
  function calendarioURL() {
    const ini = fechaEvento;
    const finEv = new Date(ini.getTime() + (E.duracionHoras || 6) * 36e5);
    const f = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const lugar = (E.lugares && E.lugares[E.lugares.length - 1]) || {};
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: E.tituloCorto || document.title,
      dates: `${f(ini)}/${f(finEv)}`,
      location: [lugar.nombre, lugar.direccion].filter(Boolean).join(", "),
      details: location.href.split("?")[0],
    });
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }

  // Intro + música
  const audio = app.querySelector("audio");
  const btnMusica = app.querySelector(".musica");
  function alternarMusica(forzar) {
    if (!audio) return;
    const tocar = forzar !== undefined ? forzar : audio.paused;
    if (tocar) audio.play().catch(() => {});
    else audio.pause();
    btnMusica.innerHTML = icono(tocar ? "musica" : "silencio");
    btnMusica.classList.toggle("musica--pausa", !tocar);
  }
  if (btnMusica) btnMusica.addEventListener("click", () => alternarMusica());

  const intro_ = app.querySelector(".intro");
  if (intro_) {
    document.body.classList.add("bloqueado");
    intro_.querySelector(".intro__abrir").addEventListener("click", () => {
      intro_.classList.add("intro--abierta");
      document.body.classList.remove("bloqueado");
      setTimeout(() => intro_.remove(), 900);
      if (btnMusica) { btnMusica.hidden = false; alternarMusica(true); }
    });
  } else if (btnMusica) {
    btnMusica.hidden = false;
    alternarMusica(false);
  }

  // Animación al hacer scroll
  const revelables = app.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    revelables.forEach((s) => io.observe(s));
  } else revelables.forEach((s) => s.classList.add("visible"));

  // Copiar CLABE
  app.querySelectorAll("[data-copiar]").forEach((b) =>
    b.addEventListener("click", async () => {
      const original = b.innerHTML;
      try { await navigator.clipboard.writeText(b.dataset.copiar); b.textContent = "¡Copiado!"; }
      catch { b.textContent = b.dataset.copiar; }
      setTimeout(() => (b.innerHTML = original), 2000);
    })
  );

  // Galería con visor
  if (hay(E.galeria)) {
    const srcs = E.galeria.map((f) => (typeof f === "string" ? f : f.src));
    const visor = document.createElement("div");
    visor.className = "visor";
    visor.hidden = true;
    visor.innerHTML = `<button class="visor__cerrar" aria-label="Cerrar">×</button>
      <button class="visor__nav visor__ant" aria-label="Anterior">‹</button>
      <img alt=""><button class="visor__nav visor__sig" aria-label="Siguiente">›</button>`;
    document.body.appendChild(visor);
    const img = visor.querySelector("img");
    let actual = 0;
    const mostrar = (i) => { actual = (i + srcs.length) % srcs.length; img.src = srcs[actual]; };
    const cerrar = () => { visor.hidden = true; document.body.classList.remove("bloqueado"); };
    app.querySelectorAll(".galeria__item").forEach((b) =>
      b.addEventListener("click", () => { mostrar(+b.dataset.i); visor.hidden = false; document.body.classList.add("bloqueado"); })
    );
    visor.querySelector(".visor__cerrar").addEventListener("click", cerrar);
    visor.querySelector(".visor__ant").addEventListener("click", () => mostrar(actual - 1));
    visor.querySelector(".visor__sig").addEventListener("click", () => mostrar(actual + 1));
    visor.addEventListener("click", (e) => { if (e.target === visor) cerrar(); });
    document.addEventListener("keydown", (e) => {
      if (visor.hidden) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") mostrar(actual - 1);
      if (e.key === "ArrowRight") mostrar(actual + 1);
    });
    let x0 = null;
    visor.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    visor.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) mostrar(actual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // ---------- Confirmación de asistencia ----------
  const form = app.querySelector(".formulario");
  const gracias = app.querySelector(".gracias");
  const numeroAnfitrion = String((E.confirmacion && E.confirmacion.whatsapp) || "").replace(/\D/g, "");
  let invitadoPanel = null; // datos del invitado cuando llega con enlace personal (?i=...)

  function aplicarInvitado(d) {
    const sec = app.querySelector(".pase");
    if (sec) {
      const nom = sec.querySelector(".pase__nombre");
      const num = sec.querySelector(".pase__numero");
      nom.textContent = d.nombre || "";
      nom.hidden = !d.nombre;
      num.innerHTML = d.pases ? textoPases(d.pases) : "";
      num.hidden = !d.pases;
      sec.hidden = !d.nombre && !d.pases;
      sec.classList.add("visible");
    }
    if (!form) return;
    if (d.nombre) {
      form.nombre.value = d.nombre;
      form.nombre.readOnly = true;
    }
    if (d.pases) form.personas.innerHTML = opcionesPersonas(d.pases);
    if (d.respuesta === "si" || d.respuesta === "no") {
      form.asiste.value = d.respuesta;
      if (d.personas) form.personas.value = String(d.personas);
      if (d.mensaje) form.mensaje.value = d.mensaje;
      form.querySelector(".campo-personas").hidden = d.respuesta === "no";
      mostrarGracias(d.nombre, d.respuesta, d.personas, null, true);
    }
  }

  function mostrarGracias(nombre, asiste, n, txtWhatsApp, previa) {
    if (!gracias) return;
    const primer = String(nombre || "").split(" ")[0];
    gracias.querySelector(".gracias__titulo").textContent = previa
      ? `Ya registraste tu respuesta${primer ? ", " + primer : ""}`
      : `¡Gracias${primer ? ", " + primer : ""}!`;
    gracias.querySelector(".gracias__texto").textContent =
      asiste === "si"
        ? `Confirmaste tu asistencia para ${n} ${n === 1 ? "persona" : "personas"}. ¡Te esperamos!`
        : "Registramos que no podrás asistir. ¡Gracias por avisarnos!";
    const wa = gracias.querySelector(".gracias__whatsapp");
    wa.hidden = !(txtWhatsApp && numeroAnfitrion);
    if (txtWhatsApp && numeroAnfitrion) wa.href = `https://wa.me/${numeroAnfitrion}?text=${encodeURIComponent(txtWhatsApp)}`;
    form.hidden = true;
    gracias.hidden = false;
  }

  if (gracias) {
    gracias.querySelector(".gracias__cambiar").addEventListener("click", () => {
      gracias.hidden = true;
      form.hidden = false;
      form.querySelector("button[type=submit]").focus();
    });
  }

  // Enlace personal: carga nombre y pases, y registra que abrió la invitación.
  if (INV_ID) {
    api(`/invitados/${INV_ID}`)
      .then((doc) => {
        invitadoPanel = deCampos(doc);
        aplicarInvitado(invitadoPanel);
        const ahora = new Date();
        const campos = { ultimaVista: ahora };
        if (!invitadoPanel.abierto) campos.abierto = ahora;
        return api(`/invitados/${INV_ID}`, { method: "PATCH", body: JSON.stringify(aCampos(campos)) }, Object.keys(campos));
      })
      .catch(() => {});
  }

  if (form) {
    const campoPersonas = form.querySelector(".campo-personas");
    const error = form.querySelector(".formulario__error");
    const boton = form.querySelector("button[type=submit]");
    form.addEventListener("change", () => {
      campoPersonas.hidden = form.asiste.value === "no";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      if (!nombre) {
        error.textContent = "Escribe tu nombre para confirmar.";
        error.hidden = false;
        form.nombre.focus();
        return;
      }
      error.hidden = true;
      const asiste = form.asiste.value;
      const titulo = E.tituloCorto || "el evento";
      const n = asiste === "si" ? +form.personas.value : 0;
      let txt =
        asiste === "si"
          ? `¡Hola! Soy *${nombre}* y confirmo mi asistencia a ${titulo} el ${fechaLarga}. Asistiremos *${n} ${n === 1 ? "persona" : "personas"}*.`
          : `¡Hola! Soy *${nombre}*. Lamentablemente no podré asistir a ${titulo}. ¡Les deseo lo mejor!`;
      const msj = form.mensaje.value.trim();
      if (msj) txt += `\n\nMensaje: ${msj}`;

      if (CAT && !numeroAnfitrion) {
        // Diseño de la colección: se explica cómo funciona en lugar de enviar.
        form.querySelector(".formulario__aviso").hidden = false;
        return;
      }

      if (!USA_PANEL) {
        window.open(`https://wa.me/${numeroAnfitrion}?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
        return;
      }

      // Guardar en el panel de invitados
      boton.disabled = true;
      const respuesta = { respuesta: asiste, personas: n, mensaje: msj };
      const guardar =
        INV_ID && invitadoPanel
          ? api(`/invitados/${INV_ID}`, { method: "PATCH", body: JSON.stringify(aCampos({ ...respuesta, respondido: new Date() })) },
              ["respuesta", "personas", "mensaje", "respondido"])
          : api(`/respuestas`, { method: "POST", body: JSON.stringify(aCampos({ nombre: nombre.slice(0, 80), ...respuesta, creado: new Date() })) });
      guardar
        .then(() => {
          if (invitadoPanel) Object.assign(invitadoPanel, respuesta);
          mostrarGracias(nombre, asiste, n, txt, false);
        })
        .catch(() => {
          if (numeroAnfitrion) {
            window.open(`https://wa.me/${numeroAnfitrion}?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
          } else {
            error.textContent = "No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.";
            error.hidden = false;
          }
        })
        .finally(() => (boton.disabled = false));
    });
  }
})();
