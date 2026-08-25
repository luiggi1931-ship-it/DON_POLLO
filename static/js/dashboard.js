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
                    
                    // Cargar parámetros del primer lote real
                    const primerLote = data.lotes[0];
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
                const lote = window.dashboardLotesData[loteIdStr];
                const etapaZootecnica = determinarEtapaPorEdad(lote.edad_dias);
                actualizarBadgeEtapa(etapaZootecnica);
                cargarParametrosConfiguracion(etapaZootecnica);
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

    // --- 1. BASE DE DATOS DE LOTES (La parte nueva e inteligente) ---
    const loteData = {
        'lote1': { 
            name: 'Lote A-101 (Semana 1)',
            etapa: 'pequeno',
            tempBase: 32.0, 
            waterBase: 20,  
            foodBase: 12    
        },
        'lote2': { 
            name: 'Lote B-205 (Semana 3)',
            etapa: 'mediano',
            tempBase: 26.0, 
            waterBase: 140, 
            foodBase: 80    
        },
        'lote3': { 
            name: 'Lote C-308 (Semana 6)',
            etapa: 'grande',
            tempBase: 21.0, 
            waterBase: 450, 
            foodBase: 220 
        }
    };

    // Estado inicial 
    let currentLoteId = 'lote2'; 
    let config = loteData[currentLoteId];

    // Variables Globales
    let waterChartInstance = null;
    let foodChartInstance = null;
    let currentModeWater = 'actual';
    let currentModeFood = 'actual';
    
    let currentGlobalSensors = {
        humidity: 50,
        ammonia: 0
    };

    // --- 2.CONFIGURACIÓN DE LOS GRÁFICOS ---
    function createChartConfig(label, color, dataPoints, labels) {
        return {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: dataPoints,
                    borderColor: color,
                    backgroundColor: color + '22',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                animation: { duration: 800 },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 10 },
                            autoSkip: true,
                            maxTicksLimit: 6
                        }
                    }
                }
            }
        };
    }

  // --- 3. INICIALIZACIÓN SINCRONIZADA PERFECTA ---

    // Función que viaja al pasado para crear las etiquetas exactas
    function getSyncedLabels() {
        const labels = [];
        const now = new Date();
        // 8 pasos de 5 segundos hacia atrás
        for (let i = 7; i >= 0; i--) {
            const past = new Date(now.getTime() - (i * 5000));
            const timeStr = `${past.getHours()}:${past.getMinutes().toString().padStart(2,'0')}:${past.getSeconds().toString().padStart(2,'0')}`;
            labels.push(timeStr);
        }
        return labels;
    }

    // 1. Calcula etiquetas UNA SOLA VEZ para los dos
    const sharedLabels = getSyncedLabels();

    // 2. Función para generar datos que coincidan exactamente en cantidad (8 datos)
    function getInitData(baseValue) {
        let arr = [];
        let current = baseValue;
        for(let i=0; i<8; i++) {
            current = current + (Math.random() * 0.5); 
            arr.push(parseFloat(current.toFixed(1)));
        }
        return arr;
    }

    // Estado en vivo independiente de las gráficas
    let liveLabels = getSyncedLabels();
    let liveWaterData = getInitData(config.waterBase);
    let liveFoodData = getInitData(config.foodBase);

    // 3. Crear Gráfico de AGUA
    const waterCtx = document.getElementById('waterChart')?.getContext('2d');
    if (waterCtx) {
        waterChartInstance = new Chart(waterCtx, createChartConfig(
            'Agua (L)', '#3b82f6', [...liveWaterData], [...liveLabels] 
        ));
    }

    // 4. Crear Gráfico de ALIMENTO
    const foodCtx = document.getElementById('foodChart')?.getContext('2d');
    if (foodCtx) {
        foodChartInstance = new Chart(foodCtx, createChartConfig(
            'Alimento (Kg)', '#f59e0b', [...liveFoodData], [...liveLabels] 
        ));
    }

    // --- 4. FUNCIÓN DEL SELECTOR (CAMBIAR LOTE) ---
    window.cambiarLote = function(loteId) {
        console.log("Cambiando a:", loteId);
        
        currentLoteId = loteId;
        config = loteData[loteId];
        cargarParametrosConfiguracion(config.etapa);

        // Reiniciar estado en vivo
        liveLabels = getSyncedLabels();
        liveWaterData = getInitData(config.waterBase);
        liveFoodData = getInitData(config.foodBase);

        if(waterChartInstance) {
            if (currentModeWater === 'actual') {
                waterChartInstance.data.labels = [...liveLabels];
                waterChartInstance.data.datasets[0].data = [...liveWaterData];
                waterChartInstance.update();
            }
            document.getElementById('water-today').innerText = config.waterBase.toFixed(1) + " L";
        }
        
        if(foodChartInstance) {
            if (currentModeFood === 'actual') {
                foodChartInstance.data.labels = [...liveLabels];
                foodChartInstance.data.datasets[0].data = [...liveFoodData];
                foodChartInstance.update();
            }
            document.getElementById('food-delivered').innerText = config.foodBase.toFixed(1) + " Kg";
        }

        updateSensors();
    };

    // --- 5. MOTOR DE MOVIMIENTO "LIVE" ---
    function updateLiveCharts() {
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        // Actualizar etiquetas en vivo
        liveLabels.push(timeLabel);
        if (liveLabels.length > 8) liveLabels.shift();

        // === AGUA ===
        const lastWater = liveWaterData[liveWaterData.length - 1];
        const newWater = (lastWater + (Math.random() * 1.0 + 0.5) * (config.waterBase / 100)).toFixed(1);
        liveWaterData.push(parseFloat(newWater));
        if (liveWaterData.length > 8) liveWaterData.shift();
        
        if (waterChartInstance) {
            document.getElementById('water-today').innerText = `${newWater} L`;
            if (currentModeWater === 'actual') {
                waterChartInstance.data.labels = [...liveLabels];
                waterChartInstance.data.datasets[0].data = [...liveWaterData];
                waterChartInstance.update('none');
            }
        }

        // === ALIMENTO ===
        const lastFood = liveFoodData[liveFoodData.length - 1];
        const newFood = (lastFood + (Math.random() * 0.3 + 0.1) * (config.foodBase / 60)).toFixed(2);
        liveFoodData.push(parseFloat(newFood));
        if (liveFoodData.length > 8) liveFoodData.shift();

        if (foodChartInstance) {
            document.getElementById('food-delivered').innerText = `${newFood} Kg`;
            if (currentModeFood === 'actual') {
                foodChartInstance.data.labels = [...liveLabels];
                foodChartInstance.data.datasets[0].data = [...liveFoodData];
                foodChartInstance.update('none');
            }
        }
    }

    // --- 6. CAMBIO DE TIEMPO ---
    window.changeTimeframe = function (btn, type, timeframe) {
        const parent = btn.parentElement;
        parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const chart = (type === 'water') ? waterChartInstance : foodChartInstance;
        if (!chart) return;

        if (type === 'water') currentModeWater = timeframe;
        else currentModeFood = timeframe;

        // Base dinámica según el lote 
        let base = (type === 'water') ? config.waterBase : config.foodBase;
        let newLabels, newData;

        switch (timeframe) {
            case 'actual':
                newLabels = [...liveLabels];
                newData = (type === 'water') ? [...liveWaterData] : [...liveFoodData];
                break;

            case '1d': // Histórico Diario 
                newLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
                newData = [base*0.2, base*0.4, base*0.8, base*1.5, base*1.2, base*0.9, base*0.5]; 
                break;

            case '5d': // Histórico Semanal
                newLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'];
                newData = [base*0.9, base*0.95, base, base*1.05, base*1.1];
                break;

            case '1m': // Histórico Mensual
                newLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                newData = [base*5, base*7, base*9, base*12];
                break;

            case '1y': // Histórico Anual
                newLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
                let m = base * 30;
                newData = [m*0.8, m*0.9, m, m*1.1, m*1.2, m*1.1];
                break;
        }

        chart.data.labels = newLabels;
        chart.data.datasets[0].data = newData;
        chart.update();
    };

    // --- 7. SENSORES INTELIGENTES CON PARÁMETROS DE CONFIGURACIÓN ---
    function updateSensors() {
        function valorAleatorio(min, max) {
            // 20% de probabilidad de salirse de los límites para probar alertas visuales
            if (Math.random() < 0.2) {
                const isOver = Math.random() > 0.5;
                const variance = (max - min) * 0.35; // 35% fuera del rango para alcanzar Danger
                if (isOver) return max + variance;
                return min - variance;
            }
            return Math.random() * (max - min) + min;
        }

        // AMONIACO
        const amonMin = parametrosConfig.amonico?.min || 0;
        const amonMax = parametrosConfig.amonico?.max || 20;
        const ammVal = Math.floor(valorAleatorio(amonMin, amonMax));
        currentGlobalSensors.ammonia = ammVal;
        updateCard('ammonia', ammVal, 'ppm', amonMax, amonMax + 5);
        // Animación Gauge (0 a 180 grados)
        const gauge = document.getElementById('gauge-ammonia');
        if (gauge) {
            const amonPct = Math.min(Math.max(ammVal / (amonMax + 5), 0), 1);
            gauge.style.transform = `rotate(${amonPct * 180}deg)`;
        }

        // TEMPERATURA
        const tempMin = parametrosConfig.temperatura?.min || 18;
        const tempMax = parametrosConfig.temperatura?.max || 32;
        const tempVal = valorAleatorio(tempMin, tempMax).toFixed(1);
        const statusTemp = updateCard('temp', tempVal, '°C', tempMax, tempMax + 2);
        // Animación Termómetro (altura y color)
        const thermoFill = document.getElementById('fill-temp');
        const thermoBulb = document.getElementById('bulb-temp');
        if (thermoFill && thermoBulb) {
            // Rango visual: asumiendo que 10°C es el mínimo visible y 40°C el máximo
            const tempPct = Math.min(Math.max((tempVal - 10) / (40 - 10), 0), 1);
            thermoFill.style.height = `${10 + (tempPct * 90)}%`;
            
            let color = '#10b981'; // Verde normal
            if (statusTemp === 'danger') color = '#ef4444';
            else if (statusTemp === 'warning') color = '#f59e0b';
            else if (statusTemp === 'optimo') color = '#3b82f6';
            
            thermoFill.style.background = color;
            thermoBulb.style.background = color;
        }

        // HUMEDAD
        const humMin = parametrosConfig.humedad?.min || 50;
        const humMax = parametrosConfig.humedad?.max || 75;
        const humVal = Math.floor(valorAleatorio(humMin, humMax));
        currentGlobalSensors.humidity = humVal;
        updateCard('humidity', humVal, '%', humMax, humMax + 10);
        // Animación Ola Líquida (altura con el nuevo contenedor)
        const wrapper = document.getElementById('wrapper-humidity');
        if (wrapper) {
            const humPct = Math.min(Math.max(humVal / 100, 0), 1);
            // 0% humedad -> bottom -88px (vacío)
            // 100% humedad -> bottom -35px (lleno)
            const bottomPx = -88 + (humPct * 53); 
            wrapper.style.bottom = `${bottomPx}px`;
        }

        // ILUMINACIÓN
        const ilumMin = parametrosConfig.iluminacion?.min || 5;
        const ilumMax = parametrosConfig.iluminacion?.max || 45;
        const lightVal = Math.floor(valorAleatorio(ilumMin, ilumMax) * 10);
        updateCard('light', lightVal, 'lx', ilumMax * 10, (ilumMax + 10) * 10);
        // Animación Foco Glow
        const lightContainer = document.getElementById('container-light');
        const bulb = document.getElementById('light-bulb');
        if (lightContainer && bulb) {
            const lightPct = Math.min(Math.max(lightVal / ((ilumMax + 10) * 10), 0), 1);
            lightContainer.style.boxShadow = `0 0 ${lightPct * 20}px rgba(246, 224, 94, ${lightPct})`;
            bulb.style.filter = `drop-shadow(0 0 ${lightPct * 10}px #f6e05e)`;
            bulb.style.opacity = 0.5 + (lightPct * 0.5);
        }

        // Mapa de Planta (Jaulas) dinámico
        const selLote = document.getElementById('lote-select');
        const gridEl = document.getElementById('cages-grid');
        
        if (selLote && gridEl && window.dashboardLotesData) {
            const loteIdStr = selLote.value; // ej: 'lote146'
            const loteData = window.dashboardLotesData[loteIdStr];
            
            if (loteData && loteData.jaulas && loteData.jaulas.length > 0) {
                // Limpiamos el grid si el número de jaulas cambió (para no re-renderizar todo el tiempo,
                // solo actualizamos valores si la cantidad de hijos es igual)
                if (gridEl.children.length !== loteData.jaulas.length) {
                    gridEl.innerHTML = loteData.jaulas.map((j, index) => `
                        <div class="zone-cage-card" id="zone-container-${index}" onclick="verDetalleZona('${loteIdStr}', ${index})">
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

                // Actualizar valores de los elementos renderizados
                loteData.jaulas.forEach((j, index) => {
                    const zoneTempEl = document.getElementById(`val-z${index}`);
                    const birdsEl = document.getElementById(`birds-z${index}`);
                    
                    if (zoneTempEl) {
                        const zVal = (parseFloat(tempVal) + (Math.random() - 0.5) * 2).toFixed(1);
                        zoneTempEl.innerText = zVal + "°C";
                        
                        if (zVal > tempMax + 1) zoneTempEl.style.color = '#ef4444';
                        else if (zVal > tempMax || zVal < tempMin) zoneTempEl.style.color = '#f59e0b';
                        else zoneTempEl.style.color = '#3b82f6';
                    }
                    if (birdsEl) {
                        birdsEl.innerText = j.aves.toLocaleString('es-ES');
                    }
                });
            } else if (loteData && (!loteData.jaulas || loteData.jaulas.length === 0)) {
                gridEl.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #a0aec0; padding: 2rem;">Este lote no tiene jaulas asignadas.</div>`;
            }
        }
    }

    function updateCard(type, value, unit, warn, crit) {
        const card = document.getElementById(`card-${type}`);
        const valEl = document.getElementById(`val-${type}`);
        const badge = document.getElementById(`badge-${type}`); // Ya no se ve por CSS, pero sigue ahí

        if (!card || !valEl) return 'normal';
        valEl.innerText = `${value} ${unit}`;

        let status = 'normal';

        if (value >= crit) {
            card.className = "sensor-card status-danger";
            if (badge) { badge.innerText = "Crítico"; badge.style.backgroundColor = "#ef4444"; }
            status = 'danger';
        } else if (value >= warn) {
            card.className = "sensor-card status-warning";
            if (badge) { badge.innerText = "Alerta"; badge.style.backgroundColor = "#f59e0b"; }
            status = 'warning';
        } else {
            if (type === 'temp' || type === 'light') {
                card.className = "sensor-card status-optimo";
                if (badge) { badge.innerText = "Óptimo"; badge.style.backgroundColor = "#3b82f6"; }
                status = 'optimo';
            } else {
                card.className = "sensor-card status-normal";
                if (badge) { badge.innerText = "Normal"; badge.style.backgroundColor = "#10b981"; }
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
                // Extraer solo el string antes del guion: "#1" en vez de todo
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
        
        // Mortalidad hoy: mostramos el total del lote pero aclaramos que es del lote
        // (Podríamos dividirla entre las zonas si quisieras, pero mostrar el total es más transparente)
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
    setInterval(updateSensors, 4000);
    setInterval(updateLiveCharts, 5000);
    updateSensors(); 
});