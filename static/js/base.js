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

    // Cargar notificaciones activas desde BD
    fetch('/api/alertas/activas')
        .then(r => r.json())
        .then(data => {
            notificaciones = data;
            renderNotificaciones();
        })
        .catch(e => console.error('Error cargando alertas:', e));

    // Función que llama el dashboard para añadir alertas a la UI local (y a la BD opcionalmente, 
    // pero el dashboard ya hará el POST a la BD, así que aquí solo añadimos a la lista si tiene ID)
    window.addNotification = function(notif) {
        notificaciones.unshift(notif);
        if (notificaciones.length > 20) notificaciones.pop();
        renderNotificaciones();
    };

    function renderNotificaciones() {
        if (!notifBody) return;
        
        let unreadCount = notificaciones.filter(n => !n.leida).length;
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
        notificaciones.forEach((n) => {
            let iconClass = 'info';
            let iconCode = 'fa-info-circle';
            if (n.tipo === 'warning') { iconClass = 'warning'; iconCode = 'fa-exclamation-triangle'; }
            if (n.tipo === 'danger') { iconClass = 'danger'; iconCode = 'fa-skull-crossbones'; }
            
            html += `
            <div class="notif-item ${n.leida ? '' : 'unread'}" data-id="${n.id}">
                <div class="notif-icon ${iconClass}"><i class="fas ${iconCode}"></i></div>
                <div class="notif-content">
                  <p>${n.mensaje}</p>
                  <span>${n.fecha}</span>
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
        
        // Marcar como leída en la BD
        fetch(`/api/alertas/marcar_leida/${id}`, { method: 'POST' })
            .catch(e => console.error('Error descartando alerta:', e));
    };

    if (notifToggle && notifPopup) {
        notifToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notifPopup.classList.toggle('active');
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
            notificaciones = [];
            renderNotificaciones();
            fetch('/api/alertas/marcar_todas', { method: 'POST' });
        });
    }

    // --- Modal de Historial ---
    window.abrirHistorialAlertas = function(event) {
        if (event) event.preventDefault();
        const modal = document.getElementById('historialAlertasModal');
        if (modal) modal.style.display = 'flex';
        notifPopup.classList.remove('active'); // cerrar campana

        const body = document.getElementById('historialBody');
        body.innerHTML = '<p style="text-align: center; color: #94a3b8; padding:20px;">Cargando historial...</p>';

        fetch('/api/alertas/historial')
            .then(r => r.json())
            .then(data => {
                if(data.length === 0) {
                    body.innerHTML = '<p style="text-align: center; color: #94a3b8; padding:20px;">El historial está vacío.</p>';
                    return;
                }
                let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
                data.forEach(n => {
                    let typeClass = n.tipo === 'danger' ? 'history-item-danger' : (n.tipo === 'warning' ? 'history-item-warning' : 'history-item-info');
                    html += `
                    <div class="history-item ${typeClass}">
                        <div>
                            <div class="history-item-title">${n.mensaje}</div>
                            <div class="history-item-date">${n.fecha}</div>
                        </div>
                    </div>`;
                });
                html += '</div>';
                body.innerHTML = html;
            })
            .catch(e => {
                body.innerHTML = '<p style="text-align: center; color: #ef4444;">Error al cargar historial.</p>';
            });
    };

    window.cerrarHistorialAlertas = function() {
        const modal = document.getElementById('historialAlertasModal');
        if (modal) modal.style.display = 'none';
    };

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