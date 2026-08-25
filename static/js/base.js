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
    const notifBadge = document.getElementById('notifBadge');
    const notifBody = document.getElementById('notifBody');
    const markAllReadBtn = document.getElementById('markAllRead');
    
    let notificaciones = [];

    window.addNotification = function(type, message, timeStr = 'Justo ahora') {
        const notif = { id: Date.now(), type, message, timeStr, read: false };
        notificaciones.unshift(notif);
        if (notificaciones.length > 10) notificaciones.pop();
        renderNotificaciones();

        // Auto eliminar después de 15 segundos
        setTimeout(() => {
            notificaciones = notificaciones.filter(n => n.id !== notif.id);
            renderNotificaciones();
        }, 15000);
    };

    function renderNotificaciones() {
        if (!notifBody) return;
        
        let unreadCount = notificaciones.filter(n => !n.read).length;
        if (unreadCount > 0) {
            notifBadge.style.display = 'flex';
            notifBadge.textContent = unreadCount;
        } else {
            notifBadge.style.display = 'none';
        }

        if (notificaciones.length === 0) {
            notifBody.innerHTML = '<div class="empty-notif" style="text-align: center; color: #94a3b8; padding: 20px;">No hay alertas recientes</div>';
            return;
        }

        let html = '';
        notificaciones.forEach((n, index) => {
            let iconClass = 'info';
            let iconCode = 'fa-info-circle';
            if (n.type === 'warning') { iconClass = 'warning'; iconCode = 'fa-exclamation-triangle'; }
            if (n.type === 'danger') { iconClass = 'danger'; iconCode = 'fa-skull-crossbones'; }
            
            html += `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notif-icon ${iconClass}"><i class="fas ${iconCode}"></i></div>
                <div class="notif-content">
                  <p>${n.message}</p>
                  <span>${n.timeStr}</span>
                </div>
                <button class="notif-close-btn" onclick="removeNotification(event, ${n.id})"><i class="fas fa-times"></i></button>
            </div>`;
        });
        notifBody.innerHTML = html;
    }

    window.removeNotification = function(event, id) {
        if (event) event.stopPropagation();
        notificaciones = notificaciones.filter(n => n.id !== id);
        renderNotificaciones();
    };

    if (notifToggle && notifPopup) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPopup.classList.toggle('active');
            // Marcar todas como leídas al abrir
            notificaciones.forEach(n => n.read = true);
            renderNotificaciones();
        });

        document.addEventListener('click', (e) => {
            if (!notifToggle.contains(e.target) && !notifPopup.contains(e.target)) {
                notifPopup.classList.remove('active');
            }
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificaciones = []; // Limpiar todas
            renderNotificaciones();
        });
    }

    // --- Flatpickr Global (Selector de Fechas) ---
    if (typeof flatpickr !== 'undefined') {
        flatpickr("input[type=date]", {
            locale: "es",           // Idioma español
            dateFormat: "Y-m-d",    // Formato real que se envía a Flask/BD
            altInput: true,         // Oculta el original y muestra uno bonito
            altFormat: "d M Y",     // Formato visible: 23 Ago 2026
            disableMobile: "true",  // Fuerza a usar el calendario bonito, no el nativo del cel/tablet
            theme: "dark"           // Fuerza explícita del tema oscuro (si lo soporta así)
        });
    }
});