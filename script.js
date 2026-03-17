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

  const data = await response.json();
  return data?.paymentLink || data?.init_point || data?.sandbox_init_point || "";
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

      if (PAYMENT_CONFIG.mode === "link") {
        const dynamicPaymentLink = await requestDynamicPaymentLink(latestQuote);
        const fallbackPaymentLink =
          PAYMENT_CONFIG.packagePaymentLinks[latestQuote.packageId] ||
          PAYMENT_CONFIG.defaultPaymentLink;
        const paymentLink = dynamicPaymentLink || fallbackPaymentLink;

        if (paymentLink) {
          window.open(paymentLink, "_blank", "noopener,noreferrer");

          quoteStatusEl.textContent = dynamicPaymentLink
            ? "Link de pago listo con el total actualizado."
            : "Se abrió el link de pago configurado para este paquete.";
          return;
        }
      }

      const extrasSummary = latestQuote.extrasDetail?.length
        ? latestQuote.extrasDetail
            .map((extra) => `- ${extra.name}: ${formatCurrency(extra.price)}`)
            .join("\n")
        : "- Sin extras";

      const message = encodeURIComponent(
        `Hola, quiero continuar con el anticipo de mi proyecto en LocalConnect Studio.\n\nFolio: ${latestQuote.folio}\nPaquete: ${latestQuote.packageName}\nExtras:\n${extrasSummary}\nAnticipo: ${formatCurrency(latestQuote.anticipo)}\nTotal estimado: ${formatCurrency(latestQuote.total)}\nNombre: ${latestQuote.nombre}\nEmpresa: ${latestQuote.empresa}\nCorreo: ${latestQuote.correo}`
      );

      const whatsappUrl = `https://wa.me/${PAYMENT_CONFIG.whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      quoteStatusEl.textContent =
        "No había un link dinámico listo; te enviamos al flujo por WhatsApp con el resumen completo.";
    } catch (error) {
      console.error("Error al preparar el pago:", error);
      quoteStatusEl.textContent = "No se pudo preparar el pago.";
    } finally {
      quotePayBtn.disabled = false;
      quotePayBtn.textContent = "Pagar anticipo";
    }
  });
}
