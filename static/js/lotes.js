document.addEventListener('DOMContentLoaded', function() {
    
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const modalLote = document.getElementById('modalLote');
    const modalConfirmar = document.getElementById('modalConfirmar');
    const modalMortalidad = document.getElementById('modalMortalidad');
    const modalJaulas = document.getElementById('modalJaulas'); // Nuevo Modal
    const btnNuevoLote = document.getElementById('btnNuevoLote');
    const btnGestionJaulas = document.getElementById('btnGestionJaulas'); // Nuevo Botón
    const formLote = document.getElementById('formLote');
    
    // Botones de cancelar en los modales
    const btnCancelar = document.getElementById('btnCancelar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

    // Variable para guardar temporalmente el ID a eliminar
    let idLoteAEliminar = null;

    // --- 1. LÓGICA DE APERTURA DE MODAL "NUEVO LOTE" ---
    if (btnNuevoLote) {
        btnNuevoLote.addEventListener('click', () => {
            // Limpiamos el formulario completo
            formLote.reset();
            
            // IMPORTANTE: Asegurar que el ID oculto esté vacío para que Flask sepa que es CREAR
            document.getElementById('idLote').value = '';
            
            // Restablecer títulos y estado visual
            document.getElementById('modalTitle').textContent = 'Registrar Nuevo Lote';
            document.getElementById('btnSubmit').textContent = 'Registrar Lote';
            document.getElementById('rowFechaCierre').style.display = 'none';
            // Mostrar selector de jaulas al crear
            if(document.getElementById('groupJaulas')) document.getElementById('groupJaulas').style.display = 'block';
            
            // Mostrar modal
            modalLote.style.display = 'block';
        });

        // VALIDACIÓN AL ENVIAR FORMULARIO (Solo si es nuevo lote)
        formLote.addEventListener('submit', function(e) {
            const idLote = document.getElementById('idLote').value;
            
            // Si idLote está vacío, es un registro NUEVO
            if (!idLote) {
                const checkboxes = document.querySelectorAll('input[name="jaulas_seleccionadas"]:checked');
                
                if (checkboxes.length !== 4) {
                    e.preventDefault(); // Detener envío
                    alert(`❌ Error: Debes seleccionar exactamente 4 jaulas.\n\nHas seleccionado: ${checkboxes.length}`);
                    return false;
                }
            }
            // Si es edición, no validamos jaulas porque esa sección está oculta
            return true;
        });
    }

    // --- 1.1 LÓGICA DE APERTURA DE MODAL "GESTIONAR JAULAS" ---
    if (btnGestionJaulas) {
        btnGestionJaulas.addEventListener('click', () => {
            modalJaulas.style.display = 'block';
        });
    }

    // --- 2. LÓGICA DE EDICIÓN (La función "Blindada") ---
    // Esta función se llama directamente desde el HTML con onclick="cargarDatosEdicion(this)"
    window.cargarDatosEdicion = function(btn) {
        // Extraemos los datos seguros desde el botón
        const id = btn.getAttribute('data-id');
        const fecha = btn.getAttribute('data-fecha'); // YYYY-MM-DD
        const cantidad = btn.getAttribute('data-cantidad');
        const edad = btn.getAttribute('data-edad');
        const proveedor = btn.getAttribute('data-proveedor');
        const tipo = btn.getAttribute('data-tipo');
        const peso = btn.getAttribute('data-peso');
        const estado = btn.getAttribute('data-estado'); // '1' o '0' (o 'True'/'False')
        const cierre = btn.getAttribute('data-cierre'); // YYYY-MM-DD o vacío
        const obs = btn.getAttribute('data-obs');

        // Rellenamos el formulario
        document.getElementById('idLote').value = id;
        document.getElementById('fechaIngreso').value = fecha;
        document.getElementById('cantidadInicial').value = cantidad;
        document.getElementById('edadInicial').value = edad || 0;
        document.getElementById('proveedor').value = proveedor;
        document.getElementById('tipoAve').value = tipo;
        document.getElementById('pesoInicial').value = peso;
        document.getElementById('observaciones').value = obs;

        // Lógica del Select de Estado
        const selectEstado = document.getElementById('estado');
        const rowCierre = document.getElementById('rowFechaCierre');

        // Flask guarda 1/0, pero a veces Jinja puede pasar True/False o string
        if (estado == '1' || estado == 'True' || estado == 'ACTIVO') {
            selectEstado.value = 'ACTIVO';
            rowCierre.style.display = 'none';
            document.getElementById('fechaCierre').value = ''; 
        } else {
            selectEstado.value = 'CERRADO';
            rowCierre.style.display = 'flex'; // Usamos flex porque en CSS .form-row es flex
            document.getElementById('fechaCierre').value = cierre;
        }

        // Cambiar textos para modo edición
        document.getElementById('modalTitle').textContent = 'Editar Lote #' + id;
        document.getElementById('btnSubmit').textContent = 'Actualizar Lote';
        
        // Ocultar selector de jaulas al editar (para mantener integridad)
        if(document.getElementById('groupJaulas')) document.getElementById('groupJaulas').style.display = 'none';

        // Mostrar modal
        modalLote.style.display = 'block';
    };

    // --- 3. LÓGICA DE ESTADO (Mostrar/Ocultar Fecha Cierre) ---
    // Se llama desde el HTML con onchange="toggleFechaCierre()"
    window.toggleFechaCierre = function() {
        const estado = document.getElementById('estado').value;
        const row = document.getElementById('rowFechaCierre');
        
        if (estado === 'CERRADO') {
            row.style.display = 'flex';
            // Opcional: Poner la fecha de hoy automáticamente al cerrar
            if (!document.getElementById('fechaCierre').value) {
                document.getElementById('fechaCierre').valueAsDate = new Date();
            }
        } else {
            row.style.display = 'none';
            document.getElementById('fechaCierre').value = '';
        }
    };

    // --- 4. LÓGICA DE ELIMINACIÓN ---
    window.eliminarLote = function(id) {
        idLoteAEliminar = id;
        modalConfirmar.style.display = 'block';
    };

    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', () => {
            if (idLoteAEliminar) {
                // Crear un formulario dinámico para enviar POST (Más seguro que GET)
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = `/eliminar_lote/${idLoteAEliminar}`;
                document.body.appendChild(form);
                form.submit();
            }
        });
    }

    // --- 4.1 LÓGICA DE ELIMINACIÓN DE JAULA ---
    window.eliminarJaula = function(id) {
        if(confirm('¿Estás seguro de eliminar esta jaula?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/eliminar_jaula/${id}`;
            document.body.appendChild(form);
            form.submit();
        }
    };

    // --- 5. LÓGICA MORTALIDAD ---
    window.abrirModalMortalidad = function(idLote) {
        document.getElementById('idLoteMortalidad').value = idLote;
        // Poner fecha de hoy por defecto
        const today = new Date().toISOString().split('T')[0];
        document.querySelector('#modalMortalidad input[type="date"]').value = today;
        
        modalMortalidad.style.display = 'block';
    };

    // --- 5. LÓGICA PARA CERRAR MODALES (Botones Cancelar y X) ---
    
    // Función genérica para cerrar cualquier modal
    function cerrarModal(modal) {
        modal.style.display = 'none';
    }

    // Eventos para botones Cancelar
    if(btnCancelar) btnCancelar.onclick = () => cerrarModal(modalLote);
    if(btnCancelarEliminar) btnCancelarEliminar.onclick = () => cerrarModal(modalConfirmar);

    // Eventos para las "X" (clase .close y similares)
    document.querySelectorAll('.close, .close-confirmar, .close-mortalidad, .close-jaulas').forEach(x => {
        x.onclick = function() {
            cerrarModal(this.closest('.modal'));
        }
    });

    // Cerrar al hacer clic fuera del contenido del modal
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }
});