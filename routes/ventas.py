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
    # Obtener todas las ventas y sus gastos asociados al lote
    from sqlalchemy.orm import joinedload
    ventas = Venta.query.options(joinedload(Venta.lote)).order_by(Venta.fecha_venta.desc()).all()
    
    # Calcular totales
    total_ingresos = sum(v.ingreso_total for v in ventas)
    
    # Todos los gastos ordenados por fecha
    gastos = Gasto.query.order_by(Gasto.fecha_gasto.desc()).all()
    total_gastos = sum(g.monto for g in gastos)

    ganancia_neta = total_ingresos - total_gastos

    # Lotes activos para poder cerrarlos
    lotes_activos = Lote.query.filter_by(estado_activo_cerrado=1).all()

    return render_template(
        'ventas.html',
        ventas=ventas,
        gastos=gastos,
        total_ingresos=total_ingresos,
        total_gastos=total_gastos,
        ganancia_neta=ganancia_neta,
        lotes_activos=lotes_activos
    )

@ventas_bp.route('/api/ventas/cerrar_lote', methods=['POST'])
@login_required
@admin_required
def cerrar_lote_y_vender():
    data = request.json
    id_lote = data.get('id_lote')
    peso_total_kg = data.get('peso_total_kg')
    precio_por_kg = data.get('precio_por_kg')
    cliente = data.get('cliente', '')
    observaciones = data.get('observaciones', '')

    if not id_lote or not peso_total_kg or not precio_por_kg:
        return jsonify({'success': False, 'error': 'Faltan datos obligatorios'}), 400

    try:
        peso_total_kg = float(peso_total_kg)
        precio_por_kg = float(precio_por_kg)
    except ValueError:
        return jsonify({'success': False, 'error': 'Valores numéricos inválidos'}), 400

    lote = Lote.query.get(id_lote)
    if not lote:
        return jsonify({'success': False, 'error': 'Lote no encontrado'}), 404
        
    if lote.estado_activo_cerrado == 0:
        return jsonify({'success': False, 'error': 'El lote ya está cerrado'}), 400

    # Cambiar estado del lote
    lote.estado_activo_cerrado = 0
    lote.fecha_cierre = date.today()

    # Calcular ingreso total
    ingreso_total = peso_total_kg * precio_por_kg

    # Registrar venta
    nueva_venta = Venta(
        id_lote=lote.id_lote_,
        cantidad_aves=lote.saldo_actual,
        peso_total_kg=peso_total_kg,
        precio_por_kg=precio_por_kg,
        ingreso_total=ingreso_total,
        cliente=cliente,
        observaciones=observaciones,
        fecha_venta=date.today()
    )

    db.session.add(nueva_venta)
    db.session.commit()

    return jsonify({'success': True, 'mensaje': 'Lote cerrado y venta registrada correctamente'})

@ventas_bp.route('/api/gastos/registrar', methods=['POST'])
@login_required
@admin_required
def registrar_gasto():
    data = request.json
    id_lote = data.get('id_lote')
    concepto = data.get('concepto')
    monto = data.get('monto')
    observaciones = data.get('observaciones', '')

    if not concepto or not monto:
        return jsonify({'success': False, 'error': 'Faltan datos obligatorios'}), 400

    try:
        monto = float(monto)
    except ValueError:
        return jsonify({'success': False, 'error': 'Monto inválido'}), 400

    # Si viene un id_lote vacío, lo guardamos como None
    if not id_lote or str(id_lote).strip() == '':
        id_lote = None

    nuevo_gasto = Gasto(
        id_lote=id_lote,
        concepto=concepto,
        monto=monto,
        observaciones=observaciones,
        fecha_gasto=date.today()
    )

    db.session.add(nuevo_gasto)
    db.session.commit()

    return jsonify({'success': True, 'mensaje': 'Gasto registrado'})
