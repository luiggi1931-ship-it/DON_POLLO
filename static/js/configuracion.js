document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            const targetPanel = document.getElementById(tabId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Cargar configuración desde la BD al abrir la página
    cargarConfiguracionDeBD();
});

// Obtener datos de los inputs
function obtenerDatos() {
    const parametros = ['humedad', 'temperatura', 'amonico', 'iluminacion', 'comida', 'agua'];
    const etapas = ['pequeno', 'mediano', 'grande'];
    const rangos = ['min', 'max'];
    const datos = {};
    
    parametros.forEach(parametro => {
        datos[parametro] = {};
        etapas.forEach(etapa => {
            datos[parametro][etapa] = {};
            rangos.forEach(rango => {
                const id = `${parametro}_${etapa}_${rango}`;
                const elemento = document.getElementById(id);
                if (elemento) {
                    datos[parametro][etapa][rango] = parseFloat(elemento.value) || 0;
                }
            });
        });
    });
    return datos;
}

// Establecer datos en los inputs
function establecerDatos(datos) {
    const parametros = ['humedad', 'temperatura', 'amonico', 'iluminacion', 'comida', 'agua'];
    const etapas = ['pequeno', 'mediano', 'grande'];
    const rangos = ['min', 'max'];
    
    parametros.forEach(parametro => {
        if (datos[parametro]) {
            etapas.forEach(etapa => {
                if (datos[parametro][etapa]) {
                    rangos.forEach(rango => {
                        const id = `${parametro}_${etapa}_${rango}`;
                        const elemento = document.getElementById(id);
                        if (elemento && datos[parametro][etapa][rango] !== undefined) {
                            elemento.value = datos[parametro][etapa][rango];
                        }
                    });
                }
            });
        }
    });
}

// Cargar configuración de la BD
function cargarConfiguracionDeBD() {
    fetch('/api/obtener_configuracion')
        .then(response => response.json())
        .then(datos => {
            console.log('Datos cargados de la BD:', datos);
            establecerDatos(datos);
            mostrarNotificacion('Configuración cargada desde la BD', 'info');
        })
        .catch(error => {
            console.error('Error al cargar configuración:', error);
            // Si hay error, usar los valores por defecto del HTML (que ya tienen value="")
            mostrarNotificacion('Usando configuración por defecto', 'info');
        });
}

// Guardar datos en la BD
function guardarDatos() {
    const datos = obtenerDatos();
    
    fetch('/api/guardar_configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(resultado => {
        if (resultado.success) {
            mostrarNotificacion('✓ Configuración guardada en la BD', 'success');
        } else {
            mostrarNotificacion('Error: ' + resultado.error, 'warning');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al guardar', 'warning');
    });
}

// Resetear a valores por defecto
function resetearDatos() {
    if (confirm('¿Resetear a valores por defecto?')) {
        const elementos = document.querySelectorAll('input[type="number"]');
        elementos.forEach(el => {
            el.value = el.getAttribute('value');
        });
        guardarDatos();
        mostrarNotificacion('Valores reseteados', 'info');
    }
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        border-radius: 10px; font-size: 1.1em; font-weight: 600;
        z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    const colores = {
        success: { bg: '#38a169', color: 'white' },
        warning: { bg: '#d69e2e', color: 'white' },
        info: { bg: '#3182ce', color: 'white' }
    };
    
    const c = colores[tipo] || colores.info;
    notificacion.style.background = c.bg;
    notificacion.style.color = c.color;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notificacion), 300);
    }, 3000);
}

// Control único de actuadores (Power Button)
const actuadoresEstado = {
    ventilador: false,
    calefaccion: false,
    agua: false,
    comida: false
};

function togglePower(actuadorId) {
    const estadoActual = actuadoresEstado[actuadorId];
    const nuevoEstado = !estadoActual;
    actuadoresEstado[actuadorId] = nuevoEstado;

    const btn = document.getElementById(`btn-${actuadorId}`);
    const badge = document.getElementById(`badge-${actuadorId}`);
    const textoEstado = document.getElementById(`estado-${actuadorId}`);
    const iconContainer = document.getElementById(actuadorId);

    if (nuevoEstado) {
        // Encender
        btn.classList.add('active');
        badge.classList.remove('apagado');
        badge.classList.add('encendido');

        if (actuadorId === 'ventilador') {
            textoEstado.textContent = 'Encendido';
            iconContainer.classList.add('girando-rapido'); // Podemos usar medio o rápido
            mostrarNotificacion('Ventilador encendido', 'success');
        } else if (actuadorId === 'calefaccion') {
            textoEstado.textContent = 'Encendido';
            iconContainer.classList.add('activo');
            mostrarNotificacion('Calefacción encendida', 'success');
        } else if (actuadorId === 'agua') {
            textoEstado.textContent = 'Activo';
            iconContainer.classList.add('activo');
            mostrarNotificacion('Sist. de Agua activado', 'success');
        } else if (actuadorId === 'comida') {
            textoEstado.textContent = 'Activo';
            iconContainer.classList.add('activo');
            mostrarNotificacion('Sist. de Comida activado', 'success');
        }
    } else {
        // Apagar
        btn.classList.remove('active');
        badge.classList.remove('encendido');
        badge.classList.add('apagado');

        if (actuadorId === 'ventilador') {
            textoEstado.textContent = 'Apagado';
            iconContainer.classList.remove('girando-rapido', 'girando-medio', 'girando-lento');
            mostrarNotificacion('Ventilador apagado', 'info');
        } else if (actuadorId === 'calefaccion') {
            textoEstado.textContent = 'Apagado';
            iconContainer.classList.remove('activo');
            mostrarNotificacion('Calefacción apagada', 'info');
        } else if (actuadorId === 'agua') {
            textoEstado.textContent = 'Detenido';
            iconContainer.classList.remove('activo');
            mostrarNotificacion('Sist. de Agua detenido', 'info');
        } else if (actuadorId === 'comida') {
            textoEstado.textContent = 'Detenido';
            iconContainer.classList.remove('activo');
            mostrarNotificacion('Sist. de Comida detenido', 'info');
        }
    }
}

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Al cargar, si estamos en la pestaña usuarios, cargar datos
    const tabUsuarios = document.querySelector('[data-tab="usuarios"]');
    if(tabUsuarios) {
        tabUsuarios.addEventListener('click', cargarUsuarios);
        // Si ya está activa por defecto (poco probable, pero por si acaso)
        if(tabUsuarios.classList.contains('active')) cargarUsuarios();
    }
});

function cargarUsuarios() {
    fetch('/api/usuarios')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('usuarios-tbody');
            if(!tbody) return;
            tbody.innerHTML = '';
            
            data.forEach(user => {
                const tr = document.createElement('tr');
                let rolClass = 'badge-rol rol-operador';
                if(user.rol === 'ADMIN') rolClass = 'badge-rol rol-admin';
                if(user.rol === 'TECNICO') rolClass = 'badge-rol rol-tecnico';
                
                tr.innerHTML = `
                    <td>${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td><span class="${rolClass}">${user.rol}</span></td>
                    <td>${user.fecha_creacion}</td>
                    <td>
                        <button class="btn-accion btn-editar" onclick="abrirModalUsuario(${user.id}, '${user.nombre}', '${user.rol}', '${user.correo}')" title="Editar Usuario"><i class="fas fa-edit"></i></button>
                        ${user.id !== 1 ? `<button class="btn-accion btn-eliminar" onclick="eliminarUsuario(${user.id})" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error cargando usuarios:", err));
}

function abrirModalUsuario(id = null, nombre = '', rol = 'OPERADOR', correo = '') {
    const modal = document.getElementById('modalUsuario');
    const form = document.getElementById('formUsuario');
    
    document.getElementById('userId').value = id || '';
    document.getElementById('userNombre').value = nombre;
    document.getElementById('userNombre').readOnly = false; // Permitir edición
    
    document.getElementById('userCorreo').value = correo === 'null' ? '' : correo;
    
    document.getElementById('userRol').value = rol;
    document.getElementById('userRol').disabled = false; // Permitir edición
    
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = !id; // Opcional al editar
    
    if (id) {
        document.getElementById('modalUsuarioTitle').innerText = 'Editar Usuario';
        document.getElementById('groupCorreo').style.display = 'block';
        document.getElementById('labelPassword').innerText = 'Nueva Contraseña (Opcional)';
    } else {
        document.getElementById('modalUsuarioTitle').innerText = 'Crear Nuevo Usuario';
        document.getElementById('groupCorreo').style.display = 'block';
        document.getElementById('labelPassword').innerText = 'Contraseña Inicial *';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').style.display = 'none';
}

function guardarUsuario(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const nombre = document.getElementById('userNombre').value;
    const correo = document.getElementById('userCorreo').value;
    
    const rol = document.getElementById('userRol').value;
    const password = document.getElementById('userPassword').value;
    
    const url = id ? `/api/usuarios/${id}` : '/api/usuarios';
    const method = id ? 'PUT' : 'POST';
    
    const payload = { nombre, correo, rol, password };
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            cerrarModalUsuario();
            mostrarNotificacion(data.mensaje, 'success');
            cargarUsuarios();
        } else {
            mostrarNotificacion(data.error, 'warning');
        }
    })
    .catch(err => {
        console.error(err);
        mostrarNotificacion('Error de red', 'warning');
    });
}

function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario? No podrá volver a ingresar.")) {
        fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion(data.mensaje, 'success');
                cargarUsuarios();
            } else {
                mostrarNotificacion(data.error, 'warning');
            }
        });
    }
}
