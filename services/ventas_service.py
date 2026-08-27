from models import db
from models.lote import Lote
from models.venta import Venta
from models.gasto import Gasto
from datetime import date
from sqlalchemy.orm import joinedload

def obtener_estadisticas_ventas() -> dict:
    """
    Obtiene todas las ventas (con su lote) y gastos, 
    calculando totales y ganancia neta.
    Retorna un diccionario con los datos listos para el template.
    """
    ventas = Venta.query.options(joinedload(Venta.lote)).order_by(Venta.fecha_venta.desc()).all()
    total_ingresos = sum(v.ingreso_total for v in ventas)
    
    gastos = Gasto.query.order_by(Gasto.fecha_gasto.desc()).all()
    total_gastos = sum(g.monto for g in gastos)
    
    ganancia_neta = total_ingresos - total_gastos
    
    lotes_activos = Lote.query.filter_by(estado_activo_cerrado=1).all()
    
    return {
        'ventas': ventas,
        'gastos': gastos,
        'total_ingresos': total_ingresos,
        'total_gastos': total_gastos,
        'ganancia_neta': ganancia_neta,
        'lotes_activos': lotes_activos
    }

def cerrar_lote_y_vender(id_lote, peso_total_kg, precio_por_kg, cliente, observaciones) -> tuple[bool, str]:
    """
    Cierra un lote y registra su venta.
    Retorna (éxito: bool, mensaje: str).
    """
    if not id_lote or not peso_total_kg or not precio_por_kg:
        return False, 'Faltan datos obligatorios'

    try:
        peso_total_kg = float(peso_total_kg)
        precio_por_kg = float(precio_por_kg)
    except ValueError:
        return False, 'Valores numéricos inválidos'

    lote = Lote.query.get(id_lote)
    if not lote:
        return False, 'Lote no encontrado'
        
    if lote.estado_activo_cerrado == 0:
        return False, 'El lote ya está cerrado'

    lote.estado_activo_cerrado = 0
    lote.fecha_cierre = date.today()

    ingreso_total = peso_total_kg * precio_por_kg

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
    
    return True, 'Lote cerrado y venta registrada correctamente'

def registrar_nuevo_gasto(id_lote, concepto: str, monto, observaciones: str) -> tuple[bool, str]:
    """
    Registra un gasto operativo en el sistema.
    """
    if not concepto or not monto:
        return False, 'Faltan datos obligatorios'

    try:
        monto = float(monto)
    except ValueError:
        return False, 'Monto inválido'

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
    
    return True, 'Gasto registrado'
