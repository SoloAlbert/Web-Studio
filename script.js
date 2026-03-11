const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzoa4BunEtlz6f4IwGpE4-Xf1OwrTqPPyLTP5-XIJ5G3_wXOaxl1IUSD9m7bLVjyZmH/exec";

// =========================
// NAV MOBILE
// =========================
const nav = document.querySelector("#siteNav") || document.querySelector(".site-nav") || document.querySelector("nav");
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
  const slides = Array.from(processCarousel.querySelectorAll(".process-step"));
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
    track.style.transform = `translateX(-${currentIndex * (slideWidth + gap)}px)`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle("is-active", isActive);
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
    if (autoplayId) window.clearInterval(autoplayId);
    autoplayId = window.setInterval(nextSlide, 4200);
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
    if (autoplayId) window.clearInterval(autoplayId);
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

    // Traducción del frontend a lo que espera Apps Script
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
        setStatus("Mensaje enviado correctamente. Te contactaremos pronto.", "success");
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