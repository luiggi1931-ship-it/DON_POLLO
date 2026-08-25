from flask import Blueprint, render_template, jsonify
from flask_login import login_required
from models.lote import Lote
from models.mortalidad import Mortalidad
from models.asignacion import AsignacionJaula
from models import db
from sqlalchemy import func
from datetime import date, timedelta

general_bp = Blueprint('general', __name__)


@general_bp.route('/')
@login_required
def dashboard():
    return render_template('dashboard.html')


@general_bp.route('/reportes')
@login_required
def reportes():
    return render_template('reportes.html')


@general_bp.route('/api/dashboard')
@login_required
def api_dashboard():
    # Pre-cargar mortalidades y asignaciones (con sus jaulas)
    lotes = Lote.query.options(
        db.selectinload(Lote.mortalidades),
        db.selectinload(Lote.asignaciones).joinedload(AsignacionJaula.jaula)
    ).all()

    activos  = [l for l in lotes if l.estado_activo_cerrado == 1]
    cerrados = [l for l in lotes if l.estado_activo_cerrado == 0]
    total_aves  = sum(l.saldo_actual for l in activos)
    total_bajas = sum(sum(m.cantidad for m in l.mortalidades) for l in lotes)

    hoy = date.today()

    lotes_data = []
    for l in activos:
        # Calcular mortalidad de hoy para este lote
        bajas_hoy = sum(m.cantidad for m in l.mortalidades if m.fecha == hoy)
        
        # Mapear jaulas asignadas
        jaulas = []
        for asig in l.asignaciones:
            if asig.jaula:
                jaulas.append({
                    'id': asig.jaula.id_jaula_,
                    'nombre': asig.jaula.ubicacion,
                    'aves': asig.cantidad_aves
                })
        
        lotes_data.append({
            'id': l.id_lote_,
            'tipo': l.tipo_ave,
            'aves': l.saldo_actual,
            'mortalidad_pct': l.mortalidad_porcentaje,
            'mortalidad_hoy': bajas_hoy,
            'edad_dias': l.edad_dias,
            'jaulas': jaulas
        })

    # Mortalidad diaria últimos 7 días usando ORM
    mortality_trend = []
    for i in range(6, -1, -1):
        dia = hoy - timedelta(days=i)
        bajas_dia = db.session.query(func.sum(Mortalidad.cantidad)).filter(
            Mortalidad.fecha == dia
        ).scalar() or 0
        mortality_trend.append({'fecha': dia.strftime('%d/%m'), 'bajas': int(bajas_dia)})

    return jsonify({
        'resumen': {
            'lotes_activos':  len(activos),
            'lotes_cerrados': len(cerrados),
            'total_aves':     total_aves,
            'total_bajas':    total_bajas,
        },
        'lotes':               lotes_data,
        'mortalidad_tendencia': mortality_trend,
    })
