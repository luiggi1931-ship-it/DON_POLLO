from models import db
from models.lote import Lote
from models.lectura_sensor import LecturaSensor
from models.mortalidad import Mortalidad
from models.vacunacion import Vacunacion
from models.vacuna import Vacuna
from models.venta import Venta
from models.gasto import Gasto
from datetime import datetime, timedelta, date
from sqlalchemy.orm import joinedload

def generar_reporte_financiero(inicio_str: str, fin_str: str) -> dict:
    # Defaults a los últimos 30 días si no hay fechas
    if not inicio_str or not fin_str:
        fin = date.today()
        inicio = fin - timedelta(days=30)
    else:
        inicio = datetime.strptime(inicio_str, '%Y-%m-%d').date()
        fin = datetime.strptime(fin_str, '%Y-%m-%d').date()

    ventas = Venta.query.filter(Venta.fecha_venta >= inicio, Venta.fecha_venta <= fin).order_by(Venta.fecha_venta.asc()).all()
    gastos = Gasto.query.filter(Gasto.fecha_gasto >= inicio, Gasto.fecha_gasto <= fin).order_by(Gasto.fecha_gasto.asc()).all()

    diario = {}
    
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

    labels = list(diario.keys())
    data_ingresos = [diario[d]['ingresos'] for d in labels]
    data_gastos = [diario[d]['gastos'] for d in labels]

    return {
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
    }

def obtener_telemetria_historica(id_lote: int) -> dict:
    lecturas = LecturaSensor.query.filter_by(id_lote=id_lote).order_by(LecturaSensor.fecha_hora.asc()).limit(20).all()
    
    if not lecturas:
        return None

    fechas = []
    temps = []
    hums = []
    ammons = []
    
    ultima = lecturas[-1]

    for l in lecturas:
        fechas.append(l.fecha_hora.strftime('%H:%M:%S'))
        temps.append(l.temperatura)
        hums.append(l.humedad)
        ammons.append(l.amoniaco)

    return {
        'line_chart': {
            'labels': fechas,
            'temperatura': temps,
            'humedad': hums,
            'amoniaco': ammons
        },
        'pie_chart': {
            'agua_consumida': ultima.agua,
            'agua_esperada': 500,
            'alimento_consumido': ultima.alimento,
            'alimento_esperado': 250
        }
    }

def obtener_datos_sanidad(id_lote: int) -> dict:
    lote = Lote.query.get_or_404(id_lote)
    
    bajas = Mortalidad.query.filter_by(id_lote_=id_lote).all()
    causas = {}
    total_bajas = 0
    for b in bajas:
        total_bajas += b.cantidad
        causas[b.causa] = causas.get(b.causa, 0) + b.cantidad
        
    mortalidad_lista = [{'causa': c, 'cantidad': q} for c, q in causas.items()]

    vacunaciones = Vacunacion.query.filter_by(id_lote=id_lote).options(joinedload(Vacunacion.vacuna)).all()
    historial_vacunas = [v.to_dict() for v in vacunaciones]
    
    alertas = []
    todas_vacunas = Vacuna.query.all()
    
    vacunadas_ids = [v.id_vacuna for v in vacunaciones if v.estado == 'Aplicada']
    
    for vac in todas_vacunas:
        if vac.id_vacuna not in vacunadas_ids:
            if lote.edad_dias >= vac.dias_aplicacion_recomendado:
                alertas.append({
                    'vacuna': vac.nombre,
                    'mensaje': f'ATRASADA: Debió aplicarse al día {vac.dias_aplicacion_recomendado} (el lote tiene {lote.edad_dias} días)',
                    'tipo': 'danger'
                })
            elif (vac.dias_aplicacion_recomendado - lote.edad_dias) <= 2:
                alertas.append({
                    'vacuna': vac.nombre,
                    'mensaje': f'PRÓXIMA: Aplicar al día {vac.dias_aplicacion_recomendado} (faltan {vac.dias_aplicacion_recomendado - lote.edad_dias} días)',
                    'tipo': 'warning'
                })

    return {
        'mortalidad_total': total_bajas,
        'mortalidad_detalle': mortalidad_lista,
        'vacunas': historial_vacunas,
        'alertas_vacunacion': alertas
    }

def registrar_vacuna_servicio(id_lote: int, id_vacuna: int, observaciones: str) -> tuple[bool, dict]:
    if not id_lote or not id_vacuna:
        return False, {'error': 'Datos incompletos'}
        
    nueva = Vacunacion(
        id_lote=id_lote,
        id_vacuna=id_vacuna,
        estado='Aplicada',
        observaciones=observaciones
    )
    
    db.session.add(nueva)
    db.session.commit()
    
    return True, nueva.to_dict()
