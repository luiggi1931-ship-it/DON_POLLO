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
});