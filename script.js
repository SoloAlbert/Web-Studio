const EMAILJS_CONFIG = {
  publicKey: "JFN5qz6GxAtQzwg71",
  serviceId: "service_do4br56",
  templateId: "template_kbrtznd"
};

const EMAILJS_CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
  'https://unpkg.com/@emailjs/browser@4/dist/email.min.js'
];

const nav = document.querySelector('#siteNav') || document.querySelector('.site-nav') || document.querySelector('nav');
const menuBtn = document.querySelector('.menu-toggle');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal-up');

if (revealItems.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const processCarousel = document.querySelector('.process-carousel');

if (processCarousel) {
  const track = processCarousel.querySelector('.steps');
  const slides = Array.from(processCarousel.querySelectorAll('.process-step'));
  const dots = Array.from(processCarousel.querySelectorAll('.process-dot'));
  const prevBtn = processCarousel.querySelector('.process-prev');
  const nextBtn = processCarousel.querySelector('.process-next');

  let currentIndex = 0;
  let autoplayId = null;

  const updateCarousel = (index) => {
    const maxIndex = Math.max(0, slides.length - 1);
    currentIndex = Math.min(Math.max(index, 0), maxIndex);

    const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
    const gap = parseFloat(window.getComputedStyle(track).gap || '0');
    track.style.transform = `translateX(-${currentIndex * (slideWidth + gap)}px)`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle('is-active', isActive);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === currentIndex);
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

  prevBtn?.addEventListener('click', () => {
    const maxIndex = Math.max(0, slides.length - 1);
    updateCarousel(currentIndex <= 0 ? maxIndex : currentIndex - 1);
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      updateCarousel(index);
      startAutoplay();
    });
  });

  processCarousel.addEventListener('mouseenter', () => {
    if (autoplayId) window.clearInterval(autoplayId);
  });

  processCarousel.addEventListener('mouseleave', startAutoplay);
  window.addEventListener('resize', () => updateCarousel(currentIndex));

  updateCarousel(0);
  startAutoplay();
}

const form = document.getElementById('contact-form');
const statusText = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

const hasEmailJsPlaceholders = Object.values(EMAILJS_CONFIG).some(value =>
  String(value).startsWith('REEMPLAZA_CON_TU_')
);

function setStatus(message, type = 'info') {
  if (!statusText) return;
  statusText.textContent = message;
  statusText.className = `form-status ${type}`;
}

function getEmailJsClient() {
  return window.emailjs;
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-emailjs-src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.emailjsSrc = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureEmailJsLoaded() {
  if (getEmailJsClient()) return getEmailJsClient();

  for (const src of EMAILJS_CDN_URLS) {
    try {
      await loadScript(src);
      if (getEmailJsClient()) return getEmailJsClient();
    } catch (error) {
      console.warn('Fallo al cargar EmailJS desde CDN:', error);
    }
  }

  throw new Error('EmailJS no se pudo cargar desde ningun CDN configurado.');
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    if (hasEmailJsPlaceholders) {
      setStatus('El formulario está listo, pero aún faltan tus credenciales de EmailJS en script.js.', 'info');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    setStatus('');

    try {
      const emailjsClient = await ensureEmailJsLoaded();

      emailjsClient.init({
        publicKey: EMAILJS_CONFIG.publicKey,
        blockHeadless: true,
        limitRate: {
          id: 'nexo-contact-form',
          throttle: 20000
        },
        blockList: {
          watchVariable: 'email',
          list: ['test@test.com', 'example@example.com']
        }
      });

      await emailjsClient.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        form
      );

      form.reset();
      setStatus('Mensaje enviado. Te contactaremos pronto.', 'success');
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      if (error?.text) {
        setStatus(`No se pudo enviar el mensaje: ${error.text}.`, 'error');
      } else {
        setStatus('No se pudo cargar o usar EmailJS.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar propuesta';
    }
  });
}

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzoa4BunEtlz6f4IwGpE4-Xf1OwrTqPPyLTP5-XIJ5G3_wXOaxl1IUSD9m7bLVjyZmH/exec";

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Traducimos los nombres del frontend a los que espera Apps Script
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
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
      statusEl.textContent = "";

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        statusEl.textContent = "Mensaje enviado correctamente.";
        form.reset();
      } else {
        statusEl.textContent = "No se pudo enviar el formulario.";
        console.error("Respuesta del backend:", data);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      statusEl.textContent = "Ocurrió un error al enviar.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Solicitar propuesta";
    }
  });
}
