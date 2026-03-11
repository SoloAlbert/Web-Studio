const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzoa4BunEtlz6f4IwGpE4-Xf1OwrTqPPyLTP5-XIJ5G3_wXOaxl1IUSD9m7bLVjyZmH/exec";

// =========================
// NAV MOBILE
// =========================
const nav =
  document.querySelector("#siteNav") ||
  document.querySelector(".site-nav") ||
  document.querySelector("nav");

const menuBtn = document.querySelector(".menu-toggle");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// =========================
// REVEAL ON SCROLL
// =========================
const revealItems = document.querySelectorAll(".reveal-up");

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// =========================
// PROCESS CAROUSEL
// =========================
const processCarousel = document.querySelector(".process-carousel");

if (processCarousel) {
  const track = processCarousel.querySelector(".steps");
  const slides = Array.from(
    processCarousel.querySelectorAll(".process-step")
  );
  const dots = Array.from(processCarousel.querySelectorAll(".process-dot"));
  const prevBtn = processCarousel.querySelector(".process-prev");
  const nextBtn = processCarousel.querySelector(".process-next");

  let currentIndex = 0;
  let autoplayId = null;

  const updateCarousel = (index) => {
    const maxIndex = Math.max(0, slides.length - 1);
    currentIndex = Math.min(Math.max(index, 0), maxIndex);

    const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
    const gap = parseFloat(window.getComputedStyle(track).gap || "0");
    track.style.transform = `translateX(-${
      currentIndex * (slideWidth + gap)
    }px)`;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, slides.length - 1);
    updateCarousel(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  };

  const startAutoplay = () => {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = setInterval(nextSlide, 4200);
  };

  prevBtn?.addEventListener("click", () => {
    const maxIndex = Math.max(0, slides.length - 1);
    updateCarousel(currentIndex <= 0 ? maxIndex : currentIndex - 1);
    startAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    nextSlide();
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      updateCarousel(index);
      startAutoplay();
    });
  });

  processCarousel.addEventListener("mouseenter", () => {
    if (autoplayId) clearInterval(autoplayId);
  });

  processCarousel.addEventListener("mouseleave", startAutoplay);
  window.addEventListener("resize", () => updateCarousel(currentIndex));

  updateCarousel(0);
  startAutoplay();
}

// =========================
// FORMULARIO → APPS SCRIPT
// =========================
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

function setStatus(message, type = "info") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const payload = {
      nombre: formData.get("name") || "",
      empresa: formData.get("business") || "",
      correo: formData.get("email") || "",
      telefono: formData.get("phone") || "",
      servicio: formData.get("service") || "",
      mensaje: formData.get("message") || "",
      origen: "localconnect.studio",
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      setStatus("Enviando...", "info");

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("La respuesta del servidor no fue JSON válido.");
      }

      if (data.ok) {
        form.reset();
        setStatus(
          "Mensaje enviado correctamente. Te contactaremos pronto.",
          "success"
        );
      } else {
        console.error("Respuesta del backend:", data);
        setStatus("No se pudo enviar el formulario.", "error");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setStatus("Ocurrió un error al enviar. Intenta de nuevo.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Solicitar propuesta";
      }
    }
  });
}
// =========================
// COTIZADOR
// =========================
const quoteForm = document.getElementById("quote-form");
const quoteStatusEl = document.getElementById("quote-form-status");
const quoteSubmitBtn = document.getElementById("quote-submit-btn");

const quoteSubtotalEl = document.getElementById("quote-subtotal");
const quoteTotalEl = document.getElementById("quote-total");
const quoteAnticipoEl = document.getElementById("quote-anticipo");

const PACKAGE_PRICES = {
  "PKG-001": 4900,
  "PKG-002": 8900,
  "PKG-003": 14900,
};

const EXTRA_PRICES = {
  "EXT-001": 900,
  "EXT-002": 1800,
  "EXT-003": 1200,
  "EXT-004": 1200,
  "EXT-005": 1000,
  "EXT-006": 2500,
};

const ANTICIPO_PORCENTAJE = 0.5;

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function updateQuoteSummary() {
  if (!quoteForm) return;

  const paqueteId = quoteForm.querySelector('[name="package_id"]')?.value || "";
  const extras = Array.from(quoteForm.querySelectorAll('input[name="extras"]:checked')).map(el => el.value);

  const paquetePrecio = PACKAGE_PRICES[paqueteId] || 0;
  const extrasPrecio = extras.reduce((acc, id) => acc + (EXTRA_PRICES[id] || 0), 0);

  const subtotal = paquetePrecio + extrasPrecio;
  const total = subtotal;
  const anticipo = Math.round(total * ANTICIPO_PORCENTAJE);

  if (quoteSubtotalEl) quoteSubtotalEl.textContent = formatCurrency(subtotal);
  if (quoteTotalEl) quoteTotalEl.textContent = formatCurrency(total);
  if (quoteAnticipoEl) quoteAnticipoEl.textContent = formatCurrency(anticipo);
}

if (quoteForm) {
  quoteForm.addEventListener("change", updateQuoteSummary);
  updateQuoteSummary();

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!quoteForm.reportValidity()) return;

    const formData = new FormData(quoteForm);

    const payload = {
      action: "cotizacion",
      nombre: formData.get("name") || "",
      empresa: formData.get("business") || "",
      correo: formData.get("email") || "",
      telefono: formData.get("phone") || "",
      paquete_id: formData.get("package_id") || "",
      extras_ids: Array.from(quoteForm.querySelectorAll('input[name="extras"]:checked')).map(el => el.value),
      descuento: 0,
      mensaje: formData.get("message") || "",
      origen: "localconnect.studio"
    };

    try {
      quoteSubmitBtn.disabled = true;
      quoteSubmitBtn.textContent = "Generando...";
      quoteStatusEl.textContent = "Generando cotización...";

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      const data = JSON.parse(rawText);

      if (data.ok) {
        quoteStatusEl.textContent = `Cotización generada correctamente. Folio: ${data.folio}`;
        quoteForm.reset();
        updateQuoteSummary();
      } else {
        console.error("Respuesta cotizador:", data);
        quoteStatusEl.textContent = "No se pudo generar la cotización.";
      }
    } catch (error) {
      console.error("Error al cotizar:", error);
      quoteStatusEl.textContent = "Ocurrió un error al generar la cotización.";
    } finally {
      quoteSubmitBtn.disabled = false;
      quoteSubmitBtn.textContent = "Generar cotización";
    }
  });
}