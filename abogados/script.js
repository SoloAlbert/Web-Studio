const lawToggle = document.querySelector('.menu-toggle');
const lawNav = document.querySelector('.site-nav');

if (lawToggle && lawNav) {
  lawToggle.addEventListener('click', () => {
    const isOpen = lawNav.classList.toggle('open');
    lawToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    lawNav?.classList.remove('open');
    lawToggle?.setAttribute('aria-expanded', 'false');
  });
});

const lawForm = document.getElementById('lawForm');
if (lawForm) {
  lawForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Consulta enviada.';
    document.body.appendChild(toast);
    lawForm.reset();
    setTimeout(() => toast.remove(), 3000);
  });
}
