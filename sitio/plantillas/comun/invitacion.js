/* =====================================================================
   Motor de invitaciones — LocalConnect
   Lee window.EVENTO (definido en el datos.js de cada evento) y arma la
   página completa. NO hace falta editar este archivo para cada cliente:
   solo se edita datos.js.
   ===================================================================== */
(function () {
  "use strict";

  // Datos de tu marca (aparecen en el pie de cada invitación).
  const MARCA = { nombre: "LocalConnect", url: "/" };

  const E = window.EVENTO;
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
  };
  const icono = (n) =>
    `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n] || ""}</svg>`;

  const seccion = (id, titulo, contenido, clase = "") =>
    `<section id="${id}" class="seccion ${clase} revelar">` +
    (titulo ? `<h2 class="titulo">${esc(titulo)}</h2><div class="divisor" aria-hidden="true"></div>` : "") +
    contenido +
    `</section>`;

  // Pase personalizado por enlace: ?invitado=Familia%20Pérez&pases=4
  const params = new URLSearchParams(location.search);
  const invitado = (params.get("invitado") || "").trim().slice(0, 80);
  const pases = Math.max(0, Math.min(20, parseInt(params.get("pases"), 10) || 0));

  // ---------- secciones ----------
  function portada() {
    const n = E.nombres || {};
    const nombres = n.segundo
      ? `<span>${esc(n.principal)}</span><span class="conector">${esc(n.conector || "&")}</span><span>${esc(n.segundo)}</span>`
      : `<span>${esc(n.principal)}</span>`;
    const fondo = E.portada && E.portada.imagen
      ? ` style="--portada-img:url('${encodeURI(E.portada.imagen)}')"`
      : "";
    return `
      <header class="portada${fondo ? " portada--foto" : ""}"${fondo}>
        <div class="portada__contenido">
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

  function pase() {
    if (!invitado && !pases) return "";
    return `
      <section class="seccion pase revelar">
        <p class="etiqueta">Esta invitación es para</p>
        ${invitado ? `<p class="pase__nombre">${esc(invitado)}</p>` : ""}
        ${pases ? `<p class="pase__numero">Pase válido para <strong>${pases}</strong> ${pases === 1 ? "persona" : "personas"}</p>` : ""}
      </section>`;
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
       <p class="fecha-larga">${icono("calendario")} <span>${esc(fechaLarga)}</span></p>
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
    if (!c || !c.whatsapp) return "";
    const max = pases || c.maxPersonas || 5;
    const opciones = Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
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
       </form>`
    );
  }

  function despedida() {
    return `
      <section class="seccion despedida revelar">
        ${icono("corazon")}
        ${E.despedida ? `<p class="despedida__texto">${esc(E.despedida)}</p>` : ""}
        ${E.hashtag ? `<p class="hashtag">${esc(E.hashtag)}</p>` : ""}
        <p class="portada__nombres portada__nombres--chico">${esc(E.nombres?.principal)}${E.nombres?.segundo ? ` ${esc(E.nombres.conector || "&")} ${esc(E.nombres.segundo)}` : ""}</p>
      </section>
      <footer class="pie">
        Invitación digital hecha por <a href="${esc(MARCA.url)}" target="_blank" rel="noopener">${esc(MARCA.nombre)}</a>
      </footer>`;
  }

  function intro() {
    if (E.intro === false) return "";
    const n = E.nombres || {};
    const iniciales = n.segundo ? `${(n.principal || "")[0] || ""}<span>${esc(n.conector || "&")}</span>${(n.segundo || "")[0] || ""}` : esc(n.principal || "");
    return `
      <div class="intro" role="dialog" aria-label="Abrir invitación">
        <div class="intro__sello">${iniciales}</div>
        <p class="etiqueta">${esc(E.textos?.intro || "Tienes una invitación especial")}</p>
        <button class="boton boton--grande intro__abrir">Abrir invitación</button>
      </div>`;
  }

  // ---------- armado ----------
  document.documentElement.dataset.tema = E.tipo || "boda";
  app.innerHTML =
    intro() +
    `<main class="invitacion">` +
    portada() +
    `<div id="contenido">` +
    pase() + mensaje() + cuentaRegresiva() + familia() + lugares() + itinerario() +
    vestimenta() + galeria() + regalos() + hospedaje() + confirmacion() + despedida() +
    `</div></main>` +
    (E.musica ? `<button class="musica" aria-label="Música" hidden>${icono("musica")}</button><audio loop preload="none" src="${esc(E.musica)}"></audio>` : "");

  // ---------- comportamiento ----------
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

  // Confirmación por WhatsApp
  const form = app.querySelector(".formulario");
  if (form) {
    const campoPersonas = form.querySelector(".campo-personas");
    const error = form.querySelector(".formulario__error");
    form.addEventListener("change", () => {
      campoPersonas.hidden = form.asiste.value === "no";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      if (!nombre) { error.hidden = false; form.nombre.focus(); return; }
      error.hidden = true;
      const titulo = E.tituloCorto || "el evento";
      const n = +form.personas.value;
      let txt =
        form.asiste.value === "si"
          ? `¡Hola! Soy *${nombre}* y confirmo mi asistencia a ${titulo} el ${fechaLarga}. Asistiremos *${n} ${n === 1 ? "persona" : "personas"}*.`
          : `¡Hola! Soy *${nombre}*. Lamentablemente no podré asistir a ${titulo}. ¡Les deseo lo mejor!`;
      const msj = form.mensaje.value.trim();
      if (msj) txt += `\n\nMensaje: ${msj}`;
      const numero = String(E.confirmacion.whatsapp).replace(/\D/g, "");
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
    });
  }
})();
