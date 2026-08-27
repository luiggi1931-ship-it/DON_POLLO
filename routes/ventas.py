from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from datetime import date
from models import db
from models.lote import Lote
from models.venta import Venta
from models.gasto import Gasto
from decorators import admin_required

ventas_bp = Blueprint('ventas', __name__)

@ventas_bp.route('/ventas')
@login_required
def ventas_dashboard():
    from services.ventas_service import obtener_estadisticas_ventas
    datos = obtener_estadisticas_ventas()

    return render_template(
        'ventas.html',
        ventas=datos['ventas'],
        gastos=datos['gastos'],
        total_ingresos=datos['total_ingresos'],
        total_gastos=datos['total_gastos'],
        ganancia_neta=datos['ganancia_neta'],
        lotes_activos=datos['lotes_activos']
    )

@ventas_bp.route('/api/ventas/cerrar_lote', methods=['POST'])
@login_required
@admin_required
def cerrar_lote_y_vender():
    data = request.json
    from services.ventas_service import cerrar_lote_y_vender as svc_cerrar_lote
    exito, msg = svc_cerrar_lote(
        id_lote=data.get('id_lote'),
        peso_total_kg=data.get('peso_total_kg'),
        precio_por_kg=data.get('precio_por_kg'),
        cliente=data.get('cliente', ''),
        observaciones=data.get('observaciones', '')
    )
    
    if exito:
        return jsonify({'success': True, 'mensaje': msg})
    else:
        return jsonify({'success': False, 'error': msg}), 400

@ventas_bp.route('/api/gastos/registrar', methods=['POST'])
@login_required
@admin_required
def registrar_gasto():
    data = request.json
    from services.ventas_service import registrar_nuevo_gasto as svc_registrar_gasto
    exito, msg = svc_registrar_gasto(
        id_lote=data.get('id_lote'),
        concepto=data.get('concepto'),
        monto=data.get('monto'),
        observaciones=data.get('observaciones', '')
    )

    if exito:
        return jsonify({'success': True, 'mensaje': msg})
    else:
        return jsonify({'success': False, 'error': msg}), 400
