const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxKEju7CbigTv0hQl9fcQwaESto_6omYrmgn7ppCvQJ9mQIcDbttLkiZX8poG5bkQPUWw/exec";

const PAYMENT_CONFIG = {
  mode: "link",
  whatsappNumber: "525544492118",
  defaultPaymentLink: "",
  // Usa el mismo Apps Script para generar el link dinamico de Mercado Pago.
  paymentLinkEndpoint: APPS_SCRIPT_URL,
  packagePaymentLinks: {},
};

const PACKAGE_PRICES = {
  "PKG-001": 4900,
  "PKG-002": 8900,
  "PKG-003": 14900,
};

const PACKAGE_META = {
  "PKG-001": {
    name: "Landing Esencial",
    delivery: "7 a 10 días hábiles",
  },
  "PKG-002": {
    name: "Web Profesional",
    delivery: "10 a 15 días hábiles",
  },
  "PKG-003": {
    name: "Web Premium",
    delivery: "15 a 21 días hábiles",
  },
};

const EXTRA_PRICES = {
  "EXT-001": 900,
  "EXT-002": 1800,
  "EXT-003": 1200,
  "EXT-004": 1200,
  "EXT-005": 1000,
  "EXT-006": 2500,
};

const EXTRA_META = {
  "EXT-001": "Dominio y configuración",
  "EXT-002": "Hosting anual",
  "EXT-003": "Correos empresariales",
  "EXT-004": "Sección extra",
  "EXT-005": "Mantenimiento mensual",
  "EXT-006": "Entrega urgente",
};

const ANTICIPO_PORCENTAJE = 0.5;

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
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// =========================
// PORTFOLIO FILTER
// =========================
const portfolioFilterButtons = Array.from(
  document.querySelectorAll(".portfolio-filter-btn")
);
const portfolioCards = Array.from(
  document.querySelectorAll(".project-card[data-category]")
);
const portfolioStageCopy = document.getElementById("portfolio-stage-copy");
const portfolioStagePreview = document.getElementById("portfolio-stage-preview");

const PORTFOLIO_STAGE_META = {
  esencial: {
    tag: "Esencial",
    title: "Una sola vista para presentar lo esencial y generar contacto rápido.",
    copy:
      "Ideal para negocios que necesitan presencia inmediata con una estructura breve, clara y enfocada en conversión.",
  },
  profesional: {
    tag: "Profesional",
    title: "Hasta 5 páginas internas para presentar servicios, confianza y contacto.",
    copy:
      "Pensado para negocios que necesitan una web más clara comercialmente, con mejor jerarquía y base lista para crecer.",
  },
  premium: {
    tag: "Premium",
    title: "Hasta 7 páginas internas con más profundidad visual y comercial.",
    copy:
      "Diseñado para marcas que buscan una experiencia más personalizada, con narrativa visual y una presencia más aspiracional.",
  },
};

PORTFOLIO_STAGE_META.esencial.highlights = [
  "1 vista",
  "Mensaje directo",
  "Conversión rápida",
];
PORTFOLIO_STAGE_META.profesional.highlights = [
  "5 páginas",
  "Más orden",
  "Base escalable",
];
PORTFOLIO_STAGE_META.premium.highlights = [
  "7 páginas",
  "Más personalización",
  "Mayor profundidad",
];

function setPortfolioFilter(category) {
  const previewMeta = {
    esencial: {
      title: "Esencial",
      copy: "Una vista breve con recorrido directo.",
    },
    profesional: {
      title: "Profesional",
      copy: "MÃ¡s orden, soporte comercial y mejor jerarquÃ­a.",
    },
    premium: {
      title: "Premium",
      copy: "Mayor presencia visual y una experiencia mÃ¡s envolvente.",
    },
  };

  previewMeta.profesional.copy = "Mas orden, soporte comercial y mejor jerarquia.";
  previewMeta.premium.copy = "Mayor presencia visual y una experiencia mas envolvente.";

  portfolioFilterButtons.forEach((button) => {
    const isActive = button.dataset.filter === category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  portfolioCards.forEach((card) => {
    card.hidden = card.dataset.category !== category;
  });

  const stageMeta = PORTFOLIO_STAGE_META[category];
  const stagePreviewMeta = previewMeta[category];
  if (portfolioStageCopy && stageMeta) {
    const highlightsMarkup = (stageMeta.highlights || [])
      .map((item) => `<span>${item}</span>`)
      .join("");
    portfolioStageCopy.innerHTML = `
      <span class="portfolio-stage-tag">${stageMeta.tag}</span>
      <h3>${stageMeta.title}</h3>
      <div class="portfolio-stage-highlights">${highlightsMarkup}</div>
    `;
  }

  if (portfolioStagePreview && stagePreviewMeta) {
    portfolioStagePreview.dataset.tone = category;
    portfolioStagePreview.innerHTML = `
      <div class="preview-window">
        <div class="preview-window-top">
          <span></span><span></span><span></span>
        </div>
        <div class="preview-window-body">
          <div class="preview-window-sidebar">
            <small>Nivel</small>
            <strong>${stagePreviewMeta.title}</strong>
            <p>${stagePreviewMeta.copy}</p>
          </div>
          <div class="preview-window-main">
            <div class="preview-window-hero"></div>
            <div class="preview-window-grid">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (portfolioFilterButtons.length && portfolioCards.length) {
  portfolioFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPortfolioFilter(button.dataset.filter || "esencial");
    });
  });

  setPortfolioFilter("esencial");
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
    const targetSlide = slides[currentIndex];
    const translateX = targetSlide?.offsetLeft || 0;
    track.style.transform = `translateX(-${translateX}px)`;

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
// COTIZADOR + EXPERIENCIA DE COMPRA
// =========================
const quoteForm = document.getElementById("quote-form");
const quoteStatusEl = document.getElementById("quote-form-status");
const quoteSubmitBtn = document.getElementById("quote-submit-btn");
const quotePayBtn = document.getElementById("quote-pay-btn");
const packageSelectButtons = document.querySelectorAll(".package-select-btn");
const quotePackageSelect = document.getElementById("quote-package");

const quoteSubtotalEl = document.getElementById("quote-subtotal");
const quoteTotalEl = document.getElementById("quote-total");
const quoteAnticipoEl = document.getElementById("quote-anticipo");
const quoteSelectedPackageEl = document.getElementById("quote-selected-package");
const quoteSelectedExtrasEl = document.getElementById("quote-selected-extras");
const quoteDeliveryEl = document.getElementById("quote-delivery");
const quoteDeliveryNoteEl = document.getElementById("quote-delivery-note");
const quoteNextStepEl = document.getElementById("quote-next-step");
const quotePaymentHintEl = document.getElementById("quote-payment-hint");

let latestQuote = null;

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getSelectedExtraIds() {
  if (!quoteForm) return [];
  return Array.from(
    quoteForm.querySelectorAll('input[name="extras"]:checked')
  ).map((el) => el.value);
}

function setPayButtonState(enabled) {
  if (!quotePayBtn) return;
  quotePayBtn.disabled = !enabled;
  quotePayBtn.setAttribute("aria-disabled", String(!enabled));
}

function highlightSelectedPackage(packageId) {
  document.querySelectorAll(".price-card").forEach((card) => {
    const button = card.querySelector(".package-select-btn");
    const isSelected = button?.dataset.package === packageId;
    card.classList.toggle("is-selected", Boolean(isSelected));
  });
}

function invalidateLatestQuote() {
  latestQuote = null;
  setPayButtonState(false);
  if (quoteNextStepEl) {
    quoteNextStepEl.textContent = "Genera tu folio";
  }
}

function updateQuoteSummary() {
  if (!quoteForm) return;

  const packageId = quotePackageSelect?.value || "";
  const extras = getSelectedExtraIds();

  const packagePrice = PACKAGE_PRICES[packageId] || 0;
  const extrasPrice = extras.reduce(
    (acc, id) => acc + (EXTRA_PRICES[id] || 0),
    0
  );

  const subtotal = packagePrice + extrasPrice;
  const total = subtotal;
  const anticipo = Math.round(total * ANTICIPO_PORCENTAJE);
  const packageMeta = PACKAGE_META[packageId];

  if (quoteSubtotalEl) quoteSubtotalEl.textContent = formatCurrency(subtotal);
  if (quoteTotalEl) quoteTotalEl.textContent = formatCurrency(total);
  if (quoteAnticipoEl) quoteAnticipoEl.textContent = formatCurrency(anticipo);

  if (quoteSelectedPackageEl) {
    quoteSelectedPackageEl.textContent = packageMeta
      ? `${packageMeta.name} · ${formatCurrency(packagePrice)}`
      : "Sin seleccionar";
  }

  if (quoteSelectedExtrasEl) {
    if (!extras.length) {
      quoteSelectedExtrasEl.innerHTML = "<li>Aún no has agregado extras.</li>";
    } else {
      quoteSelectedExtrasEl.innerHTML = extras
        .map(
          (id) =>
            `<li>${EXTRA_META[id] || id} · ${formatCurrency(
              EXTRA_PRICES[id] || 0
            )}</li>`
        )
        .join("");
    }
  }

  if (quoteDeliveryEl) {
    quoteDeliveryEl.textContent = packageMeta ? packageMeta.delivery : "Pendiente";
  }

  if (quoteDeliveryNoteEl) {
    quoteDeliveryNoteEl.textContent = packageMeta
      ? `Tu anticipo estimado sería de ${formatCurrency(anticipo)}.`
      : "Selecciona un paquete para estimar tiempos de trabajo.";
  }

  if (quotePaymentHintEl) {
    const usesStaticPackageLink =
      PAYMENT_CONFIG.mode === "link" &&
      !PAYMENT_CONFIG.paymentLinkEndpoint &&
      Boolean(
        PAYMENT_CONFIG.packagePaymentLinks[packageId] ||
          PAYMENT_CONFIG.defaultPaymentLink
      );

    quotePaymentHintEl.textContent = usesStaticPackageLink
      ? ""
      : "El anticipo se prepara con el total actualizado de tu cotización.";
  }

  highlightSelectedPackage(packageId);
}

function getQuoteComputedAmounts(packageId, extrasIds) {
  const packagePrice = PACKAGE_PRICES[packageId] || 0;
  const extrasPrice = extrasIds.reduce(
    (acc, id) => acc + (EXTRA_PRICES[id] || 0),
    0
  );
  const total = packagePrice + extrasPrice;

  return {
    packagePrice,
    extrasPrice,
    total,
    anticipo: Math.round(total * ANTICIPO_PORCENTAJE),
  };
}

async function requestDynamicPaymentLink(quote) {
  if (!PAYMENT_CONFIG.paymentLinkEndpoint) return "";

  const response = await fetch(PAYMENT_CONFIG.paymentLinkEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "crear_pago",
      folio: quote.folio,
      nombre: quote.nombre,
      empresa: quote.empresa,
      correo: quote.correo,
      telefono: quote.telefono,
      paquete_id: quote.packageId,
      paquete_nombre: quote.packageName,
      extras_ids: quote.extrasIds,
      extras_detalle: quote.extrasDetail,
      total: quote.total,
      anticipo: quote.anticipo,
      concepto: `Anticipo ${quote.packageName} (${quote.folio})`,
    }),
  });

  const rawText = await response.text();
  let data = {};

  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Respuesta no valida del backend de pago: ${rawText}`);
  }

  if (!data?.ok) {
    throw new Error(
      data?.message || data?.error || "El backend no pudo generar el link de pago."
    );
  }

  const paymentLink =
    data?.paymentLink || data?.init_point || data?.sandbox_init_point || "";

  if (!paymentLink) {
    throw new Error(
      `El backend respondio sin paymentLink. Respuesta: ${rawText}`
    );
  }

  return paymentLink;
}

packageSelectButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const packageId = button.dataset.package;

    if (quotePackageSelect) {
      quotePackageSelect.value = packageId;
    }

    invalidateLatestQuote();
    updateQuoteSummary();

    document.getElementById("cotizador")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      document.getElementById("quote-name")?.focus();
    }, 350);
  });
});

if (quoteForm) {
  quoteForm.addEventListener("change", () => {
    invalidateLatestQuote();
    updateQuoteSummary();
  });

  updateQuoteSummary();
  setPayButtonState(false);

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!quoteForm.reportValidity()) return;

    const formData = new FormData(quoteForm);
    const extrasIds = getSelectedExtraIds();
    const packageId = formData.get("package_id") || "";
    const packageMeta = PACKAGE_META[packageId] || null;

    const payload = {
      action: "cotizacion",
      nombre: formData.get("name") || "",
      empresa: formData.get("business") || "",
      correo: formData.get("email") || "",
      telefono: formData.get("phone") || "",
      paquete_id: packageId,
      extras_ids: extrasIds,
      descuento: 0,
      mensaje: formData.get("message") || "",
      origen: "localconnect.studio",
    };

    try {
      quoteSubmitBtn.disabled = true;
      quoteSubmitBtn.textContent = "Generando...";
      quoteStatusEl.textContent = "Generando cotización...";

      const computedAmounts = getQuoteComputedAmounts(packageId, extrasIds);

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
        latestQuote = {
          folio: data.folio,
          packageId,
          packageName: packageMeta?.name || packageId,
          extrasIds,
          extrasDetail: extrasIds.map((id) => ({
            id,
            name: EXTRA_META[id] || id,
            price: EXTRA_PRICES[id] || 0,
          })),
          total: Number(data.total) || computedAmounts.total,
          anticipo: Number(data.anticipo) || computedAmounts.anticipo,
          nombre: payload.nombre,
          empresa: payload.empresa,
          correo: payload.correo,
          telefono: payload.telefono,
        };

        setPayButtonState(true);
        if (quoteNextStepEl) {
          quoteNextStepEl.textContent = `Folio listo: ${data.folio}`;
        }

        quoteStatusEl.textContent = `Cotización generada correctamente. Folio: ${data.folio}`;
      } else {
        console.error("Respuesta cotizador:", data);
        quoteStatusEl.textContent = "No se pudo generar la cotización.";
        setPayButtonState(false);
      }
    } catch (error) {
      console.error("Error al cotizar:", error);
      quoteStatusEl.textContent = "Ocurrió un error al generar la cotización.";
      setPayButtonState(false);
    } finally {
      quoteSubmitBtn.disabled = false;
      quoteSubmitBtn.textContent = "Generar cotización";
    }
  });
}

if (quotePayBtn) {
  quotePayBtn.addEventListener("click", async () => {
    if (!latestQuote) {
      quoteStatusEl.textContent =
        "Primero genera una cotización para habilitar el anticipo.";
      setPayButtonState(false);
      return;
    }

    try {
      quotePayBtn.disabled = true;
      quotePayBtn.textContent = "Preparando pago...";
      quoteStatusEl.textContent = "Preparando link de pago...";

      if (PAYMENT_CONFIG.mode !== "link") {
        throw new Error("El modo de pago configurado no soporta links.");
      }

      const paymentLink = await requestDynamicPaymentLink(latestQuote);
      window.location.href = paymentLink;

      quoteStatusEl.textContent =
        "Link de pago listo con el total actualizado.";

    } catch (error) {
      console.error("Error al preparar el pago:", error);
      quoteStatusEl.textContent =
        error?.message || "No se pudo preparar el pago.";
    } finally {
      quotePayBtn.disabled = false;
      quotePayBtn.textContent = "Pagar anticipo";
    }
  });
}
