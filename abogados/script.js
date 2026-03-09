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
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"], .btn');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Enviado ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2200);
    }
    let note = form.querySelector('.demo-message');
    if (!note) {
      note = document.createElement('p');
      note.className = 'demo-message';
      note.style.margin = '0';
      note.style.fontWeight = '700';
      note.style.color = '#8df3ff';
      form.appendChild(note);
    }
    note.textContent = 'Demo enviado. En el siguiente módulo lo conectamos a correo o backend real.';
  });
});
