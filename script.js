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
    const isOpen = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
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

      emailjsClient.init({ publicKey: EMAILJS_CONFIG.publicKey });

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
        setStatus('No se pudo cargar o usar EmailJS. Revisa tus IDs, el servicio y la red.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar propuesta';
    }
  });
}
