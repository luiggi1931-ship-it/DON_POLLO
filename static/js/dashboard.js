document.addEventListener('DOMContentLoaded', () => {

    // --- 0. PARÁMETROS DE CONFIGURACIÓN (desde la BD) ---
    let parametrosConfig = {};
    
    // Cargar configuración de la etapa al iniciar
    function cargarParametrosConfiguracion(etapa = 'mediano') {
        fetch(`/api/parametros_etapa/${etapa}`)
            .then(response => response.json())
            .then(data => {
                parametrosConfig = data;
                console.log('Parámetros cargados:', parametrosConfig);
                updateSensors(); // Actualizar sensores con nuevos parámetros
            })
            .catch(error => console.error('Error cargando parámetros:', error));
    }

    // Cargar parámetros al inicio
    cargarParametrosConfiguracion('mediano');

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

    // 3. Crear Gráfico de AGUA (Usamos [...sharedLabels] para pasar una copia exacta)
    const waterCtx = document.getElementById('waterChart')?.getContext('2d');
    if (waterCtx) {
        waterChartInstance = new Chart(waterCtx, createChartConfig(
            'Agua (L)', 
            '#3b82f6', 
            getInitData(config.waterBase), 
            [...sharedLabels] 
        ));
    }

    // 4. Crear Gráfico de ALIMENTO (Usamos la misma copia)
    const foodCtx = document.getElementById('foodChart')?.getContext('2d');
    if (foodCtx) {
        foodChartInstance = new Chart(foodCtx, createChartConfig(
            'Alimento (Kg)', 
            '#f59e0b', 
            getInitData(config.foodBase), 
            [...sharedLabels] 
        ));
    }

    // --- 4. FUNCIÓN DEL SELECTOR (CAMBIAR LOTE) ---
    window.cambiarLote = function(loteId) {
        console.log("Cambiando a:", loteId);
        
        // Actualizar Configuración
        currentLoteId = loteId;
        config = loteData[loteId];

        // Cargar parámetros de la etapa correspondiente
        cargarParametrosConfiguracion(config.etapa);

        // Reiniciar Gráficos con los nuevos valores base
        if(waterChartInstance) {
            waterChartInstance.data.datasets[0].data = getInitData(config.waterBase);
            waterChartInstance.update();
            document.getElementById('water-today').innerText = config.waterBase.toFixed(1) + " L";
        }
        
        if(foodChartInstance) {
            foodChartInstance.data.datasets[0].data = getInitData(config.foodBase);
            foodChartInstance.update();
            document.getElementById('food-delivered').innerText = config.foodBase.toFixed(1) + " Kg";
        }

        // Forzar actualización de sensores
        updateSensors();
    };

    // --- 5. MOTOR DE MOVIMIENTO "LIVE" ---
    function updateLiveCharts() {
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        // === AGUA ===
        if (waterChartInstance) {
            const dataArr = waterChartInstance.data.datasets[0].data;
            const lastVal = parseFloat(dataArr[dataArr.length - 1]);
            
            // Incremento proporcional al tamaño del lote 
            const variation = (Math.random() * 1.0 + 0.5) * (config.waterBase / 100); 
            const newVal = (lastVal + variation).toFixed(1);

            if (currentModeWater === 'actual') {
                waterChartInstance.data.labels.push(timeLabel);
                waterChartInstance.data.datasets[0].data.push(newVal);
                if (waterChartInstance.data.labels.length > 8) {
                    waterChartInstance.data.labels.shift();
                    waterChartInstance.data.datasets[0].data.shift();
                }
            } else {
                dataArr[dataArr.length - 1] = newVal;
            }
            waterChartInstance.update('none');
            document.getElementById('water-today').innerText = `${newVal} L`;
        }

        // === ALIMENTO ===
        if (foodChartInstance) {
            const dataArr = foodChartInstance.data.datasets[0].data;
            const lastVal = parseFloat(dataArr[dataArr.length - 1]);
            
            // Incremento proporcional
            const variation = (Math.random() * 0.3 + 0.1) * (config.foodBase / 60);
            const newVal = (lastVal + variation).toFixed(2);

            if (currentModeFood === 'actual') {
                foodChartInstance.data.labels.push(timeLabel);
                foodChartInstance.data.datasets[0].data.push(newVal);
                if (foodChartInstance.data.labels.length > 8) {
                    foodChartInstance.data.labels.shift();
                    foodChartInstance.data.datasets[0].data.shift();
                }
            } else {
                dataArr[dataArr.length - 1] = newVal;
            }
            foodChartInstance.update('none');
            document.getElementById('food-delivered').innerText = `${newVal} Kg`;
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
                newLabels = initLabels;
                // Generamos data continua desde el valor actual
                let startVal = parseFloat(chart.data.datasets[0].data.slice(-1)[0]);
                newData = [];
                for(let i=0; i<8; i++) newData.push(startVal + (i * 0.5));
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
        // Función auxiliar para generar un valor aleatorio dentro de un rango
        function valorAleatorio(min, max) {
            return Math.random() * (max - min) + min;
        }

        // AMONIACO (amonico) - Entre el rango configurado
        const amonMin = parametrosConfig.amonico?.min || 0;
        const amonMax = parametrosConfig.amonico?.max || 20;
        const ammVal = Math.floor(valorAleatorio(amonMin, amonMax));
        // Comparar contra limites: Normal si está en rango, Alerta fuera de rango
        updateCard('ammonia', ammVal, 'ppm', amonMax, amonMax + 5);

        // TEMPERATURA - Generar dentro del rango configurado
        const tempMin = parametrosConfig.temperatura?.min || 18;
        const tempMax = parametrosConfig.temperatura?.max || 32;
        const tempVal = valorAleatorio(tempMin, tempMax).toFixed(1);
        // Alerta si está fuera del rango, crítico si muy fuera
        updateCard('temp', tempVal, '°C', tempMax, tempMax + 2);

        // HUMEDAD - Generar dentro del rango configurado
        const humMin = parametrosConfig.humedad?.min || 50;
        const humMax = parametrosConfig.humedad?.max || 75;
        const humVal = Math.floor(valorAleatorio(humMin, humMax));
        updateCard('humidity', humVal, '%', humMax, humMax + 10);

        // ILUMINACIÓN - Generar dentro del rango configurado
        const ilumMin = parametrosConfig.iluminacion?.min || 5;
        const ilumMax = parametrosConfig.iluminacion?.max || 45;
        const lightVal = Math.floor(valorAleatorio(ilumMin, ilumMax) * 10); // Convertir a lux (multiplicar x10 aprox)
        const bulb = document.getElementById('light-bulb');
        if (bulb) {
            bulb.style.opacity = lightVal > (ilumMax * 5) ? "1" : "0.7";
            bulb.style.filter = lightVal > (ilumMax * 5) ? "drop-shadow(0 0 10px #f6e05e)" : "none";
        }
        updateCard('light', lightVal, 'lx', ilumMax * 10, (ilumMax + 10) * 10);

        // Hexágonos de Zonas - Usar temperatura como referencia
        for (let i = 1; i <= 4; i++) {
            const zoneEl = document.getElementById(`val-z${i}`);
            if (zoneEl) {
                const zVal = (parseFloat(tempVal) + (Math.random() - 0.5) * 2).toFixed(1);
                zoneEl.innerText = zVal + "°C";
                
                // Comparar contra límites de temperatura
                if (zVal > tempMax + 1) zoneEl.style.color = '#ef4444'; // Rojo crítico
                else if (zVal > tempMax || zVal < tempMin) zoneEl.style.color = '#f59e0b'; // Amarillo alerta
                else zoneEl.style.color = '#3b82f6'; // Azul normal
            }
        }
    }

    function updateCard(type, value, unit, warn, crit) {
        const card = document.getElementById(`card-${type}`);
        const valEl = document.getElementById(`val-${type}`);
        const badge = document.getElementById(`badge-${type}`);

        if (!card || !valEl || !badge) return;
        valEl.innerText = `${value} ${unit}`;

        if (value >= crit) {
            card.className = "sensor-card status-danger";
            badge.innerText = "Crítico"; badge.style.backgroundColor = "#ef4444";
        } else if (value >= warn) {
            card.className = "sensor-card status-warning";
            badge.innerText = "Alerta"; badge.style.backgroundColor = "#f59e0b";
        } else {
            if (type === 'temp' || type === 'light') {
                card.className = "sensor-card status-optimo";
                badge.innerText = "Óptimo"; badge.style.backgroundColor = "#3b82f6";
            } else {
                card.className = "sensor-card status-normal";
                badge.innerText = "Normal"; badge.style.backgroundColor = "#10b981";
            }
        }
    }

    // --- 8. MODAL ---
    window.verDetalleZona = function (zoneId) {
        const modal = document.getElementById('zone-modal');
        const title = document.getElementById('modal-title');
        const birdsEl = document.getElementById('modal-birds');
        const mortEl = document.getElementById('modal-mortality');
        const co2El = document.getElementById('modal-co2');
        const bedEl = document.getElementById('modal-bed');

        // Datos simulados
        let birds = 5000 - Math.floor(Math.random() * 50);
        let mortality = Math.floor(Math.random() * 3);
        let co2 = 600 + Math.floor(Math.random() * 200);
        let bedStatus = "Seca";
        let bedColor = "#10b981";

        if (zoneId === 3) {
            mortality += 2;
            bedStatus = "Húmeda";
            bedColor = "#f59e0b";
        }

        // Título dinámico 
        title.innerText = `ZONA ${zoneId} | ${config.name}`;
        
        birdsEl.innerText = birds.toLocaleString();
        mortEl.innerText = mortality;
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