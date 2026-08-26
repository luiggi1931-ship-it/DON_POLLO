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
            formLote.reset();
            
            // Reset Proveedor
            document.getElementById('proveedor').style.display = 'block';
            document.getElementById('proveedor').name = 'proveedor';
            document.getElementById('proveedor_nuevo').style.display = 'none';
            document.getElementById('proveedor_nuevo').name = '';
            document.getElementById('proveedor_nuevo').required = false;

            // Reset Tipo Ave
            document.getElementById('tipoAve').style.display = 'block';
            document.getElementById('tipoAve').name = 'tipo_ave';
            document.getElementById('tipoAve_nuevo').style.display = 'none';
            document.getElementById('tipoAve_nuevo').name = '';
            document.getElementById('tipoAve_nuevo').required = false;

            document.getElementById('idLote').value = '';
            document.getElementById('modalTitle').textContent = 'Registrar Nuevo Lote';
            document.getElementById('btnSubmit').textContent = 'Registrar Lote';
            document.getElementById('rowFechaCierre').style.display = 'none';
            ocultarErrorJaulas(); // Limpiar error previo
            if(document.getElementById('groupJaulas')) document.getElementById('groupJaulas').style.display = 'block';
            abrirModal(modalLote);
        });

        // Validación al enviar: mínimo 1 jaula seleccionada
        formLote.addEventListener('submit', function(e) {
            const idLote = document.getElementById('idLote').value;
            if (!idLote) {
                const checkboxes = document.querySelectorAll('input[name="jaulas_seleccionadas"]:checked');
                if (checkboxes.length < 1) {
                    e.preventDefault();
                    // Muestra error visual dentro del modal, sin alert() nativo
                    mostrarErrorJaulas(`Debes seleccionar al menos 1 jaula para asignar el lote.`);
                    return false;
                }
            }
            return true;
        });
    }

    // --- 1.1 LÓGICA DE APERTURA DE MODAL "GESTIONAR JAULAS" ---
    if (btnGestionJaulas) {
        btnGestionJaulas.addEventListener('click', () => abrirModal(modalJaulas));
    }

    // --- 2. LÓGICA DE EDICIÓN (La función "Blindada") ---
    // Esta función se llama directamente desde el HTML con onclick="cargarDatosEdicion(this)"
    window.cargarDatosEdicion = function(btn) {
        const id       = btn.getAttribute('data-id');
        const fecha    = btn.getAttribute('data-fecha');
        const cantidad = btn.getAttribute('data-cantidad');
        const edad     = btn.getAttribute('data-edad');
        const proveedor= btn.getAttribute('data-proveedor');
        const tipo     = btn.getAttribute('data-tipo');
        const peso     = btn.getAttribute('data-peso');
        const estado   = btn.getAttribute('data-estado');
        const cierre   = btn.getAttribute('data-cierre');
        const obs      = btn.getAttribute('data-obs');

        document.getElementById('idLote').value          = id;
        
        // Manejo compatible con Flatpickr para Fecha de Ingreso
        const inputIngreso = document.getElementById('fechaIngreso');
        if (inputIngreso._flatpickr) inputIngreso._flatpickr.setDate(fecha);
        else inputIngreso.value = fecha;
        document.getElementById('cantidadInicial').value = cantidad;
        document.getElementById('edadInicial').value     = edad || 0;
        // Lógica de llenado para Proveedor y Tipo de Ave
        function setSelectOrInput(selectId, inputId, valueToSet) {
            const selectEl = document.getElementById(selectId);
            const inputEl = document.getElementById(inputId);
            
            // Restablecer estilos y nombres
            selectEl.style.display = 'block';
            selectEl.name = selectId;
            inputEl.style.display = 'none';
            inputEl.name = '';
            inputEl.value = '';
            inputEl.required = false;

            // Verificar si el valor existe en las opciones del select
            let exists = false;
            for (let i = 0; i < selectEl.options.length; i++) {
                if (selectEl.options[i].value === valueToSet && valueToSet !== '') {
                    exists = true;
                    break;
                }
            }

            if (exists) {
                selectEl.value = valueToSet;
            } else if (valueToSet) {
                // El valor no está en la lista, usamos el input
                selectEl.value = '__NUEVO__';
                selectEl.style.display = 'none';
                selectEl.name = '';
                inputEl.style.display = 'block';
                inputEl.name = selectId;
                inputEl.value = valueToSet;
                inputEl.required = true;
            } else {
                selectEl.value = '';
            }
        }

        setSelectOrInput('proveedor', 'proveedor_nuevo', proveedor);
        setSelectOrInput('tipoAve', 'tipoAve_nuevo', tipo);
        
        document.getElementById('pesoInicial').value     = peso;
        document.getElementById('observaciones').value   = obs;

        const selectEstado = document.getElementById('estado');
        const rowCierre    = document.getElementById('rowFechaCierre');
        const inputCierre  = document.getElementById('fechaCierre');

        if (estado == '1' || estado == 'True' || estado == 'ACTIVO') {
            selectEstado.value = 'ACTIVO';
            rowCierre.style.display = 'none';
            if (inputCierre._flatpickr) inputCierre._flatpickr.clear();
            else inputCierre.value = '';
        } else {
            selectEstado.value = 'CERRADO';
            rowCierre.style.display = 'flex';
            if (inputCierre._flatpickr) inputCierre._flatpickr.setDate(cierre);
            else inputCierre.value = cierre;
        }

        document.getElementById('modalTitle').textContent = 'Editar Lote #' + id;
        document.getElementById('btnSubmit').textContent  = 'Actualizar Lote';
        if(document.getElementById('groupJaulas')) document.getElementById('groupJaulas').style.display = 'none';

        abrirModal(modalLote);
    };

    // --- 3. LÓGICA DE ESTADO (Mostrar/Ocultar Fecha Cierre) ---
    // Se llama desde el HTML con onchange="toggleFechaCierre()"
    window.toggleFechaCierre = function() {
        const estado = document.getElementById('estado').value;
        const row = document.getElementById('rowFechaCierre');
        const inputCierre = document.getElementById('fechaCierre');
        
        if (estado === 'CERRADO') {
            row.style.display = 'flex';
            if (!inputCierre.value) {
                const today = new Date().toISOString().split('T')[0];
                if (inputCierre._flatpickr) inputCierre._flatpickr.setDate(today);
                else inputCierre.value = today;
            }
        } else {
            row.style.display = 'none';
            if (inputCierre._flatpickr) inputCierre._flatpickr.clear();
            else inputCierre.value = '';
        }
    };

    // --- 4. LÓGICA DE ELIMINACIÓN ---
    window.eliminarLote = function(id) {
        idLoteAEliminar = id;
        abrirModal(modalConfirmar);
    };

    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', () => {
            if (idLoteAEliminar) {
                // URL_ELIMINAR_LOTE es inyectada por Jinja en lotes.html (extra_js)
                // Ej: "/eliminar_lote/" + 5 => "/eliminar_lote/5"
                const form  = document.createElement('form');
                form.method = 'POST';
                form.action = window.URL_ELIMINAR_LOTE + idLoteAEliminar;
                document.body.appendChild(form);
                form.submit();
            }
        });
    }

    // --- 4.1 LÓGICA DE ELIMINACIÓN DE JAULA ---
    window.eliminarJaula = function(url) {
        // url viene de data-url generado por url_for con el ID real en el loop Jinja
        if (confirm('\u00bfEstás seguro de eliminar esta jaula?')) {
            const form  = document.createElement('form');
            form.method = 'POST';
            form.action = url;
            document.body.appendChild(form);
            form.submit();
        }
    };

    // --- 5. LÓGICA MORTALIDAD ---
    window.abrirModalMortalidad = function(idLote) {
        document.getElementById('idLoteMortalidad').value = idLote;
        const today = new Date().toISOString().split('T')[0];
        
        const inputFecha = document.querySelector('#modalMortalidad input[name="fecha"]');
        if (inputFecha) {
            if (inputFecha._flatpickr) inputFecha._flatpickr.setDate(today);
            else inputFecha.value = today;
        }
        
        abrirModal(modalMortalidad);
    };

    // --- HELPERS: Abrir/cerrar modales con animación ---
    function abrirModal(modal) {
        modal.style.display = 'block';
        // Forzar reflow para que la animación de entrada funcione
        modal.querySelector('.modal-content').style.animation = 'none';
        modal.querySelector('.modal-content').offsetHeight; // reflow
        modal.querySelector('.modal-content').style.animation = '';
    }

    function cerrarModal(modal) {
        const content = modal.querySelector('.modal-content');
        // Animación de salida fluida
        content.style.animation = 'fadeOutModal 0.2s ease-out forwards';
        setTimeout(() => {
            modal.style.display = 'none';
            content.style.animation = '';
        }, 200);
    }

    // --- HELPERS: Mensajes de error en el modal de jaulas ---
    function mostrarErrorJaulas(msg) {
        let errEl = document.getElementById('error-jaulas');
        if (!errEl) {
            errEl = document.createElement('p');
            errEl.id = 'error-jaulas';
            errEl.style.cssText = 'color:#f87171;font-size:12px;margin-top:8px;display:flex;align-items:center;gap:6px;';
            // Insertar debajo del bloque de jaulas
            const group = document.getElementById('groupJaulas');
            if (group) group.appendChild(errEl);
        }
        errEl.textContent = '\u26a0\ufe0f ' + msg;
    }

    function ocultarErrorJaulas() {
        const errEl = document.getElementById('error-jaulas');
        if (errEl) errEl.textContent = '';
    }

    // Botones cancelar y X
    if(btnCancelar) btnCancelar.onclick = () => cerrarModal(modalLote);
    if(btnCancelarEliminar) btnCancelarEliminar.onclick = () => cerrarModal(modalConfirmar);

    document.querySelectorAll('.close, .close-confirmar, .close-mortalidad, .close-mortalidad-btn, .close-jaulas').forEach(x => {
        x.onclick = function() { cerrarModal(this.closest('.modal')); };
    });

    // Cerrar al hacer clic en el fondo oscuro del modal
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            cerrarModal(event.target);
        }
    };
});