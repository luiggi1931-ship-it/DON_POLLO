document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistrarConsumo');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Registrando...';
            
            const id_lote = document.getElementById('id_lote').value;
            const tipo_item = document.getElementById('tipo_item').value;
            const cantidad = document.getElementById('cantidad').value;
            
            try {
                const res = await fetch('/api/inventario/registrar_consumo', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id_lote, tipo_item, cantidad})
                });
                const data = await res.json();
                if(res.ok){
                    window.location.reload();
                } else {
                    alert("Error: " + data.error);
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-outlined">save</span> Registrar Consumo';
                }
            } catch (error) {
                alert("Error de red: " + error.message);
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">save</span> Registrar Consumo';
            }
        });
    }
});
