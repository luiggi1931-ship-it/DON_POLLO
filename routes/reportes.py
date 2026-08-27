from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required, current_user
from models import db
from models.lote import Lote
from models.lectura_sensor import LecturaSensor
from models.mortalidad import Mortalidad
from models.vacunacion import Vacunacion
from models.vacuna import Vacuna
from models.venta import Venta
from models.gasto import Gasto
from datetime import datetime, timedelta, date
import random

reportes_bp = Blueprint('reportes', __name__)

@reportes_bp.route('/api/reportes/financiero')
@login_required
def api_financiero():
    inicio_str = request.args.get('inicio')
    fin_str = request.args.get('fin')
    
    from services.reportes_service import generar_reporte_financiero
    datos = generar_reporte_financiero(inicio_str, fin_str)

    return jsonify(datos)

@reportes_bp.route('/reportes')
@login_required
def dashboard_reportes():
    # Obtener lotes para el selector
    lotes = Lote.query.filter_by(estado_activo_cerrado=1).all()
    vacunas_catalogo = Vacuna.query.all()
    return render_template('reportes.html', lotes=lotes, vacunas=vacunas_catalogo)

@reportes_bp.route('/api/reportes/telemetria/<int:id_lote>')
@login_required
def api_telemetria_historica(id_lote):
    """Devuelve historial de sensores para los gráficos de línea y pastel"""
    from services.reportes_service import obtener_telemetria_historica
    datos = obtener_telemetria_historica(id_lote)
    
    if not datos:
        return jsonify({'error': 'No hay datos'}), 404

    return jsonify(datos)

@reportes_bp.route('/api/reportes/sanidad/<int:id_lote>')
@login_required
def api_sanidad(id_lote):
    """Devuelve datos de mortalidad y vacunas del lote"""
    from services.reportes_service import obtener_datos_sanidad
    datos = obtener_datos_sanidad(id_lote)
    return jsonify(datos)

@reportes_bp.route('/api/reportes/registrar_vacuna', methods=['POST'])
@login_required
def registrar_vacuna():
    """Registra que una vacuna fue aplicada al lote"""
    data = request.json
    from services.reportes_service import registrar_vacuna_servicio
    
    exito, res = registrar_vacuna_servicio(
        id_lote=data.get('id_lote'),
        id_vacuna=data.get('id_vacuna'),
        observaciones=data.get('observaciones', 'Registrado desde Reportes')
    )
    
    if exito:
        return jsonify({'success': True, 'vacunacion': res})
    else:
        return jsonify(res), 400
