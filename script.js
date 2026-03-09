const EMAILJS_CONFIG = {
  publicKey: "JFN5qz6GxAtQzwg71",
  serviceId: "service_do4br56",
  templateId: "template_kbrtznd"
};

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

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    if (typeof emailjs === 'undefined') {
      setStatus('Falta cargar EmailJS. Revisa el script CDN antes de script.js.', 'error');
      return;
    }

    if (hasEmailJsPlaceholders) {
      setStatus('El formulario está listo, pero aún faltan tus credenciales de EmailJS en script.js.', 'info');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    setStatus('');

    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

      await emailjs.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        form
      );

      form.reset();
      setStatus('Mensaje enviado. Te contactaremos pronto.', 'success');
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setStatus('No se pudo enviar el mensaje. Revisa tus IDs de EmailJS o intenta de nuevo.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar propuesta';
    }
  });
}
