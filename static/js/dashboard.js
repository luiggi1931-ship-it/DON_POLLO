document.addEventListener('DOMContentLoaded', () => {

    // --- 0a. DATOS REALES DEL SERVIDOR ---
    function cargarResumenReal() {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(data => {
                const r = data.resumen;
                // Actualizar cards de resumen si existen
                const el = id => document.getElementById(id);
                if (el('dash-lotes-activos'))  el('dash-lotes-activos').textContent  = r.lotes_activos;
                if (el('dash-lotes-cerrados')) el('dash-lotes-cerrados').textContent = r.lotes_cerrados;
                if (el('dash-total-aves'))     el('dash-total-aves').textContent     = r.total_aves.toLocaleString();
                if (el('dash-total-bajas'))    el('dash-total-bajas').textContent    = r.total_bajas;

                // Guardar globalmente para poder acceder a las jaulas
                window.dashboardLotesData = {};
                
                // Selector de lotes: poblar con lotes reales
                const sel = document.getElementById('lote-select');
                if (sel && data.lotes.length > 0) {
                    sel.innerHTML = data.lotes.map(l => {
                        window.dashboardLotesData[`lote${l.id}`] = l;
                        return `<option value="lote${l.id}" data-etapa="${l.tipo}">#${l.id} — ${l.tipo} (${l.edad_dias}d, ${l.aves} aves)</option>`;
                    }).join('');
                    
                    if (window.tsLoteDash) window.tsLoteDash.destroy();
                    window.tsLoteDash = new TomSelect(sel, {
                        create: false,
                        sortField: { field: "text", direction: "asc" },
                        placeholder: "🔍 Buscar Lote..."
                    });
                    
                    // Cargar parámetros del primer lote real
                    const primerLote = data.lotes[0];
                    currentLoteId = `lote${primerLote.id}`;
                    const etapaZootecnica = determinarEtapaPorEdad(primerLote.edad_dias);
                    actualizarBadgeEtapa(etapaZootecnica);
                    cargarParametrosConfiguracion(etapaZootecnica);
                }

                // Gráfica de mortalidad semanal real
                const trend = data.mortalidad_tendencia;
                if (trend && window._mortalidadChart) {
                    window._mortalidadChart.data.labels = trend.map(d => d.fecha);
                    window._mortalidadChart.data.datasets[0].data = trend.map(d => d.bajas);
                    window._mortalidadChart.update();
                }
            })
            .catch(e => console.warn('API dashboard no disponible:', e));
    }

    cargarResumenReal();

    // --- 0b. PARÁMETROS DE CONFIGURACIÓN (desde la BD) ---
    let parametrosConfig = {};
    let sensorStates = {};
    
    function determinarEtapaPorEdad(edad_dias) {
        if (edad_dias <= 28) return 'pequeno';
        if (edad_dias <= 56) return 'mediano';
        return 'grande';
    }

    function actualizarBadgeEtapa(etapa) {
        const badge = document.getElementById('etapa-badge');
        if (!badge) return;
        badge.style.display = 'inline-flex';
        badge.className = 'etapa-badge'; // Reset classes
        if (etapa === 'pequeno') {
            badge.classList.add('etapa-pequeno');
            badge.innerHTML = '<i class="fas fa-egg"></i> Etapa: Pequeño';
        } else if (etapa === 'mediano') {
            badge.classList.add('etapa-mediano');
            badge.innerHTML = '<i class="fas fa-kiwi-bird"></i> Etapa: Crecimiento';
        } else {
            badge.classList.add('etapa-grande');
            badge.innerHTML = '<i class="fas fa-crow"></i> Etapa: Grande';
        }
    }
    
    // Escuchar cambios en el selector de lote
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'lote-select') {
            const loteIdStr = e.target.value;
            if (window.dashboardLotesData && window.dashboardLotesData[loteIdStr]) {
                currentLoteId = loteIdStr;
                const lote = window.dashboardLotesData[loteIdStr];
                const etapaZootecnica = determinarEtapaPorEdad(lote.edad_dias);
                actualizarBadgeEtapa(etapaZootecnica);
                cargarParametrosConfiguracion(etapaZootecnica);
                
                // Limpiar graficos live
                liveLabels = getSyncedLabels();
                liveWaterData = getInitData(0);
                liveFoodData = getInitData(0);
            }
        }
    });

    // Cargar configuración de la etapa
    function cargarParametrosConfiguracion(etapa = 'mediano') {
        fetch(`/api/parametros_etapa/${etapa}`)
            .then(response => response.json())
            .then(data => {
                parametrosConfig = data;
                console.log('Parámetros cargados para etapa', etapa, ':', parametrosConfig);
                updateSensors(); // Actualizar sensores con nuevos parámetros
            })
            .catch(error => console.error('Error cargando parámetros:', error));
    }

    // Estado inicial 
    let currentLoteId = null; 

    // Variables Globales
    let currentGlobalSensors = {
        humidity: 50,
        ammonia: 0
    };



    // --- 7. SENSORES REALES CONECTADOS A LA BD (TELEMETRÍA) ---
    function updateSensors() {
        if (!currentLoteId || !currentLoteId.startsWith('lote')) return;
        const dbId = currentLoteId.replace('lote', '');
        
        fetch(`/api/sensores/actual/${dbId}`)
            .then(res => res.json())
            .then(data => {
                // Parsear los valores de la BD
                const tempVal = parseFloat(data.temperatura).toFixed(1);
                const humVal = parseFloat(data.humedad).toFixed(0);
                const ammVal = parseFloat(data.amoniaco).toFixed(1);
                const aguaVal = parseFloat(data.agua).toFixed(1);
                const alimentoVal = parseFloat(data.alimento).toFixed(1);

                // Obtener límites de la etapa
                const tempMin = parametrosConfig.temperatura?.min || 18;
                const tempMax = parametrosConfig.temperatura?.max || 32;
                const amonMax = parametrosConfig.amoniaco?.max || 20;
                const humMax = parametrosConfig.humedad?.max || 75;
                const ilumMax = parametrosConfig.iluminacion?.max || 45;

                // 1. AMONIACO
                currentGlobalSensors.ammonia = ammVal;
                updateCard('ammonia', ammVal, 'ppm', amonMax, amonMax + 5);
                const gauge = document.getElementById('gauge-ammonia');
                if (gauge) {
                    const amonPct = Math.min(Math.max(ammVal / (amonMax + 5), 0), 1);
                    gauge.style.transform = `rotate(${amonPct * 180}deg)`;
                }

                // 2. TEMPERATURA
                const statusTemp = updateCard('temp', tempVal, '°C', tempMax, tempMax + 2);
                const thermoFill = document.getElementById('fill-temp');
                const thermoBulb = document.getElementById('bulb-temp');
                if (thermoFill && thermoBulb) {
                    const tempPct = Math.min(Math.max((tempVal - 10) / (40 - 10), 0), 1);
                    thermoFill.style.height = `${10 + (tempPct * 90)}%`;
                    
                    let color = '#10b981';
                    if (statusTemp === 'danger') color = '#ef4444';
                    else if (statusTemp === 'warning') color = '#f59e0b';
                    else if (statusTemp === 'optimo') color = '#3b82f6';
                    
                    thermoFill.style.background = color;
                    thermoBulb.style.background = color;
                }

                // 3. HUMEDAD
                currentGlobalSensors.humidity = humVal;
                updateCard('humidity', humVal, '%', humMax, humMax + 10);
                const wrapper = document.getElementById('wrapper-humidity');
                if (wrapper) {
                    const humPct = Math.min(Math.max(humVal / 100, 0), 1);
                    const bottomPx = -88 + (humPct * 53); 
                    wrapper.style.bottom = `${bottomPx}px`;
                }

                // 4. ILUMINACIÓN
                // Tomamos el valor de la base de datos (con una variación visual temporal)
                const baseLight = parseFloat(data.iluminacion || 0);
                let lightVal = baseLight > 0 ? (baseLight + (Math.random() * 5 - 2)) : ((ilumMax - 5) * 10);
                lightVal = parseFloat(lightVal).toFixed(1);
                
                updateCard('light', lightVal, 'lx', ilumMax * 10, (ilumMax + 10) * 10);
                const lightContainer = document.getElementById('container-light');
                const bulb = document.getElementById('light-bulb');
                if (lightContainer && bulb) {
                    const lightPct = 0.8 + (Math.random() * 0.1); // Parpadeo muy sutil
                    lightContainer.style.boxShadow = `0 0 ${lightPct * 20}px rgba(246, 224, 94, ${lightPct})`;
                    bulb.style.filter = `drop-shadow(0 0 ${lightPct * 10}px #f6e05e)`;
                    bulb.style.opacity = 0.5 + (lightPct * 0.5);
                }


                // 6. MAPA DE ZONAS/JAULAS (Asumiendo temperatura base)
                const gridEl = document.getElementById('cages-grid');
                if (gridEl && window.dashboardLotesData) {
                    const loteData = window.dashboardLotesData[currentLoteId];
                    if (loteData && loteData.jaulas && loteData.jaulas.length > 0) {
                        if (gridEl.children.length !== loteData.jaulas.length) {
                            gridEl.innerHTML = loteData.jaulas.map((j, index) => `
                                <div class="zone-cage-card" id="zone-container-${index}" onclick="verDetalleZona('${currentLoteId}', ${index})">
                                    <div class="cage-header">
                                        <span class="cage-name">ZONA ${index + 1} <small>${j.nombre}</small></span>
                                        <div class="cage-temp" id="val-z${index}">--°C</div>
                                    </div>
                                    <div class="cage-body">
                                        <div class="cage-stat">
                                            <i class="fas fa-feather-alt"></i> <span id="birds-z${index}">0</span> Aves
                                        </div>
                                    </div>
                                </div>
                            `).join('');
                        }
                        loteData.jaulas.forEach((j, index) => {
                            const zoneTempEl = document.getElementById(`val-z${index}`);
                            const birdsEl = document.getElementById(`birds-z${index}`);
                            if (zoneTempEl) {
                                // Aplicamos una ligera desviación a la zona respecto a la temp principal
                                const zVal = (parseFloat(tempVal) + ((index%2===0)?0.2:-0.2)).toFixed(1);
                                zoneTempEl.innerText = zVal + "°C";
                                if (zVal > tempMax + 1) zoneTempEl.style.color = '#ef4444';
                                else if (zVal > tempMax || zVal < tempMin) zoneTempEl.style.color = '#f59e0b';
                                else zoneTempEl.style.color = '#3b82f6';
                            }
                            if (birdsEl) birdsEl.innerText = j.aves.toLocaleString('es-ES');
                        });
                    } else if (loteData && (!loteData.jaulas || loteData.jaulas.length === 0)) {
                        gridEl.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #a0aec0; padding: 2rem;">Este lote no tiene jaulas asignadas.</div>`;
                    }
                }

                // 5. ANIMACIONES DE AGUA Y ALIMENTO
                // Usamos valores fijos para el maximo de lote por ahora
                const maxWater = 500; 
                const maxFood = 250; 
                
                // Extraemos valores globales de la respuesta (data)
                const aguaTotal = parseFloat(data.agua || 0);
                const alimentoTotal = parseFloat(data.alimento || 0);
                
                // Actualizar agua
                let waterPct = (aguaTotal / maxWater) * 100;
                if(waterPct > 100) waterPct = 100;
                document.getElementById('water-today').innerText = aguaTotal.toFixed(1) + ' L';
                document.getElementById('tank-water-level').style.height = `${waterPct}%`;
                
                // Actualizar Alimento
                let foodPct = (alimentoTotal / maxFood) * 100;
                if(foodPct > 100) foodPct = 100;
                const lostFood = (alimentoTotal * 0.02).toFixed(1); // 2% de pérdida simulada
                const remainingFood = (maxFood - alimentoTotal).toFixed(1);
                
                document.getElementById('food-delivered').innerText = alimentoTotal.toFixed(1) + ' Kg';
                document.getElementById('food-lost').innerText = lostFood + ' Kg';
                document.getElementById('food-remaining').innerText = remainingFood > 0 ? remainingFood + ' Kg' : '0 Kg';
                document.getElementById('silo-food-level').style.height = `${foodPct}%`;
            })
            .catch(e => console.error("Error obteniendo telemetria:", e));
    }

    function updateCard(type, value, unit, warn, crit) {
        const card = document.getElementById(`card-${type}`);
        const valEl = document.getElementById(`val-${type}`);

        if (!card || !valEl) return 'normal';
        valEl.innerText = `${value} ${unit}`;

        let status = 'normal';

        if (value >= crit) {
            card.className = "sensor-card status-danger";
            status = 'danger';
        } else if (value >= warn) {
            card.className = "sensor-card status-warning";
            status = 'warning';
        } else {
            if (type === 'temp' || type === 'light') {
                card.className = "sensor-card status-optimo";
                status = 'optimo';
            } else {
                card.className = "sensor-card status-normal";
                status = 'normal';
            }
        }

        // Notificaciones reales en la campanita
        const prevState = sensorStates[type] || 'normal';
        if (status !== prevState) {
            // Solo notificamos si el estado empeora a advertencia o peligro
            if ((status === 'danger' && prevState !== 'danger') || 
                (status === 'warning' && prevState !== 'danger' && prevState !== 'warning')) {
                
                const sel = document.getElementById('lote-select');
                let loteInfo = sel ? sel.options[sel.selectedIndex].text.split(' — ')[0] : 'Lote actual';
                let sensorName = type.toUpperCase();
                if (type === 'temp') sensorName = 'Temperatura';
                if (type === 'light') sensorName = 'Iluminación';
                if (type === 'humidity') sensorName = 'Humedad';
                if (type === 'ammonia') sensorName = 'Amoníaco';

                let msg = `Alerta: ${sensorName} en ${loteInfo} alcanzó ${value}${unit}.`;
                if (status === 'danger') msg = `PELIGRO: ${sensorName} en ${loteInfo} llegó a un nivel crítico (${value}${unit}).`;
                
                // Enviar a la base de datos
                fetch('/api/alertas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipo: status, mensaje: msg })
                })
                .then(r => r.json())
                .then(data => {
                    if (window.addNotification && data.id) {
                        window.addNotification(data);
                    }
                })
                .catch(e => console.error('Error enviando alerta:', e));
            }
            sensorStates[type] = status;
        }

        return status;
    }

    // --- 8. MODAL ---
    window.verDetalleZona = function (loteIdStr, jaulaIndex) {
        if (!window.dashboardLotesData || !window.dashboardLotesData[loteIdStr]) return;
        
        const loteData = window.dashboardLotesData[loteIdStr];
        const jaulaData = loteData.jaulas[jaulaIndex];
        if (!jaulaData) return;

        const modal = document.getElementById('zone-modal');
        const title = document.getElementById('modal-title');
        const birdsEl = document.getElementById('modal-birds');
        const mortEl = document.getElementById('modal-mortality');
        const co2El = document.getElementById('modal-co2');
        const bedEl = document.getElementById('modal-bed');

        // Datos reales
        const birds = jaulaData.aves;
        
        const mortality = loteData.mortalidad_hoy; 
        
        const co2 = currentGlobalSensors.ammonia; 
        
        let bedStatus = "Seca";
        let bedColor = "#10b981"; // Verde

        // Lógica de humedad ambiental
        if (currentGlobalSensors.humidity >= 70) {
            bedStatus = "Húmeda";
            bedColor = "#f59e0b"; // Naranja
        }

        // Título dinámico: ZONA 1 (Jaula XX) | Lote 123...
        title.innerText = `ZONA ${jaulaIndex + 1} (${jaulaData.nombre}) | #${loteData.id} — ${loteData.tipo}`;
        
        birdsEl.innerText = birds.toLocaleString('es-ES');
        mortEl.innerText = mortality; // Bajas del día del lote entero
        co2El.innerText = `${co2} ppm`;
        bedEl.innerText = bedStatus;
        bedEl.style.color = bedColor;
        bedEl.style.backgroundColor = bedColor + "33";

        modal.classList.add('active');
    };

    window.closeModal = function () {
        document.getElementById('zone-modal').classList.remove('active');
    };

    window.toggleAction = function (btn) {
        btn.classList.toggle('active');
    };

    window.onclick = function (event) {
        const modal = document.getElementById('zone-modal');
        if (event.target === modal) closeModal();
    };

    // --- Tiempos ---
    setInterval(updateSensors, 5000);
    updateSensors(); 
});