/* Comportamiento del sitio de LocalConnect */
(function () {
  "use strict";
  const M = window.MARCA || {};
  const numero = String(M.whatsapp || "").replace(/\D/g, "");

  // Botones de WhatsApp: data-wa="mensaje"
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${numero}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Redes sociales (solo las que estén configuradas en marca.js)
  const redes = document.querySelector("[data-redes]");
  if (redes) {
    const lista = [
      ["instagram", "Instagram"],
      ["facebook", "Facebook"],
      ["tiktok", "TikTok"],
    ].filter(([k]) => M[k]);
    redes.innerHTML =
      lista.map(([k, n]) => `<a href="${M[k]}" target="_blank" rel="noopener">${n}</a>`).join("") +
      (M.correo ? `<a href="mailto:${M.correo}">${M.correo}</a>` : "");
    redes.hidden = !redes.innerHTML;
  }

  // Año en el pie
  document.querySelectorAll("[data-anio]").forEach((s) => (s.textContent = new Date().getFullYear()));

  // Menú en celular
  const boton = document.querySelector(".menu-boton");
  const menu = document.getElementById("menu");
  if (boton && menu) {
    const cerrar = () => {
      boton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-abierto");
    };
    boton.addEventListener("click", () => {
      const abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", String(!abierto));
      document.body.classList.toggle("menu-abierto", !abierto);
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrar));
    document.addEventListener("keydown", (e) => e.key === "Escape" && cerrar());
  }

  // Sombra de la cabecera al hacer scroll
  const cab = document.querySelector(".cabecera");
  const marcar = () => cab && cab.classList.toggle("cabecera--scroll", window.scrollY > 10);
  window.addEventListener("scroll", marcar, { passive: true });
  marcar();

  // Animación de entrada
  const items = document.querySelectorAll(".diseno, .funcion, .paquete, .pasos li, .servicio-lc, .proyecto, .sistema-lc, .miniatura-lc, .ficha-lc, .telefonos-lc a");
  if ("IntersectionObserver" in window) {
    items.forEach((el) => el.classList.add("aparecer"));
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    items.forEach((el) => io.observe(el));
  }
})();
