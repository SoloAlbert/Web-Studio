setupDemoNavigation();

const builderForm = document.getElementById('builderForm');

if (builderForm) {
  builderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showDemoToast('Solicitud enviada. Puedes conectar este formulario a correo, CRM o WhatsApp.');
    builderForm.reset();
  });
}
