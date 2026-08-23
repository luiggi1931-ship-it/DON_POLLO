from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from models import db
from models.lote import Lote
from models.jaula import Jaula
from services.lote_service import (
    crear_lote, editar_lote, eliminar_lote_completo
)

lotes_bp = Blueprint('lotes', __name__)


# --- RUTAS DE LOTES ---

@lotes_bp.route('/lotes')
@login_required
def lotes():
    search = request.args.get('search', '')
    query = Lote.query.options(joinedload(Lote.mortalidades))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(Lote.proveedor.like(search_term), Lote.tipo_ave.like(search_term))
        )

    lista_lotes = query.order_by(Lote.fecha_ingreso.desc()).all()
    lista_jaulas = Jaula.query.order_by(Jaula.id_jaula_).all()

    total_aves = sum(l.saldo_actual for l in lista_lotes)
    activos = sum(1 for l in lista_lotes if l.estado_activo_cerrado == 1)
    cerrados = sum(1 for l in lista_lotes if l.estado_activo_cerrado == 0)

    return render_template(
        'lotes.html',
        lotes=lista_lotes,
        jaulas=lista_jaulas,
        total_aves=total_aves,
        activos=activos,
        cerrados=cerrados
    )


@lotes_bp.route('/guardar_lote', methods=['POST'])
@login_required
def guardar_lote():
    id_lote = request.form.get('id_lote')
    ids_seleccionados = request.form.getlist('jaulas_seleccionadas')

    if id_lote:
        # EDITAR lote existente
        ok, msg = editar_lote(id_lote, request.form)
    else:
        # CREAR nuevo lote
        ok, msg = crear_lote(request.form, ids_seleccionados)

    flash(msg, 'success' if ok else 'error')
    return redirect(url_for('lotes.lotes'))


@lotes_bp.route('/eliminar_lote/<int:id_lote>', methods=['POST'])
@login_required
def eliminar_lote(id_lote):
    ok, msg = eliminar_lote_completo(id_lote)
    flash(msg, 'success' if ok else 'error')
    return redirect(url_for('lotes.lotes'))


@lotes_bp.route('/registrar_mortalidad', methods=['POST'])
@login_required
def registrar_mortalidad():
    from datetime import datetime
    from models.mortalidad import Mortalidad
    try:
        data = request.form
        nueva_baja = Mortalidad(
            id_lote_=int(data['id_lote']),
            fecha=datetime.strptime(data['fecha'], '%Y-%m-%d'),
            cantidad=int(data['cantidad']),
            causa=data['causa']
        )
        db.session.add(nueva_baja)
        db.session.commit()
        flash('Baja registrada correctamente.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error al registrar baja: {e}', 'error')
    return redirect(url_for('lotes.lotes'))


# --- RUTAS DE JAULAS ---

@lotes_bp.route('/guardar_jaula', methods=['POST'])
@login_required
def guardar_jaula():
    try:
        data = request.form
        metros = data.get('metros_cuadrados')
        fecha = data.get('fecha_creacion')

        metros_val = float(metros) if metros else None
        fecha_val = fecha if fecha else None

        nueva_jaula = Jaula(
            ubicacion=data['ubicacion'],
            estado=1,
            metros_cuadrados=metros_val,
            fecha_creacion=fecha_val
        )
        db.session.add(nueva_jaula)
        db.session.commit()
        flash('Jaula agregada correctamente.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error al crear jaula: {e}', 'error')
    return redirect(url_for('lotes.lotes'))


@lotes_bp.route('/eliminar_jaula/<int:id_jaula>', methods=['POST'])
@login_required
def eliminar_jaula(id_jaula):
    try:
        jaula = db.session.get(Jaula, id_jaula)
        if jaula:
            db.session.delete(jaula)
            db.session.commit()
            flash('Jaula eliminada correctamente.', 'success')
        else:
            flash('Jaula no encontrada.', 'error')
    except Exception as e:
        db.session.rollback()
        flash(f'Error al eliminar jaula: {e}', 'error')
    return redirect(url_for('lotes.lotes'))
