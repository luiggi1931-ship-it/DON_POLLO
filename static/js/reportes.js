document.addEventListener('DOMContentLoaded', () => {
    let currentLoteId = null;
    let lineChartInstance = null;
    let pieChartInstance = null;

    const loteSelect = document.getElementById('lote-reporte-select');
    const contentDiv = document.getElementById('reporte-content');
    const emptyState = document.getElementById('reporte-empty-state');

    // Inicializar Tom Select para dropdown premium
    const tsControl = new TomSelect(loteSelect, {
        create: false,
        sortField: { field: "text", direction: "asc" },
        placeholder: "Seleccione un Lote..."
    });

    tsControl.on('change', function(value) {
        if (value) {
            currentLoteId = value;
            emptyState.style.display = 'none';
            contentDiv.style.display = 'block';
            document.getElementById('export-buttons').style.display = 'flex';
            cargarReportes(currentLoteId);
        } else {
            currentLoteId = null;
            emptyState.style.display = 'block';
            contentDiv.style.display = 'none';
            document.getElementById('export-buttons').style.display = 'none';
        }
    });

    window.exportarReporte = function(formato) {
        if (!currentLoteId) {
            alert('Por favor, seleccione un lote primero.');
            return;
        }
        // Redirigir a la URL de descarga (el navegador descargará el archivo)
        window.location.href = `/api/reportes/exportar/${formato}/${currentLoteId}`;
    };

    function cargarReportes(idLote) {
        cargarTelemetria(idLote);
        cargarSanidad(idLote);
    }

    function cargarTelemetria(idLote) {
        fetch(`/api/reportes/telemetria/${idLote}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) return;
                renderLineChart(data.line_chart);
                renderPieChart(data.pie_chart);
            })
            .catch(e => console.error('Error cargando telemetría histórica', e));
    }

    function cargarSanidad(idLote) {
        fetch(`/api/reportes/sanidad/${idLote}`)
            .then(r => r.json())
            .then(data => {
                renderMortalidad(data.mortalidad_total, data.mortalidad_detalle);
                renderVacunas(data.vacunas, data.alertas_vacunacion);
            })
            .catch(e => console.error('Error cargando sanidad', e));
    }

    function renderLineChart(data) {
        const ctx = document.getElementById('historicoAmbientalChart').getContext('2d');
        if (lineChartInstance) lineChartInstance.destroy();

        lineChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: data.temperatura,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Humedad (%)',
                        data: data.humedad,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Amoníaco (ppm)',
                        data: data.amoniaco,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                }
            }
        });
    }

    function renderPieChart(data) {
        const ctx = document.getElementById('consumosPieChart').getContext('2d');
        if (pieChartInstance) pieChartInstance.destroy();

        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Agua Consumida', 'Agua Faltante', 'Alimento Consumido', 'Alimento Faltante'],
                datasets: [{
                    data: [
                        data.agua_consumida, 
                        Math.max(0, data.agua_esperada - data.agua_consumida),
                        data.alimento_consumido,
                        Math.max(0, data.alimento_esperado - data.alimento_consumido)
                    ],
                    backgroundColor: [
                        '#3b82f6', // Agua cons
                        'rgba(59, 130, 246, 0.2)', // Agua falt
                        '#f59e0b', // Alimento cons
                        'rgba(245, 158, 11, 0.2)'  // Alimento falt
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#e2e8f0', boxWidth: 12 } }
                }
            }
        });
    }

    function renderMortalidad(total, detalle) {
        document.getElementById('mortalidad-total-text').innerText = `${total} Bajas`;
        const tbody = document.getElementById('tabla-mortalidad-body');
        
        if (detalle.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">No hay registros de bajas</td></tr>';
            return;
        }

        tbody.innerHTML = detalle.map(d => `
            <tr>
                <td>${d.causa}</td>
                <td><strong>${d.cantidad}</strong></td>
            </tr>
        `).join('');
    }

    function renderVacunas(historial, alertas) {
        // Alertas
        const container = document.getElementById('alertas-vacunacion-container');
        if (alertas.length === 0) {
            container.innerHTML = `
                <div class="alerta-item" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981;">
                    <div class="alerta-icon" style="color: #10b981;"><i class="fas fa-check-circle"></i></div>
                    <div class="alerta-content">
                        <strong>Todo en orden</strong>
                        <span>No hay vacunas pendientes para la edad actual del lote.</span>
                    </div>
                </div>`;
        } else {
            container.innerHTML = alertas.map(a => `
                <div class="alerta-item ${a.tipo}">
                    <div class="alerta-icon">
                        <i class="fas ${a.tipo === 'danger' ? 'fa-exclamation-triangle' : 'fa-bell'}"></i>
                    </div>
                    <div class="alerta-content">
                        <strong>${a.vacuna}</strong>
                        <span>${a.mensaje}</span>
                    </div>
                </div>
            `).join('');
        }

        // Historial
        const tbody = document.getElementById('tabla-vacunas-body');
        if (historial.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Sin vacunas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = historial.map(h => `
            <tr>
                <td><strong>${h.vacuna_nombre}</strong></td>
                <td>${h.fecha_aplicacion}</td>
                <td><span class="status-badge" style="background: #10b98122; color: #10b981; border: 1px solid #10b981;">${h.estado}</span></td>
            </tr>
        `).join('');
    }

    window.registrarVacuna = async () => {
        const idVacuna = document.getElementById('select-vacuna-aplicar').value;
        if(!idVacuna || !currentLoteId) {
            alert('Seleccione un lote y una vacuna');
            return;
        }

        try {
            const res = await fetch('/api/vacunacion/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_lote: currentLoteId,
                    id_vacuna: idVacuna,
                    estado: 'Aplicada'
                })
            });
            const data = await res.json();
            if (data.success) {
                cargarSanidad(currentLoteId); // Recargar
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error registrando vacuna:', error);
        }
    };

    /* LÓGICA DE PESTAÑAS Y FINANZAS */
    let finChartInstance = null;

    window.switchTab = function(tabName) {
        // Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-tab-${tabName}`).classList.add('active');

        // Content
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Controls
        if(tabName === 'clinico') {
            document.getElementById('controles-clinico').style.display = 'block';
            document.getElementById('controles-financiero').style.display = 'none';
        } else {
            document.getElementById('controles-clinico').style.display = 'none';
            document.getElementById('controles-financiero').style.display = 'flex';
            // Auto-load if empty
            if(!finChartInstance) {
                cargarFechasDefecto();
                cargarReporteFinanciero();
            }
        }
    }

    function cargarFechasDefecto() {
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setDate(hoy.getDate() - 30);
        
        document.getElementById('fecha-fin').value = hoy.toISOString().split('T')[0];
        document.getElementById('fecha-inicio').value = haceUnMes.toISOString().split('T')[0];
    }

    window.cargarReporteFinanciero = async function() {
        const inicio = document.getElementById('fecha-inicio').value;
        const fin = document.getElementById('fecha-fin').value;
        const btn = document.querySelector('#controles-financiero .btn-primary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        btn.disabled = true;

        try {
            const res = await fetch(`/api/reportes/financiero?inicio=${inicio}&fin=${fin}`);
            if (!res.ok) {
                const textError = await res.text();
                console.error("Server Error:", textError);
                alert("Error en el servidor: " + res.status + "\n" + textError.substring(0, 100));
                return;
            }
            const data = await res.json();

            // Update KPIs
            document.getElementById('fin-ingresos').innerText = `$${data.resumen.total_ingresos.toFixed(2)}`;
            document.getElementById('fin-gastos').innerText = `$${data.resumen.total_gastos.toFixed(2)}`;
            document.getElementById('fin-ganancia').innerText = `$${data.resumen.ganancia_neta.toFixed(2)}`;
            
            // Color Ganancia
            if(data.resumen.ganancia_neta >= 0) {
                document.getElementById('fin-ganancia').style.color = '#10b981';
            } else {
                document.getElementById('fin-ganancia').style.color = '#ef4444';
            }

            renderFinChart(data.grafico);
        } catch(err) {
            console.error("Error al cargar reporte financiero:", err);
            alert("Error de conexión o de datos: " + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    function renderFinChart(graficoData) {
        const ctx = document.getElementById('evolucionFinancieraChart').getContext('2d');
        
        if(finChartInstance) finChartInstance.destroy();

        finChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: graficoData.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: graficoData.ingresos,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Gastos',
                        data: graficoData.gastos,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }
});
