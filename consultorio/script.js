setupDemoNavigation();

const appointmentForm = document.getElementById('appointmentForm');

if (appointmentForm) {
  appointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showDemoToast('Solicitud enviada. Puedes conectar este flujo a WhatsApp, correo o CRM.');
    appointmentForm.reset();
  });
}
