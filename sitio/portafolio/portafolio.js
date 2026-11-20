/* Páginas del portafolio: los botones de WhatsApp llevan a LocalConnect y se agrega la barra inferior. */
(function () {
  "use strict";
  const yo = document.currentScript;
  const M = window.MARCA || {};
  const numero = String(M.whatsapp || "").replace(/\D/g, "");
  const wa = (texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = wa(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  if (new URLSearchParams(location.search).has("directo")) return;
  const proyecto = (yo && yo.dataset.proyecto) || "este proyecto";
  const tipo = (yo && yo.dataset.tipo) || "Página web";
  const volver = (yo && yo.dataset.volver) || "../../negocios/#portafolio";
  const quiero = (yo && yo.dataset.quiero) || `¡Hola LocalConnect! Vi la página de ${proyecto} y quiero una así para mi negocio.`;
  const boton = (yo && yo.dataset.boton) || "Quiero una así";
  const firma = (yo && yo.dataset.firma) || "Hecha por LocalConnect";
  const barra = document.createElement("nav");
  barra.className = "barra-lc";
  barra.setAttribute("aria-label", "LocalConnect");
  barra.innerHTML =
    `<a class="barra-lc__volver" aria-label="Ver más proyectos">‹</a>` +
    `<div class="barra-lc__info"><strong></strong><span></span></div>` +
    `<a class="barra-lc__boton" target="_blank" rel="noopener"></a>`;
  barra.querySelector(".barra-lc__volver").href = volver;
  barra.querySelector(".barra-lc__boton").textContent = boton;
  barra.querySelector("strong").textContent = firma;
  barra.querySelector("span").textContent = tipo;
  barra.querySelector(".barra-lc__boton").href = wa(quiero);
  document.body.appendChild(barra);
})();
