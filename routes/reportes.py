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
    
    # Defaults a los últimos 30 días si no hay fechas
    if not inicio_str or not fin_str:
        fin = date.today()
        inicio = fin - timedelta(days=30)
    else:
        inicio = datetime.strptime(inicio_str, '%Y-%m-%d').date()
        fin = datetime.strptime(fin_str, '%Y-%m-%d').date()

    # Consultar Ventas en el rango
    ventas = Venta.query.filter(Venta.fecha_venta >= inicio, Venta.fecha_venta <= fin).order_by(Venta.fecha_venta.asc()).all()
    # Consultar Gastos en el rango
    gastos = Gasto.query.filter(Gasto.fecha_gasto >= inicio, Gasto.fecha_gasto <= fin).order_by(Gasto.fecha_gasto.asc()).all()

    # Agrupar por fechas para el gráfico
    # Usaremos un diccionario donde la clave es la fecha string y el valor { 'ingresos': 0, 'gastos': 0 }
    diario = {}
    
    # Generar todos los días en el rango para que no queden huecos en el gráfico
    delta = fin - inicio
    for i in range(delta.days + 1):
        dia = inicio + timedelta(days=i)
        diario[dia.strftime('%Y-%m-%d')] = {'ingresos': 0, 'gastos': 0}

    total_ingresos = 0
    for v in ventas:
        d = v.fecha_venta.strftime('%Y-%m-%d')
        if d in diario:
            diario[d]['ingresos'] += v.ingreso_total
        total_ingresos += v.ingreso_total

    total_gastos = 0
    for g in gastos:
        d = g.fecha_gasto.strftime('%Y-%m-%d')
        if d in diario:
            diario[d]['gastos'] += g.monto
        total_gastos += g.monto

    # Preparar arrays para Chart.js
    labels = list(diario.keys())
    data_ingresos = [diario[d]['ingresos'] for d in labels]
    data_gastos = [diario[d]['gastos'] for d in labels]

    return jsonify({
        'resumen': {
            'total_ingresos': total_ingresos,
            'total_gastos': total_gastos,
            'ganancia_neta': total_ingresos - total_gastos
        },
        'grafico': {
            'labels': labels,
            'ingresos': data_ingresos,
            'gastos': data_gastos
        }
    })

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
    # Para el prototipo: Obtener las últimas 20 lecturas para este lote (historial reciente)
    lecturas = LecturaSensor.query.filter_by(id_lote=id_lote).order_by(LecturaSensor.fecha_hora.asc()).limit(20).all()
    
    if not lecturas:
        return jsonify({'error': 'No hay datos'}), 404

    fechas = []
    temps = []
    hums = []
    ammons = []
    
    # Para el gráfico de pastel: tomamos el consumo acumulado de la última lectura
    ultima = lecturas[-1]

    for l in lecturas:
        fechas.append(l.fecha_hora.strftime('%H:%M:%S'))
        temps.append(l.temperatura)
        hums.append(l.humedad)
        ammons.append(l.amoniaco)

    return jsonify({
        'line_chart': {
            'labels': fechas,
            'temperatura': temps,
            'humedad': hums,
            'amoniaco': ammons
        },
        'pie_chart': {
            # Simulamos distribución de consumo de alimento y agua 
            'agua_consumida': ultima.agua,
            'agua_esperada': 500, # Valor de ejemplo
            'alimento_consumido': ultima.alimento,
            'alimento_esperado': 250 # Valor de ejemplo
        }
    })

@reportes_bp.route('/api/reportes/sanidad/<int:id_lote>')
@login_required
def api_sanidad(id_lote):
    """Devuelve datos de mortalidad y vacunas del lote"""
    lote = Lote.query.get_or_404(id_lote)
    
    # Mortalidad (agrupada por causa)
    bajas = Mortalidad.query.filter_by(id_lote_=id_lote).all()
    causas = {}
    total_bajas = 0
    for b in bajas:
        total_bajas += b.cantidad
        causas[b.causa] = causas.get(b.causa, 0) + b.cantidad
        
    mortalidad_lista = [{'causa': c, 'cantidad': q} for c, q in causas.items()]

    # Vacunaciones
    from sqlalchemy.orm import joinedload
    vacunaciones = Vacunacion.query.filter_by(id_lote=id_lote).options(joinedload(Vacunacion.vacuna)).all()
    historial_vacunas = [v.to_dict() for v in vacunaciones]
    
    # Alertas automáticas de vacunación (basadas en edad)
    alertas = []
    todas_vacunas = Vacuna.query.all()
    
    # Determinar qué vacunas faltan según la edad
    vacunadas_ids = [v.id_vacuna for v in vacunaciones if v.estado == 'Aplicada']
    
    for vac in todas_vacunas:
        if vac.id_vacuna not in vacunadas_ids:
            # Si el lote ya tiene más días que los recomendados, está atrasada
            if lote.edad_dias >= vac.dias_aplicacion_recomendado:
                alertas.append({
                    'vacuna': vac.nombre,
                    'mensaje': f'ATRASADA: Debió aplicarse al día {vac.dias_aplicacion_recomendado} (el lote tiene {lote.edad_dias} días)',
                    'tipo': 'danger'
                })
            # Si le faltan 2 días o menos, está próxima
            elif (vac.dias_aplicacion_recomendado - lote.edad_dias) <= 2:
                alertas.append({
                    'vacuna': vac.nombre,
                    'mensaje': f'PRÓXIMA: Aplicar al día {vac.dias_aplicacion_recomendado} (faltan {vac.dias_aplicacion_recomendado - lote.edad_dias} días)',
                    'tipo': 'warning'
                })

    return jsonify({
        'mortalidad_total': total_bajas,
        'mortalidad_detalle': mortalidad_lista,
        'vacunas': historial_vacunas,
        'alertas_vacunacion': alertas
    })

@reportes_bp.route('/api/reportes/registrar_vacuna', methods=['POST'])
@login_required
def registrar_vacuna():
    """Registra que una vacuna fue aplicada al lote"""
    data = request.json
    id_lote = data.get('id_lote')
    id_vacuna = data.get('id_vacuna')
    
    if not id_lote or not id_vacuna:
        return jsonify({'error': 'Datos incompletos'}), 400
        
    nueva = Vacunacion(
        id_lote=id_lote,
        id_vacuna=id_vacuna,
        estado='Aplicada',
        observaciones=data.get('observaciones', 'Registrado desde Reportes')
    )
    
    db.session.add(nueva)
    db.session.commit()
    
    return jsonify({'success': True, 'vacunacion': nueva.to_dict()})
