setupDemoNavigation();

const hotelForm = document.getElementById('hotelForm');

if (hotelForm) {
  hotelForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showDemoToast('Solicitud enviada. Este formulario puede conectarse a motor de reservas, correo o WhatsApp.');
    hotelForm.reset();
  });
}
