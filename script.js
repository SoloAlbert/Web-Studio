const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});

const agencyForm = document.getElementById('agencyForm');
if (agencyForm) {
  agencyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Solicitud demo enviada. Después puedes conectarla a correo, WhatsApp o backend propio.';
    document.body.appendChild(toast);
    agencyForm.reset();
    setTimeout(() => toast.remove(), 3200);
  });
}
