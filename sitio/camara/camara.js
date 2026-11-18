/* =====================================================================
   Cámara del evento — LocalConnect
   El invitado escanea el QR, escribe su nombre y toma sus fotos (rollo de
   3, 7 o 12). Puede repetir cada foto; solo cuenta la que guarda. Las fotos
   quedan ocultas hasta la hora del revelado que eligen los anfitriones.
   Enlace: localconnect.studio/camara/?e=<evento>
   ===================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (s) => document.querySelector(s);
const esc = (t) =>
  String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ID = (new URLSearchParams(location.search).get("e") || "").trim().toLowerCase();
const CLAVE_NOMBRE = "lc-camara-nombre";
const NUBE = window.CLOUDINARY || {};

// Versión reducida de una foto de Cloudinary (miniaturas y pantalla).
const version = (url, t) => (String(url || "").startsWith("https://res.cloudinary.com/") ? url.replace("/upload/", `/upload/${t}/`) : url);

const S = { cam: null, uid: null, nombre: "", tomadas: new Set(), foto: null, guardando: false, albumActivo: false };

function mostrar(v) {
  document.querySelectorAll(".vista").forEach((el) => (el.hidden = el.dataset.vista !== v));
}
function aviso(texto) {
  $("[data-aviso]").textContent = texto;
  mostrar("aviso");
}
function error(texto) {
  const el = $("[data-error]");
  el.textContent = texto;
  el.hidden = !texto;
}
const leerNombre = () => {
  try { return localStorage.getItem(CLAVE_NOMBRE) || ""; } catch { return ""; }
};
const guardarNombre = (n) => {
  try { localStorage.setItem(CLAVE_NOMBRE, n); } catch {}
};

const fechaRevelar = () => (S.cam && S.cam.revelar && S.cam.revelar.toDate ? S.cam.revelar.toDate() : null);
const revelado = () => {
  const f = fechaRevelar();
  return !!f && Date.now() >= f.getTime();
};
function textoRevelado() {
  const f = fechaRevelar();
  if (!f) return "Las fotos se revelarán al final del evento. 🎞️";
  if (revelado()) return "<strong>¡Las fotos ya se revelaron!</strong> Míralas abajo.";
  const hoy = new Date().toDateString() === f.toDateString();
  const hora = f.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
  const dia = hoy ? "hoy" : f.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  return `Nadie puede ver las fotos todavía. Se revelan <strong>${esc(dia)} a las ${esc(hora)}</strong>. 🎞️`;
}

// ---------- inicio ----------
async function iniciar() {
  if (!window.FIREBASE_CONFIG || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ID)) return aviso("Este enlace no es válido. Escanea de nuevo el código QR del evento.");
  const app = initializeApp(window.FIREBASE_CONFIG);
  const db = getFirestore(app);
  const auth = getAuth(app);
  Object.assign(S, { db });

  let snap;
  try {
    snap = await getDoc(doc(db, "camaras", ID));
  } catch (e) {
    console.error(e);
    return aviso("No se pudo cargar la cámara. Revisa tu conexión e inténtalo de nuevo.");
  }
  if (!snap.exists()) return aviso("No encontramos la cámara de este evento. Escanea de nuevo el código QR.");
  S.cam = snap.data();
  $("[data-titulo]").textContent = S.cam.nombre || "";
  document.title = `${S.cam.nombre || "Cámara"} · Cámara del evento`;

  // Cambios en vivo: hora del revelado, cámara pausada, etc.
  onSnapshot(doc(db, "camaras", ID), (s) => {
    if (!s.exists()) return;
    S.cam = s.data();
    pintar();
  });
  setInterval(() => (revelado() && !S.albumActivo ? pintar() : null), 20000);

  try {
    const cred = await signInAnonymously(auth);
    S.uid = cred.user.uid;
    const mias = await getDocs(query(collection(db, "camaras", ID, "fotos"), where("uid", "==", S.uid)));
    mias.forEach((d) => S.tomadas.add(d.data().n));
  } catch (e) {
    console.error(e);
    return aviso("No se pudo abrir la cámara. Revisa tu conexión e inténtalo de nuevo.");
  }

  S.nombre = leerNombre();
  if (!S.nombre) {
    $("[data-total]").textContent = S.cam.fotos;
    mostrar("nombre");
    pintarAlbum();
    return;
  }
  pintar();
}

$("[data-form=nombre]").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = e.target.nombre.value.trim().slice(0, 40);
  if (!n) return;
  S.nombre = n;
  guardarNombre(n);
  pintar();
});

// ---------- pantalla de la cámara ----------
function pintar() {
  if (!S.cam || !S.nombre || !S.uid) return pintarAlbum();
  mostrar("camara");
  const total = S.cam.fotos || 0;
  const usadas = S.tomadas.size;
  const quedan = Math.max(0, total - usadas);
  $("[data-rollo]").innerHTML = Array.from({ length: total }, (_, i) => `<span class="${i < usadas ? "usado" : ""}"></span>`).join("");
  $("[data-contador]").innerHTML = quedan
    ? `Te ${quedan === 1 ? "queda" : "quedan"} <strong>${quedan}</strong> ${quedan === 1 ? "foto" : "fotos"}`
    : "";
  const pausada = S.cam.activa === false;
  $("[data-terminado]").hidden = quedan > 0 || pausada;
  $("[data-disparo]").hidden = quedan === 0 || pausada || !!S.foto;
  $("[data-previa]").hidden = !S.foto;
  if (pausada && !S.foto) $("[data-contador]").textContent = "La cámara de este evento ya se cerró.";
  $("[data-revelado]").innerHTML = textoRevelado();
  pintarAlbum();
}

const entrada = $("[data-entrada]");
$("[data-accion=disparar]").addEventListener("click", () => entrada.click());
$("[data-accion=repetir]").addEventListener("click", () => entrada.click());

entrada.addEventListener("change", async () => {
  const archivo = entrada.files && entrada.files[0];
  entrada.value = "";
  if (!archivo) return;
  error("");
  try {
    const blob = await comprimir(archivo);
    if (S.foto) URL.revokeObjectURL(S.foto.url);
    S.foto = { blob, url: URL.createObjectURL(blob) };
    $("[data-previa-img]").src = S.foto.url;
    pintar();
    $("[data-previa]").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (e) {
    console.error(e);
    error("No se pudo leer la foto. Inténtalo de nuevo.");
  }
});

// Reduce la foto a 1600 px (buena calidad en pantalla, carga rápida).
function comprimir(archivo) {
  return new Promise((ok, mal) => {
    const img = new Image();
    const url = URL.createObjectURL(archivo);
    img.onload = () => {
      const max = 1600;
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? ok(b) : mal(new Error("sin imagen"))), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      mal(new Error("formato"));
    };
    img.src = url;
  });
}

$("[data-accion=guardar]").addEventListener("click", async (e) => {
  if (!S.foto || S.guardando) return;
  const boton = e.currentTarget;
  const total = S.cam.fotos || 0;
  let n = 1;
  while (S.tomadas.has(n) && n <= total) n++;
  if (n > total) return pintar();

  S.guardando = true;
  boton.disabled = true;
  boton.textContent = "Guardando…";
  error("");
  try {
    const datos = new FormData();
    datos.append("file", S.foto.blob, `${n}.jpg`);
    datos.append("upload_preset", NUBE.preset);
    datos.append("tags", `evento-${ID}`);
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${NUBE.nube}/image/upload`, { method: "POST", body: datos });
    if (!resp.ok) throw new Error("subida " + resp.status);
    const subida = await resp.json();
    const url = subida.secure_url;
    const ruta = subida.public_id;
    await setDoc(doc(S.db, "camaras", ID, "fotos", `${S.uid}_${n}`), {
      uid: S.uid, nombre: S.nombre, n, ruta, url, creado: serverTimestamp(), oculta: false,
    });
    S.tomadas.add(n);
    URL.revokeObjectURL(S.foto.url);
    S.foto = null;
    pintar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (x) {
    console.error(x);
    const c = (x && x.code) || "";
    error(
      c.includes("unauthorized") || c.includes("permission")
        ? "No se pudo guardar: la cámara del evento está cerrada o ya usaste todas tus fotos."
        : "No se pudo guardar. Revisa tu conexión y vuelve a tocar «Guardar esta»."
    );
  } finally {
    S.guardando = false;
    boton.disabled = false;
    boton.textContent = "Guardar esta";
  }
});

// ---------- álbum (después del revelado) ----------
let fotosAlbum = [];
function pintarAlbum() {
  if (!revelado() || S.albumActivo || !S.db) return;
  S.albumActivo = true;
  $("[data-album]").hidden = false;
  onSnapshot(
    query(collection(S.db, "camaras", ID, "fotos"), where("oculta", "==", false)),
    (snap) => {
      fotosAlbum = snap.docs
        .map((d) => d.data())
        .sort((a, b) => (a.creado?.toMillis?.() || 0) - (b.creado?.toMillis?.() || 0));
      $("[data-album-total]").textContent = `${fotosAlbum.length} ${fotosAlbum.length === 1 ? "foto" : "fotos"} tomadas por los invitados`;
      $("[data-album-fotos]").innerHTML = fotosAlbum
        .map((f, i) => `<button type="button" data-i="${i}" aria-label="Foto de ${esc(f.nombre)}"><img src="${esc(version(f.url, "c_fill,w_400,h_400,g_auto,q_auto,f_auto"))}" alt="" loading="lazy"></button>`)
        .join("");
    },
    (e) => console.error(e)
  );
}

$("[data-album-fotos]").addEventListener("click", (e) => {
  const b = e.target.closest("[data-i]");
  if (!b) return;
  const f = fotosAlbum[+b.dataset.i];
  $("[data-visor-img]").src = version(f.url, "q_auto,f_auto");
  $("[data-visor-nombre]").textContent = `Foto de ${f.nombre}`;
  $("[data-visor]").hidden = false;
});
$("[data-visor]").addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG") $("[data-visor]").hidden = true;
});

iniciar();
