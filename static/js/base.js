document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('mainSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    // Función para alternar el menú
    const toggleMenu = () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        toggleBtn.classList.toggle('active');
        
        const icon = toggleBtn.querySelector('i');
        if (sidebar.classList.contains('open')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    };

    toggleBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // --- Notificaciones ---
    const notifToggle = document.getElementById('notifToggle');
    const notifPopup = document.getElementById('notifPopup');

    if (notifToggle && notifPopup) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPopup.classList.toggle('active');
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!notifToggle.contains(e.target) && !notifPopup.contains(e.target)) {
                notifPopup.classList.remove('active');
            }
        });
    }
});