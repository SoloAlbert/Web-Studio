/* =====================================================================
   Panel de invitados — LocalConnect
   Anfitriones: ven el conteo en tiempo real, agregan invitados, envían
   invitaciones y recordatorios por WhatsApp.
   Administrador: además crea eventos y asigna anfitriones.
   ===================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, serverTimestamp, writeBatch, Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const SITIO = (window.MARCA && window.MARCA.sitio) || "https://localconnect.studio";

const MENSAJE_INVITACION =
  "¡Hola {nombre}! Con mucho cariño te compartimos la invitación a {evento}. Aquí encontrarás todos los detalles y podrás confirmar tu asistencia:\n\n{enlace}";
const MENSAJE_RECORDATORIO =
  "¡Hola {nombre}! Te recordamos confirmar tu asistencia a {evento}. Solo toma un minuto:\n\n{enlace}";

const ESTADOS = {
  si: "Confirmó",
  no: "No asistirá",
  vista: "La vio, sin responder",
  enviada: "Enviada, sin abrir",
  "sin-enviar": "Sin enviar",
};
const FILTROS = [
  ["todos", "Todos"],
  ["si", "Confirmaron"],
  ["no", "No asistirán"],
  ["pendientes", "Pendientes"],
  ["vista", "La vieron"],
  ["sin-abrir", "Sin abrir"],
];

// ---------- estado ----------
const S = {
  usuario: null,
  esAdmin: false,
  eventos: [],
  evento: null,
  invitados: [],
  respuestas: [],
  filtro: "todos",
  busqueda: "",
  desuscribir: [],
  camara: null,
  fotos: [],
  desFotos: null,
};

// ---------- utilidades ----------
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
const esc = (t) =>
  String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function mostrar(vista) {
  $$(".vista").forEach((v) => (v.hidden = v.dataset.vista !== vista));
  window.scrollTo(0, 0);
}

let temporizadorAviso;
function avisar(texto, error = false) {
  const el = $(".aviso-flotante");
  el.textContent = texto;
  el.classList.toggle("aviso-flotante--error", error);
  el.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => (el.hidden = true), 3500);
}

function errorAmigable(e) {
  const c = (e && e.code) || "";
  if (c.includes("permission-denied")) return "No tienes permiso para hacer esto.";
  if (c.includes("unavailable") || c.includes("network")) return "Sin conexión. Revisa tu internet.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}

function normalizarTelefono(t) {
  let d = String(t || "").replace(/\D/g, "");
  if (d.length === 10) d = "52" + d;
  else if (d.length === 13 && d.startsWith("521")) d = "52" + d.slice(3);
  return d;
}
function telefonoBonito(t) {
  const d = String(t || "");
  const n = d.startsWith("52") && d.length === 12 ? d.slice(2) : d;
  return n.length === 10 ? `${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}` : n;
}

const correos = (texto) =>
  String(texto || "")
    .split(/[,;\s]+/)
    .map((c) => c.trim().toLowerCase())
    .filter((c) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c));

const fecha = (ts) => (ts && typeof ts.toDate === "function" ? ts.toDate() : ts ? new Date(ts) : null);
function haceCuanto(ts) {
  const d = fecha(ts);
  if (!d || isNaN(d)) return "";
  const min = Math.round((Date.now() - d) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  if (dias < 30) return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function estado(inv) {
  if (inv.respuesta === "si") return "si";
  if (inv.respuesta === "no") return "no";
  if (inv.abierto) return "vista";
  if (inv.enviado) return "enviada";
  return "sin-enviar";
}

// En la compu (servidor local) los enlaces apuntan a la versión local para revisarlos antes de publicar.
function local(u) {
  const esLocal = /^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);
  return esLocal && u.startsWith(SITIO) ? location.origin + u.slice(SITIO.length) : u;
}
function urlEvento(ev) {
  const u = local((ev && ev.url) || `${SITIO}/${ev.id}/`);
  return u.endsWith("/") ? u : u + "/";
}
const enlaceCamara = (id) => local(`${SITIO}/camara/?e=${encodeURIComponent(id)}`);
const enlaceProyeccion = (id) => local(`${SITIO}/camara/proyeccion.html?e=${encodeURIComponent(id)}`);
const enlaceInvitado = (inv) => `${urlEvento(S.evento)}?i=${inv.id}`;

function llenarMensaje(plantilla, inv) {
  return plantilla
    .replaceAll("{nombre}", inv.nombre || "")
    .replaceAll("{evento}", S.evento.nombre || "")
    .replaceAll("{pases}", String(inv.pases || ""))
    .replaceAll("{enlace}", enlaceInvitado(inv));
}
const enlaceWhatsApp = (telefono, texto) => `https://wa.me/${telefono || ""}?text=${encodeURIComponent(texto)}`;

// ---------- sesión ----------
$("[data-accion=entrar]").addEventListener("click", async () => {
  const proveedor = new GoogleAuthProvider();
  proveedor.setCustomParameters({ prompt: "select_account" });
  const err = $("[data-error-entrar]");
  err.hidden = true;
  try {
    await signInWithPopup(auth, proveedor);
  } catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, proveedor);
    } else if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
      err.textContent = e.code === "auth/unauthorized-domain"
        ? "Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados)."
        : "No se pudo iniciar sesión. Inténtalo de nuevo.";
      err.hidden = false;
    }
  }
});

$("[data-accion=salir]").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (usuario) => {
  S.desuscribir.forEach((f) => f());
  S.desuscribir = [];
  S.usuario = usuario;
  $(".usuario").hidden = !usuario;
  if (!usuario) return mostrar("entrar");
  $(".usuario__nombre").textContent = usuario.displayName || usuario.email;
  mostrar("cargando");
  try {
    await cargarEventos();
  } catch (e) {
    console.error(e);
    avisar(errorAmigable(e), true);
    mostrarSinEventos();
  }
});

async function cargarEventos() {
  try {
    S.esAdmin = (await getDoc(doc(db, "admins", S.usuario.uid))).exists();
  } catch {
    S.esAdmin = false;
  }
  const correo = (S.usuario.email || "").toLowerCase();
  const consulta = S.esAdmin
    ? collection(db, "eventos")
    : query(collection(db, "eventos"), where("anfitriones", "array-contains", correo));
  const res = await getDocs(consulta);
  S.eventos = res.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

  if (!S.esAdmin && S.eventos.length === 0) return mostrarSinEventos();
  if (!S.esAdmin && S.eventos.length === 1) return abrirEvento(S.eventos[0]);
  pintarEventos();
}

function mostrarSinEventos() {
  $("[data-correo]").textContent = S.usuario.email || "";
  $("[data-uid]").textContent = S.usuario.uid;
  mostrar("sin-eventos");
}
$("[data-accion=copiar-uid]").addEventListener("click", () =>
  navigator.clipboard.writeText(S.usuario.uid).then(() => avisar("Código copiado"))
);

// ---------- lista de eventos ----------
function pintarEventos() {
  const lista = $("[data-lista-eventos]");
  lista.innerHTML = S.eventos.length
    ? S.eventos
        .map(
          (ev) => `<button class="evento-tarjeta" data-id="${esc(ev.id)}" type="button">
            <strong>${esc(ev.nombre)}</strong>
            <span>${esc(urlEvento(ev).replace(/^https?:\/\//, ""))}</span>
            <small>${esc((ev.anfitriones || []).join(", "))}</small>
          </button>`
        )
        .join("")
    : `<p class="nota">Todavía no hay eventos. Crea el primero abajo.</p>`;
  $$(".evento-tarjeta", lista).forEach((b) =>
    b.addEventListener("click", () => abrirEvento(S.eventos.find((e) => e.id === b.dataset.id)))
  );
  $("[data-form=evento]").hidden = !S.esAdmin;
  mostrar("eventos");
}

$("[data-form=evento]").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const err = $("[data-error-evento]");
  err.hidden = true;
  const slug = f.slug.value.trim().toLowerCase();
  const anfitriones = correos(f.anfitriones.value);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    err.textContent = "El enlace solo puede llevar minúsculas, números y guiones.";
    err.hidden = false;
    return;
  }
  if (!anfitriones.length) {
    err.textContent = "Escribe al menos un correo de Google válido.";
    err.hidden = false;
    return;
  }
  try {
    const ref = doc(db, "eventos", slug);
    if ((await getDoc(ref)).exists()) {
      err.textContent = "Ya existe un evento con ese enlace.";
      err.hidden = false;
      return;
    }
    const datos = {
      nombre: f.nombre.value.trim(),
      url: `${SITIO}/${slug}/`,
      anfitriones,
      mensajeInvitacion: MENSAJE_INVITACION,
      mensajeRecordatorio: MENSAJE_RECORDATORIO,
      creado: serverTimestamp(),
    };
    await setDoc(ref, datos);
    S.eventos.push({ id: slug, ...datos });
    f.reset();
    avisar("Evento creado");
    pintarEventos();
  } catch (ex) {
    console.error(ex);
    err.textContent = errorAmigable(ex);
    err.hidden = false;
  }
});

$("[data-accion=volver]").addEventListener("click", () => {
  S.desuscribir.forEach((f) => f());
  S.desuscribir = [];
  S.evento = null;
  pintarEventos();
});

// ---------- evento ----------
function abrirEvento(ev) {
  S.desuscribir.forEach((f) => f());
  S.desuscribir = [];
  S.evento = ev;
  S.invitados = [];
  S.respuestas = [];
  S.filtro = "todos";
  S.busqueda = "";
  $("[data-buscar]").value = "";

  $("[data-evento-nombre]").textContent = ev.nombre;
  const a = $("[data-evento-url]");
  a.href = urlEvento(ev);
  a.textContent = urlEvento(ev).replace(/^https?:\/\//, "") + " ↗";
  $("[data-accion=volver]").hidden = !(S.esAdmin || S.eventos.length > 1);
  $("[data-accion=ajustes]").hidden = !S.esAdmin;
  pintarFiltros();
  mostrar("evento");

  const base = doc(db, "eventos", ev.id);
  S.desuscribir.push(
    onSnapshot(
      collection(base, "invitados"),
      (snap) => {
        S.invitados = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((x, y) => (x.nombre || "").localeCompare(y.nombre || "", "es"));
        pintarEvento();
      },
      (e) => avisar(errorAmigable(e), true)
    ),
    onSnapshot(
      collection(base, "respuestas"),
      (snap) => {
        S.respuestas = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((x, y) => (fecha(y.creado) || 0) - (fecha(x.creado) || 0));
        pintarEvento();
      },
      (e) => avisar(errorAmigable(e), true)
    ),
    onSnapshot(
      doc(db, "camaras", ev.id),
      (s) => {
        S.camara = s.exists() ? s.data() : null;
        if (S.camara && !S.desFotos) {
          S.desFotos = onSnapshot(
            collection(db, "camaras", ev.id, "fotos"),
            (snap) => {
              S.fotos = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((x, y) => (fecha(y.creado) || 0) - (fecha(x.creado) || 0));
              pintarCamara();
            },
            (e) => console.error(e)
          );
        }
        pintarCamara();
      },
      (e) => console.error(e)
    ),
    () => {
      if (S.desFotos) S.desFotos();
      S.desFotos = null;
      S.camara = null;
      S.fotos = [];
    }
  );
}

function contar() {
  const c = { si: 0, no: 0, vista: 0, enviada: 0, "sin-enviar": 0, personas: 0, pases: 0, total: S.invitados.length };
  S.invitados.forEach((inv) => {
    const e = estado(inv);
    c[e]++;
    c.pases += inv.pases || 0;
    if (e === "si") c.personas += inv.personas || 0;
  });
  S.respuestas.forEach((r) => {
    if (r.respuesta === "si") {
      c.si++;
      c.personas += r.personas || 0;
    } else if (r.respuesta === "no") c.no++;
  });
  c.pendientes = c.vista + c.enviada + c["sin-enviar"];
  return c;
}

function pintarEvento() {
  const c = contar();
  $("[data-resumen]").innerHTML = `
    <div class="dato dato--principal">
      <span class="dato__valor">${c.personas}</span>
      <span class="dato__etiqueta">personas confirmadas</span>
      <span class="dato__extra">de ${c.pases} lugares enviados</span>
    </div>
    <div class="dato dato--si"><span class="dato__valor">${c.si}</span><span class="dato__etiqueta">confirmaron</span></div>
    <div class="dato dato--no"><span class="dato__valor">${c.no}</span><span class="dato__etiqueta">no asistirán</span></div>
    <div class="dato dato--pendiente">
      <span class="dato__valor">${c.pendientes}</span><span class="dato__etiqueta">pendientes</span>
      <span class="dato__extra">${c.vista} la vieron · ${c.enviada + c["sin-enviar"]} sin abrir</span>
    </div>`;
  pintarFiltros(c);
  pintarInvitados();
  pintarRespuestas();
}

function pintarFiltros(c = contar()) {
  const n = {
    todos: c.total,
    si: S.invitados.filter((i) => estado(i) === "si").length,
    no: S.invitados.filter((i) => estado(i) === "no").length,
    pendientes: c.pendientes,
    vista: c.vista,
    "sin-abrir": c.enviada + c["sin-enviar"],
  };
  const cont = $("[data-filtros]");
  cont.innerHTML = FILTROS.map(
    ([k, t]) =>
      `<button type="button" role="tab" aria-selected="${S.filtro === k}" data-filtro="${k}">${t} <span>${n[k]}</span></button>`
  ).join("");
  $$("[data-filtro]", cont).forEach((b) =>
    b.addEventListener("click", () => {
      S.filtro = b.dataset.filtro;
      pintarFiltros(c);
      pintarInvitados();
    })
  );
}

$("[data-buscar]").addEventListener("input", (e) => {
  S.busqueda = e.target.value.trim().toLowerCase();
  pintarInvitados();
});

function pasaFiltro(inv) {
  const e = estado(inv);
  const okFiltro =
    S.filtro === "todos" ||
    S.filtro === e ||
    (S.filtro === "pendientes" && ["vista", "enviada", "sin-enviar"].includes(e)) ||
    (S.filtro === "sin-abrir" && ["enviada", "sin-enviar"].includes(e));
  const okBusqueda = !S.busqueda || (inv.nombre || "").toLowerCase().includes(S.busqueda) || (inv.telefono || "").includes(S.busqueda);
  return okFiltro && okBusqueda;
}

function pintarInvitados() {
  const lista = $("[data-lista-invitados]");
  const visibles = S.invitados.filter(pasaFiltro);
  if (!S.invitados.length) {
    lista.innerHTML = `<p class="vacio">Aún no hay invitados. Agrégalos arriba para generar su enlace personal.</p>`;
    return;
  }
  if (!visibles.length) {
    lista.innerHTML = `<p class="vacio">No hay invitados en esta lista.</p>`;
    return;
  }
  lista.innerHTML = visibles
    .map((inv) => {
      const e = estado(inv);
      const pendiente = !["si", "no"].includes(e);
      const detalle =
        e === "si"
          ? `${inv.personas || 0} de ${inv.pases || 0} ${inv.pases === 1 ? "lugar" : "lugares"} · ${haceCuanto(inv.respondido)}`
          : e === "no"
          ? haceCuanto(inv.respondido)
          : e === "vista"
          ? `Abrió ${haceCuanto(inv.ultimaVista || inv.abierto)}${inv.recordado ? ` · recordado ${haceCuanto(inv.recordado)}` : ""}`
          : e === "enviada"
          ? `Enviada ${haceCuanto(inv.enviado)}${inv.recordado ? ` · recordado ${haceCuanto(inv.recordado)}` : ""}`
          : "";
      return `<article class="invitado" data-id="${inv.id}">
        <div class="invitado__info">
          <div class="invitado__fila">
            <strong>${esc(inv.nombre)}</strong>
            <span class="estado estado--${e}">${ESTADOS[e]}</span>
          </div>
          <p class="invitado__datos">
            ${inv.telefono ? `${esc(telefonoBonito(inv.telefono))} · ` : ""}${inv.pases || 0} ${inv.pases === 1 ? "pase" : "pases"}${detalle ? ` · ${esc(detalle)}` : ""}
          </p>
          ${inv.mensaje ? `<p class="invitado__mensaje">“${esc(inv.mensaje)}”</p>` : ""}
        </div>
        <div class="invitado__acciones">
          ${
            e === "sin-enviar"
              ? `<button class="boton boton--chico boton--wa" data-accion="enviar" type="button">Enviar invitación</button>`
              : pendiente
              ? `<button class="boton boton--chico boton--wa" data-accion="recordar" type="button">Recordar</button>`
              : ""
          }
          <button class="icono-boton" data-accion="copiar" type="button" title="Copiar enlace" aria-label="Copiar enlace de ${esc(inv.nombre)}">
            <svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
          <button class="icono-boton" data-accion="qr" type="button" title="Código QR" aria-label="Código QR de ${esc(inv.nombre)}">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/></svg></button>
          <button class="icono-boton" data-accion="editar" type="button" title="Editar" aria-label="Editar a ${esc(inv.nombre)}">
            <svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
          <button class="icono-boton icono-boton--peligro" data-accion="eliminar" type="button" title="Eliminar" aria-label="Eliminar a ${esc(inv.nombre)}">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
        </div>
      </article>`;
    })
    .join("");
}

$("[data-lista-invitados]").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-accion]");
  if (!b) return;
  const inv = S.invitados.find((i) => i.id === b.closest(".invitado").dataset.id);
  if (!inv) return;
  const ref = doc(db, "eventos", S.evento.id, "invitados", inv.id);
  const accion = b.dataset.accion;

  if (accion === "enviar" || accion === "recordar") {
    const plantilla =
      accion === "enviar"
        ? S.evento.mensajeInvitacion || MENSAJE_INVITACION
        : S.evento.mensajeRecordatorio || MENSAJE_RECORDATORIO;
    window.open(enlaceWhatsApp(inv.telefono, llenarMensaje(plantilla, inv)), "_blank", "noopener");
    updateDoc(ref, accion === "enviar" ? { enviado: serverTimestamp() } : { recordado: serverTimestamp() }).catch((x) =>
      avisar(errorAmigable(x), true)
    );
  } else if (accion === "copiar") {
    navigator.clipboard.writeText(enlaceInvitado(inv)).then(
      () => avisar("Enlace copiado"),
      () => avisar(enlaceInvitado(inv))
    );
  } else if (accion === "qr") {
    abrirQR(inv);
  } else if (accion === "editar") {
    abrirEditar(inv, ref);
  } else if (accion === "eliminar") {
    if (await confirmar(`¿Eliminar a ${inv.nombre}?`, "Su enlace personal dejará de funcionar y se borrará su respuesta.")) {
      deleteDoc(ref).then(() => avisar("Invitado eliminado"), (x) => avisar(errorAmigable(x), true));
    }
  }
});

// ---------- agregar invitados ----------
const datosInvitado = (nombre, telefono, pases) => ({
  nombre: String(nombre).trim().slice(0, 80),
  telefono: normalizarTelefono(telefono),
  pases: Math.max(1, Math.min(20, parseInt(pases, 10) || 1)),
  respuesta: null,
  personas: 0,
  mensaje: "",
  abierto: null,
  ultimaVista: null,
  respondido: null,
  enviado: null,
  recordado: null,
  creado: serverTimestamp(),
});

$("[data-form=invitado]").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await addDoc(collection(db, "eventos", S.evento.id, "invitados"), datosInvitado(f.nombre.value, f.telefono.value, f.pases.value));
    avisar(`${f.nombre.value.trim()} agregado`);
    const pases = f.pases.value;
    f.reset();
    f.pases.value = pases;
    f.nombre.focus();
  } catch (x) {
    avisar(errorAmigable(x), true);
  }
});

$("[data-form=importar]").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const renglones = f.lista.value
    .split(/\r?\n/)
    .map((r) => r.split(/[,;\t]/).map((x) => x.trim()))
    .filter((r) => r[0]);
  if (!renglones.length) return;
  const res = $("[data-resultado-importar]");
  try {
    for (let i = 0; i < renglones.length; i += 400) {
      const lote = writeBatch(db);
      renglones.slice(i, i + 400).forEach(([nombre, tel, pases]) => {
        lote.set(doc(collection(db, "eventos", S.evento.id, "invitados")), datosInvitado(nombre, tel, pases || 1));
      });
      await lote.commit();
    }
    res.textContent = `Se agregaron ${renglones.length} invitados.`;
    res.hidden = false;
    f.reset();
  } catch (x) {
    avisar(errorAmigable(x), true);
  }
});

// ---------- respuestas generales ----------
function pintarRespuestas() {
  const caja = $("[data-respuestas]");
  caja.hidden = !S.respuestas.length;
  $("[data-lista-respuestas]").innerHTML = S.respuestas
    .map(
      (r) => `<article class="invitado" data-respuesta="${r.id}">
        <div class="invitado__info">
          <div class="invitado__fila">
            <strong>${esc(r.nombre)}</strong>
            <span class="estado estado--${r.respuesta === "si" ? "si" : "no"}">${r.respuesta === "si" ? "Confirmó" : "No asistirá"}</span>
          </div>
          <p class="invitado__datos">${r.respuesta === "si" ? `${r.personas || 0} ${r.personas === 1 ? "persona" : "personas"} · ` : ""}${esc(haceCuanto(r.creado))}</p>
          ${r.mensaje ? `<p class="invitado__mensaje">“${esc(r.mensaje)}”</p>` : ""}
        </div>
        <div class="invitado__acciones">
          <button class="icono-boton icono-boton--peligro" data-accion="eliminar-respuesta" type="button" aria-label="Eliminar respuesta de ${esc(r.nombre)}">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
        </div>
      </article>`
    )
    .join("");
}

$("[data-lista-respuestas]").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-accion=eliminar-respuesta]");
  if (!b) return;
  const id = b.closest("[data-respuesta]").dataset.respuesta;
  const r = S.respuestas.find((x) => x.id === id);
  if (r && (await confirmar(`¿Eliminar la respuesta de ${r.nombre}?`, "Úsalo para quitar respuestas duplicadas."))) {
    deleteDoc(doc(db, "eventos", S.evento.id, "respuestas", id)).catch((x) => avisar(errorAmigable(x), true));
  }
});

// ---------- ventanas ----------
function abrirVentana(nombre) {
  const v = $(`[data-ventana=${nombre}]`);
  v.showModal();
  return new Promise((ok) => v.addEventListener("close", () => ok(v.returnValue), { once: true }));
}

function confirmar(titulo, texto, boton = "Eliminar") {
  $("[data-confirmar-titulo]").textContent = titulo;
  $("[data-confirmar-texto]").textContent = texto;
  const b = $("[data-ventana=confirmar] [value=si]");
  b.textContent = boton;
  b.classList.toggle("boton--peligro", boton === "Eliminar");
  return abrirVentana("confirmar").then((r) => r === "si");
}

async function abrirEditar(inv, ref) {
  const f = $("[data-form=editar]");
  f.nombre.value = inv.nombre || "";
  f.telefono.value = telefonoBonito(inv.telefono);
  f.pases.value = inv.pases || 1;
  if ((await abrirVentana("editar")) !== "guardar") return;
  updateDoc(ref, {
    nombre: f.nombre.value.trim().slice(0, 80) || inv.nombre,
    telefono: normalizarTelefono(f.telefono.value),
    pases: Math.max(1, Math.min(20, parseInt(f.pases.value, 10) || 1)),
  }).then(() => avisar("Cambios guardados"), (x) => avisar(errorAmigable(x), true));
}

$("[data-accion=mensajes]").addEventListener("click", async () => {
  const f = $("[data-form=mensajes]");
  f.mensajeInvitacion.value = S.evento.mensajeInvitacion || MENSAJE_INVITACION;
  f.mensajeRecordatorio.value = S.evento.mensajeRecordatorio || MENSAJE_RECORDATORIO;
  if ((await abrirVentana("mensajes")) !== "guardar") return;
  const cambios = {
    mensajeInvitacion: f.mensajeInvitacion.value.trim() || MENSAJE_INVITACION,
    mensajeRecordatorio: f.mensajeRecordatorio.value.trim() || MENSAJE_RECORDATORIO,
  };
  updateDoc(doc(db, "eventos", S.evento.id), cambios).then(
    () => {
      Object.assign(S.evento, cambios);
      avisar("Mensajes guardados");
    },
    (x) => avisar(errorAmigable(x), true)
  );
});

$("[data-accion=ajustes]").addEventListener("click", async () => {
  const f = $("[data-form=ajustes]");
  f.nombre.value = S.evento.nombre || "";
  f.url.value = urlEvento(S.evento);
  f.anfitriones.value = (S.evento.anfitriones || []).join(", ");
  f.camara.value = S.camara && S.camara.activa !== false ? String(S.camara.fotos) : "0";
  if ((await abrirVentana("ajustes")) !== "guardar") return;
  guardarCamara(parseInt(f.camara.value, 10) || 0, f.nombre.value.trim());
  const anfitriones = correos(f.anfitriones.value);
  if (!anfitriones.length) return avisar("Escribe al menos un correo válido.", true);
  const cambios = { nombre: f.nombre.value.trim(), url: f.url.value.trim(), anfitriones };
  updateDoc(doc(db, "eventos", S.evento.id), cambios).then(
    () => {
      Object.assign(S.evento, cambios);
      abrirEvento(S.evento);
      avisar("Ajustes guardados");
    },
    (x) => avisar(errorAmigable(x), true)
  );
});

function abrirQR(inv, enlace, titulo, archivo) {
  enlace = enlace || enlaceInvitado(inv);
  titulo = titulo || inv.nombre;
  archivo = archivo || `QR-${(inv.nombre || "invitado").replace(/[^\wáéíóúñ-]+/gi, "-")}`;
  $("[data-qr-nombre]").textContent = titulo;
  $("[data-qr-enlace]").textContent = enlace;
  if (typeof window.qrcode !== "function") {
    $("[data-qr]").textContent = "No se pudo cargar el generador de QR. Revisa tu conexión.";
  } else {
    const qr = window.qrcode(0, "M");
    qr.addData(enlace);
    qr.make();
    const url = qr.createDataURL(10, 20);
    $("[data-qr]").innerHTML = `<img src="${url}" alt="Código QR: ${esc(titulo)}">`;
    const a = $("[data-qr-descargar]");
    a.href = url;
    a.download = `${archivo}.gif`;
  }
  abrirVentana("qr");
}

// ---------- exportar ----------
$("[data-accion=exportar]").addEventListener("click", () => {
  const celda = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const f = (ts) => {
    const d = fecha(ts);
    return d && !isNaN(d) ? d.toLocaleString("es-MX") : "";
  };
  const filas = [["Nombre", "WhatsApp", "Pases", "Estado", "Personas confirmadas", "Mensaje", "Abrió", "Respondió", "Enlace personal"]];
  S.invitados.forEach((inv) =>
    filas.push([
      inv.nombre, telefonoBonito(inv.telefono), inv.pases, ESTADOS[estado(inv)],
      inv.respuesta === "si" ? inv.personas : 0, inv.mensaje, f(inv.abierto), f(inv.respondido), enlaceInvitado(inv),
    ])
  );
  S.respuestas.forEach((r) =>
    filas.push([r.nombre, "", "", r.respuesta === "si" ? "Confirmó (enlace general)" : "No asistirá (enlace general)",
      r.respuesta === "si" ? r.personas : 0, r.mensaje, "", f(r.creado), ""])
  );
  const csv = "﻿" + filas.map((r) => r.map(celda).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `invitados-${S.evento.id}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
});

// ---------- cámara de invitados ----------
async function guardarCamara(fotos, nombre) {
  const ref = doc(db, "camaras", S.evento.id);
  try {
    if (fotos > 0) {
      await setDoc(ref, { nombre: nombre || S.evento.nombre, fotos, activa: true, ...(S.camara ? {} : { revelar: null }) }, { merge: true });
    } else if (S.camara) {
      await updateDoc(ref, { activa: false });
    }
  } catch (x) {
    avisar(errorAmigable(x), true);
  }
}

const aFechaLocal = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function pintarCamara() {
  const caja = $("[data-camara]");
  const c = S.camara;
  caja.hidden = !c;
  if (!c) return;
  const activa = c.activa !== false;
  const est = $("[data-camara-estado]");
  est.className = `estado estado--${activa ? "si" : "sin-enviar"}`;
  est.textContent = activa ? "Activa" : "Cerrada";

  const personas = new Set(S.fotos.map((f) => f.uid)).size;
  const ocultas = S.fotos.filter((f) => f.oculta).length;
  $("[data-camara-resumen]").textContent =
    `${c.fotos} fotos por invitado · ${S.fotos.length} ${S.fotos.length === 1 ? "foto" : "fotos"} de ${personas} ${personas === 1 ? "invitado" : "invitados"}` +
    (ocultas ? ` · ${ocultas} ${ocultas === 1 ? "oculta" : "ocultas"}` : "");
  $("[data-camara-proyeccion]").href = enlaceProyeccion(S.evento.id);

  const r = fecha(c.revelar);
  const input = $("[data-form=revelar]").revelar;
  if (document.activeElement !== input) input.value = r ? aFechaLocal(r) : "";
  $("[data-camara-revelado]").textContent = !r
    ? "Aún no eligen la hora del revelado: las fotos siguen ocultas para los invitados."
    : r <= new Date()
    ? "✓ Las fotos ya están reveladas: los invitados y la proyección pueden verlas."
    : `Se revelan el ${r.toLocaleString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}.`;

  $("[data-camara-fotos]").innerHTML = S.fotos.length
    ? S.fotos
        .map(
          (f) => `<figure class="foto-panel${f.oculta ? " foto-panel--oculta" : ""}" data-foto="${esc(f.id)}">
            <a href="${esc(f.url)}" target="_blank" rel="noopener"><img src="${esc(f.url)}" alt="Foto de ${esc(f.nombre)}" loading="lazy"></a>
            <figcaption>
              <span>${esc(f.nombre)}</span>
              <button class="enlace" data-accion="ocultar-foto" type="button">${f.oculta ? "Mostrar" : "Ocultar"}</button>
            </figcaption>
          </figure>`
        )
        .join("")
    : `<p class="vacio">Aún no hay fotos. Imprime el QR para las mesas y los invitados empezarán a tomarlas.</p>`;
}

$("[data-form=revelar]").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = e.target.revelar.value;
  const valor = v ? Timestamp.fromDate(new Date(v)) : null;
  updateDoc(doc(db, "camaras", S.evento.id), { revelar: valor }).then(
    () => avisar(v ? "Hora del revelado guardada" : "Hora del revelado quitada"),
    (x) => avisar(errorAmigable(x), true)
  );
});

$("[data-accion=revelar-ahora]").addEventListener("click", async () => {
  if (!(await confirmar("¿Revelar las fotos ahora?", "Todos los invitados y la pantalla de proyección podrán verlas desde este momento.", "Revelar"))) return;
  updateDoc(doc(db, "camaras", S.evento.id), { revelar: serverTimestamp() }).then(
    () => avisar("¡Fotos reveladas!"),
    (x) => avisar(errorAmigable(x), true)
  );
});

$("[data-accion=camara-qr]").addEventListener("click", () =>
  abrirQR(null, enlaceCamara(S.evento.id), "Cámara del evento", `QR-camara-${S.evento.id}`)
);

$("[data-camara-fotos]").addEventListener("click", (e) => {
  const b = e.target.closest("[data-accion=ocultar-foto]");
  if (!b) return;
  const f = S.fotos.find((x) => x.id === b.closest("[data-foto]").dataset.foto);
  if (!f) return;
  updateDoc(doc(db, "camaras", S.evento.id, "fotos", f.id), { oculta: !f.oculta }).then(
    () => avisar(f.oculta ? "La foto se volverá a mostrar" : "Foto oculta: no aparecerá en la proyección"),
    (x) => avisar(errorAmigable(x), true)
  );
});

$("[data-accion=camara-descargar]").addEventListener("click", async (e) => {
  const fotos = S.fotos.filter((f) => !f.oculta);
  if (!fotos.length) return avisar("Aún no hay fotos para descargar.");
  const b = e.currentTarget;
  b.disabled = true;
  const texto = b.textContent;
  try {
    if (!window.JSZip) {
      await new Promise((ok, mal) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        s.onload = ok;
        s.onerror = mal;
        document.head.appendChild(s);
      });
    }
    const zip = new window.JSZip();
    const usados = {};
    for (let i = 0; i < fotos.length; i++) {
      b.textContent = `Descargando ${i + 1} de ${fotos.length}…`;
      const f = fotos[i];
      const base = (f.nombre || "invitado").replace(/[^\wáéíóúñ-]+/gi, "-");
      usados[base] = (usados[base] || 0) + 1;
      const r = await fetch(f.url);
      if (!r.ok) throw new Error("descarga");
      zip.file(`${base}-${usados[base]}.jpg`, await r.blob());
    }
    b.textContent = "Preparando archivo…";
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fotos-${S.evento.id}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 2000);
  } catch (x) {
    console.error(x);
    avisar("No se pudieron descargar las fotos. Revisa tu conexión e inténtalo de nuevo.", true);
  } finally {
    b.disabled = false;
    b.textContent = texto;
  }
});
