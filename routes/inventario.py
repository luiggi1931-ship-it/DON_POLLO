from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from services.inventario_service import obtener_datos_inventario, registrar_consumo

inventario_bp = Blueprint('inventario', __name__)

@inventario_bp.route('/inventario')
@login_required
def inventario_dashboard():
    datos = obtener_datos_inventario()
    return render_template(
        'inventario.html',
        alimento_disponible=datos['alimento_disponible'],
        agua_disponible=datos['agua_disponible'],
        lotes=datos['lotes'],
        ultimos_movimientos=datos['ultimos_movimientos']
    )

@inventario_bp.route('/api/inventario/registrar_consumo', methods=['POST'])
@login_required
def api_registrar_consumo():
    data = request.json
    id_lote = data.get('id_lote')
    tipo_item = data.get('tipo_item')
    cantidad = data.get('cantidad')
    
    exito, msg = registrar_consumo(id_lote, tipo_item, cantidad, current_user.id_usuario)
    
    if exito:
        return jsonify({'success': True, 'mensaje': msg})
    else:
        return jsonify({'success': False, 'error': msg}), 400
