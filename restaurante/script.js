setupDemoNavigation();

const reserveForm = document.getElementById('reserveForm');
if (reserveForm) {
  reserveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showDemoToast('Solicitud demo enviada. Luego puedes conectarla a WhatsApp o correo.');
    reserveForm.reset();
  });
}
