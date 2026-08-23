from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash
from flask_login import login_required
from models import db
from models.configuracion import Configuracion
from models.variable import Variable
from models.etapa import Etapa
from services.configuracion_service import inicializar_datos_si_vacio

configuracion_bp = Blueprint('configuracion', __name__)


@configuracion_bp.route('/configuracion')
@login_required
def configuracion():
    inicializar_datos_si_vacio()
    return render_template('configuracion.html')


@configuracion_bp.route('/api/obtener_configuracion')
@login_required
def obtener_configuracion():
    inicializar_datos_si_vacio()
    configs = Configuracion.query.all()
    resultado = {}
    for c in configs:
        var_nombre = c.variable.nombre
        etapa_nombre = c.etapa.nombre
        if var_nombre not in resultado:
            resultado[var_nombre] = {}
        resultado[var_nombre][etapa_nombre] = {
            'min': c.valor_min,
            'max': c.valor_max
        }
    return jsonify(resultado)


@configuracion_bp.route('/api/parametros_etapa/<etapa>')
@login_required
def parametros_etapa(etapa):
    """Obtiene los parámetros de configuración para una etapa específica."""
    etapa_obj = Etapa.query.filter_by(nombre=etapa).first()
    if not etapa_obj:
        return jsonify({})
    configs = Configuracion.query.filter_by(id_etapa=etapa_obj.id).all()
    parametros = {}
    for c in configs:
        parametros[c.variable.nombre] = {
            'min': c.valor_min,
            'max': c.valor_max
        }
    return jsonify(parametros)


@configuracion_bp.route('/api/guardar_configuracion', methods=['POST'])
@login_required
def guardar_configuracion():
    """Guarda la configuración recibida desde el frontend."""
    try:
        from datetime import datetime
        data = request.get_json()
        for parametro, etapas in data.items():
            for etapa, valores in etapas.items():
                var_obj = Variable.query.filter_by(nombre=parametro).first()
                etapa_obj = Etapa.query.filter_by(nombre=etapa).first()
                if var_obj and etapa_obj:
                    config_item = Configuracion.query.filter_by(
                        id_variable=var_obj.id,
                        id_etapa=etapa_obj.id
                    ).first()
                    if config_item:
                        config_item.valor_min = float(valores.get('min', 0))
                        config_item.valor_max = float(valores.get('max', 0))
                        config_item.fecha_actualizacion = datetime.now()
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Configuración guardada correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400
