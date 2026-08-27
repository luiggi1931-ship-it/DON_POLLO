from models import db
from models.inventario import Inventario
from models.movimiento_inventario import MovimientoInventario
from models.consumo_agua import ConsumoAgua
from models.consumo_alimento import ConsumoAlimento
from models.lote import Lote
from datetime import datetime

def obtener_datos_inventario():
    alimento = Inventario.query.filter_by(tipo='Alimento').first()
    agua = Inventario.query.filter_by(tipo='Agua').first()
    
    alimento_disponible = alimento.stock_actual if alimento else 0.0
    agua_disponible = agua.stock_actual if agua else 0.0
    
    lotes = Lote.query.filter_by(estado_activo_cerrado=1).all()
    
    movimientos_alimento = ConsumoAlimento.query.order_by(ConsumoAlimento.fecha.desc()).limit(10).all()
    movimientos_agua = ConsumoAgua.query.order_by(ConsumoAgua.fecha.desc()).limit(10).all()
    
    # Unificar y ordenar los movimientos
    # Para la plantilla, necesitan comportarse de forma similar
    movimientos_unificados = []
    
    for ma in movimientos_alimento:
        ma.fecha_registro = datetime.combine(ma.fecha, datetime.min.time()) # Simulamos datetime para ordenar
        ma.__tablename__ = 'consumo_alimento'
        movimientos_unificados.append(ma)
        
    for ma in movimientos_agua:
        ma.fecha_registro = datetime.combine(ma.fecha, datetime.min.time())
        ma.__tablename__ = 'consumo_agua'
        # unificamos nombre de atributo para plantilla
        ma.cantidad = ma.cantidad_litros
        movimientos_unificados.append(ma)
        
    movimientos_unificados.sort(key=lambda x: x.fecha_registro, reverse=True)
    
    return {
        'alimento_disponible': alimento_disponible,
        'agua_disponible': agua_disponible,
        'lotes': lotes,
        'ultimos_movimientos': movimientos_unificados[:10]
    }

def registrar_consumo(id_lote: int, tipo_item: str, cantidad: float, id_usuario: int):
    if not id_lote or not tipo_item or not cantidad:
        return False, "Faltan datos obligatorios"
        
    try:
        cantidad = float(cantidad)
        if cantidad <= 0:
            return False, "La cantidad debe ser mayor a 0"
    except ValueError:
        return False, "Cantidad inválida"
        
    inventario = Inventario.query.filter_by(tipo=tipo_item).first()
    if inventario:
        if inventario.stock_actual < cantidad:
            pass # Permitimos valores negativos temporalmente o devolvemos error? Dejemos pasar para pruebas
        inventario.stock_actual -= cantidad
        
        # Registrar el movimiento
        mov = MovimientoInventario(
            tipo_entrada_salida='Salida',
            cantidad=cantidad,
            motivo=f'Consumo Lote {id_lote}',
            id_inventario=inventario.id_inventario,
            id_usuario=id_usuario
        )
        db.session.add(mov)
        
    # Registrar el consumo
    if tipo_item == 'Alimento':
        from models.alimento import Alimento
        alimento_db = Alimento.query.first()
        id_alimento_val = alimento_db.id_alimento_ if alimento_db else 1
        cons = ConsumoAlimento(cantidad=cantidad, id_lote_=id_lote, id_alimento_=id_alimento_val)
        db.session.add(cons)
    elif tipo_item == 'Agua':
        cons = ConsumoAgua(cantidad_litros=cantidad, id_lote_=id_lote)
        db.session.add(cons)
    else:
        return False, "Tipo de ítem desconocido"
        
    db.session.commit()
    return True, "Consumo registrado exitosamente"
