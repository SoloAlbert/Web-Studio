const restaurantToggle = document.querySelector('.menu-toggle');
const restaurantNav = document.querySelector('.site-nav');

if (restaurantToggle && restaurantNav) {
  restaurantToggle.addEventListener('click', () => {
    const isOpen = restaurantNav.classList.toggle('open');
    restaurantToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    restaurantNav?.classList.remove('open');
    restaurantToggle?.setAttribute('aria-expanded', 'false');
  });
});

const reserveForm = document.getElementById('reserveForm');
if (reserveForm) {
  reserveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Solicitud demo enviada. Luego puedes conectarla a WhatsApp o correo.';
    document.body.appendChild(toast);
    reserveForm.reset();
    setTimeout(() => toast.remove(), 3000);
  });
}
