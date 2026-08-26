function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

document.getElementById('formVenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btn.disabled = true;

    const data = {
        id_lote: document.getElementById('v_lote').value,
        peso_total_kg: document.getElementById('v_peso').value,
        precio_por_kg: document.getElementById('v_precio').value,
        cliente: document.getElementById('v_cliente').value,
        observaciones: document.getElementById('v_obs').value
    };
    
    try {
        const res = await fetch('/api/ventas/cerrar_lote', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(result.success) location.reload();
        else {
            alert('Error: ' + (result.error || result.message));
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch(err) {
        alert('Error de red');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

document.getElementById('formGasto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btn.disabled = true;

    const data = {
        id_lote: document.getElementById('g_lote').value,
        concepto: document.getElementById('g_concepto').value,
        monto: document.getElementById('g_monto').value,
        observaciones: document.getElementById('g_obs').value
    };
    
    try {
        const res = await fetch('/api/gastos/registrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(result.success) location.reload();
        else {
            alert('Error: ' + (result.error || result.message));
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch(err) {
        alert('Error de red');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

function initVentasChart(ingresos, gastos) {
    const ctx = document.getElementById('financeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                label: 'Balance Global ($)',
                data: [ingresos, gastos],
                backgroundColor: [
                    'rgba(29, 176, 106, 0.6)',
                    'rgba(231, 76, 60, 0.6)'
                ],
                borderColor: [
                    '#1db06a',
                    '#e74c3c'
                ],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('financeChart');
    if (canvas) {
        const ingresos = parseFloat(canvas.dataset.ingresos) || 0;
        const gastos = parseFloat(canvas.dataset.gastos) || 0;
        initVentasChart(ingresos, gastos);
    }
});
