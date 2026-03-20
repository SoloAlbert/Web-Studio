setupDemoNavigation();

const lawForm = document.getElementById('lawForm');
if (lawForm) {
  lawForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showDemoToast('Consulta enviada.');
    lawForm.reset();
  });
}
