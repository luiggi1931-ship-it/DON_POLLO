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

// Control de ventilador
let ventiladorEncendido = false;
let velocidadActual = 'medio';

function encenderVentilador() {
    const ventilador = document.getElementById('ventilador');
    const estado = document.getElementById('estado-ventilador');
    const estadoDisplay = estado.parentElement;
    
    ventilador.classList.remove('girando-lento', 'girando-medio', 'girando-rapido');
    ventilador.classList.add(`girando-${velocidadActual}`);
    
    estado.textContent = 'Encendido';
    estadoDisplay.classList.remove('apagado');
    estadoDisplay.classList.add('encendido');
    ventiladorEncendido = true;
    
    mostrarNotificacion('Ventilador encendido', 'success');
}

function apagarVentilador() {
    const ventilador = document.getElementById('ventilador');
    const estado = document.getElementById('estado-ventilador');
    const estadoDisplay = estado.parentElement;
    
    ventilador.classList.remove('girando-lento', 'girando-medio', 'girando-rapido');
    estado.textContent = 'Apagado';
    estadoDisplay.classList.remove('encendido');
    estadoDisplay.classList.add('apagado');
    ventiladorEncendido = false;
    
    mostrarNotificacion('Ventilador apagado', 'info');
}

