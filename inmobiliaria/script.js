setupDemoNavigation();

const realEstateForm = document.getElementById('realEstateForm');

if (realEstateForm) {
  realEstateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showDemoToast('Solicitud enviada. Este formulario puede conectarse a CRM, correo o WhatsApp.');
    realEstateForm.reset();
  });
}
