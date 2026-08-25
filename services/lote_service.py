"""
Servicio de lotes — lógica de negocio desacoplada del HTTP layer.
"""
from datetime import datetime
from models import db
from models.lote import Lote
from models.jaula import Jaula
from models.asignacion import AsignacionJaula
from models.mortalidad import Mortalidad


def _parse_lote_data(form) -> dict:
    """Extrae y tipifica los campos del formulario de lote."""
    return {
        'fecha_ingreso': datetime.strptime(form['fecha_ingreso'], '%Y-%m-%d'),
        'cantidad_inicial': int(form['cantidad_inicial']),
        'edad_inicial': int(form.get('edad_inicial', 0)),
        'proveedor': form['proveedor'],
        'tipo_ave': form['tipo_ave'],
        'peso_inicial': float(form['peso_inicial']),
        'estado_activo_cerrado': 1 if form['estado_activo_cerrado'] == 'ACTIVO' else 0,
        'observaciones': form.get('observaciones', ''),
        'fecha_cierre': (
            datetime.strptime(form['fecha_cierre'], '%Y-%m-%d')
            if form.get('fecha_cierre') else None
        ),
        'id_usuario': 1,  # TODO: reemplazar con current_user.id_usuario tras login completo
    }


def crear_lote(form, ids_jaulas: list) -> tuple[bool, str]:
    """
    Crea un nuevo lote y distribuye aves equitativamente en las jaulas seleccionadas.
    Retorna (éxito: bool, mensaje: str).
    """
    try:
        num_jaulas = len(ids_jaulas)
        if num_jaulas < 1:
            return False, 'Debes seleccionar al menos 1 jaula para crear un lote.'

        datos = _parse_lote_data(form)
        nuevo_lote = Lote(**datos)
        db.session.add(nuevo_lote)
        db.session.flush()  # Genera el ID antes del commit

        jaulas = Jaula.query.filter(Jaula.id_jaula_.in_(ids_jaulas)).all()
        aves_por_jaula = nuevo_lote.cantidad_inicial // num_jaulas
        sobra = nuevo_lote.cantidad_inicial % num_jaulas

        for i, jaula in enumerate(jaulas):
            cantidad = aves_por_jaula + (1 if i < sobra else 0)
            db.session.add(AsignacionJaula(
                fecha_inicio=nuevo_lote.fecha_ingreso,
                cantidad_aves=cantidad,
                id_lote_=nuevo_lote.id_lote_,
                id_jaula_=jaula.id_jaula_
            ))
            jaula.estado = 0  # Marcar como Ocupada

        db.session.commit()
        return True, f'Lote #{nuevo_lote.id_lote_} creado correctamente.'
    except Exception as e:
        db.session.rollback()
        return False, f'Error al crear lote: {e}'


def editar_lote(id_lote: int, form) -> tuple[bool, str]:
    """
    Edita un lote existente. Si se cierra un lote activo, libera sus jaulas.
    """
    try:
        lote = db.session.get(Lote, int(id_lote))
        if not lote:
            return False, 'Lote no encontrado.'

        datos = _parse_lote_data(form)

        # Lógica automática: si el lote pasa de activo → cerrado, liberar jaulas
        if lote.estado_activo_cerrado == 1 and datos['estado_activo_cerrado'] == 0:
            for asignacion in lote.asignaciones:
                asignacion.jaula.estado = 1  # 1 = Disponible

        for key, value in datos.items():
            setattr(lote, key, value)

        db.session.commit()
        return True, f'Lote #{lote.id_lote_} actualizado correctamente.'
    except Exception as e:
        db.session.rollback()
        return False, f'Error al editar lote: {e}'


def eliminar_lote_completo(id_lote: int) -> tuple[bool, str]:
    """
    Elimina un lote de forma segura: libera jaulas, elimina mortalidades y asignaciones.
    """
    try:
        lote = db.session.get(Lote, id_lote)
        if not lote:
            return False, 'Lote no encontrado.'

        # 1. Liberar jaulas y eliminar asignaciones
        for asignacion in lote.asignaciones:
            asignacion.jaula.estado = 1
            db.session.delete(asignacion)

        # 2. Eliminar historial de mortalidad
        for mort in lote.mortalidades:
            db.session.delete(mort)

        # 3. Eliminar el lote
        db.session.delete(lote)
        db.session.commit()
        return True, f'Lote #{id_lote} eliminado correctamente.'
    except Exception as e:
        db.session.rollback()
        return False, f'Error al eliminar lote: {e}'
