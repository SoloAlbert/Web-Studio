/* =====================================================================
   Proyección de la cámara del evento — LocalConnect
   Antes del revelado: QR grande + cuenta regresiva.
   Después: carrusel en pantalla completa; las fotos nuevas aparecen en vivo.
   Enlace: localconnect.studio/camara/proyeccion.html?e=<evento>
   ===================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, collection, query, where, onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const ID = (new URLSearchParams(location.search).get("e") || "").trim().toLowerCase();
const SEGUNDOS = 7;

const S = { cam: null, fotos: [], vistas: new Set(), actual: -1, timer: null, desFotos: null };

const app = initializeApp(window.FIREBASE_CONFIG);
const db = getFirestore(app);

const fechaRevelar = () => (S.cam && S.cam.revelar && S.cam.revelar.toDate ? S.cam.revelar.toDate() : null);
const revelado = () => {
  const f = fechaRevelar();
  return !!f && Date.now() >= f.getTime();
};

// QR hacia la cámara (misma dirección donde está abierta esta página).
const enlaceCamara = new URL(`./?e=${encodeURIComponent(ID)}`, location.href).href;
function qr(tam) {
  if (typeof window.qrcode !== "function") return "";
  const q = window.qrcode(0, "M");
  q.addData(enlaceCamara);
  q.make();
  return q.createDataURL(tam, tam * 2);
}
const qrGrande = qr(10);
if (qrGrande) {
  $("[data-qr]").innerHTML = `<img src="${qrGrande}" alt="Código QR de la cámara">`;
  $("[data-qr]").hidden = false;
  $("[data-qr-chico]").src = qr(6);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ID)) {
  $("[data-titulo]").textContent = "Enlace no válido";
} else {
  onSnapshot(
    doc(db, "camaras", ID),
    (s) => {
      S.cam = s.exists() ? s.data() : null;
      $("[data-titulo]").textContent = S.cam ? S.cam.nombre : "Cámara no encontrada";
      document.title = `${S.cam ? S.cam.nombre : "Proyección"} · Cámara del evento`;
      actualizar();
    },
    (e) => console.error(e)
  );
}
setInterval(actualizar, 1000);

function cuentaRegresiva() {
  const f = fechaRevelar();
  if (!f) return "";
  const s = Math.max(0, Math.floor((f - Date.now()) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dd = (n) => String(n).padStart(2, "0");
  if (h >= 48) return `Las fotos se revelan en ${Math.floor(h / 24)} días`;
  return `Las fotos se revelan en ${h ? h + ":" : ""}${dd(m)}:${dd(seg)}`;
}

function actualizar() {
  if (!S.cam) return;
  const ya = revelado();
  $("[data-espera]").hidden = ya;
  $("[data-esquina]").hidden = !ya || S.cam.activa === false || !qrGrande;
  if (!ya) {
    $("[data-cuenta]").textContent = cuentaRegresiva();
    $("[data-carrusel]").hidden = true;
    $("[data-vacio]").hidden = true;
    return;
  }
  if (!S.desFotos) escucharFotos();
}

function escucharFotos() {
  S.desFotos = onSnapshot(
    query(collection(db, "camaras", ID, "fotos"), where("oculta", "==", false)),
    (snap) => {
      const antes = S.fotos[S.actual];
      S.fotos = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.creado?.toMillis?.() || 0) - (b.creado?.toMillis?.() || 0));
      S.fotos.forEach((f) => new Image().src = f.url); // precarga
      $("[data-vacio]").hidden = S.fotos.length > 0;
      $("[data-carrusel]").hidden = S.fotos.length === 0;
      // Si la foto en pantalla se ocultó, pasa a la siguiente de inmediato.
      const sigue = antes && S.fotos.some((f) => f.id === antes.id);
      if (!S.timer || !sigue) siguiente();
      else S.actual = S.fotos.findIndex((f) => f.id === antes.id);
    },
    (e) => console.error(e)
  );
}

function siguiente() {
  clearTimeout(S.timer);
  if (!S.fotos.length) {
    S.timer = null;
    $("[data-carrusel]").innerHTML = "";
    return;
  }
  // Primero las fotos que aún no se han mostrado (las recién tomadas), luego en orden.
  let i = S.fotos.findIndex((f) => !S.vistas.has(f.id));
  if (i === -1) i = (S.actual + 1) % S.fotos.length;
  S.actual = i;
  const f = S.fotos[i];
  S.vistas.add(f.id);

  const cont = $("[data-carrusel]");
  const div = document.createElement("div");
  div.className = "proy__foto";
  div.innerHTML = `<div class="proy__fondo"></div><img alt=""><p class="proy__autor"></p>`;
  div.querySelector(".proy__fondo").style.backgroundImage = `url("${f.url}")`;
  div.querySelector("img").src = f.url;
  div.querySelector(".proy__autor").textContent = `📷 ${f.nombre}`;
  cont.appendChild(div);
  requestAnimationFrame(() => requestAnimationFrame(() => div.classList.add("activa")));
  // Quita las anteriores después del desvanecido.
  setTimeout(() => {
    Array.from(cont.children).forEach((c) => c !== div && c.remove());
  }, 1600);
  S.timer = setTimeout(siguiente, SEGUNDOS * 1000);
}

// ---------- pantalla completa, cursor y pantalla encendida ----------
$("[data-accion=pantalla]").addEventListener("click", () => {
  const el = document.documentElement;
  (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el);
});
let quieto;
function moverCursor() {
  document.body.classList.remove("proy--sin-cursor");
  clearTimeout(quieto);
  quieto = setTimeout(() => document.body.classList.add("proy--sin-cursor"), 3000);
}
document.addEventListener("mousemove", moverCursor);
moverCursor();

async function mantenerEncendida() {
  try {
    if ("wakeLock" in navigator) await navigator.wakeLock.request("screen");
  } catch {}
}
mantenerEncendida();
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && mantenerEncendida());
