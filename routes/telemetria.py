from flask import Blueprint, jsonify, request
from flask_login import login_required
from models import db
from models.lectura_sensor import LecturaSensor
from models.lote import Lote
from datetime import datetime

telemetria_bp = Blueprint('telemetria', __name__)

@telemetria_bp.route('/api/sensores/actual/<int:id_lote>')
@login_required
def sensores_actual(id_lote):
    # Obtener la lectura más reciente para este lote
    lectura = LecturaSensor.query.filter_by(id_lote=id_lote).order_by(LecturaSensor.id_lectura.desc()).first()
    
    if lectura:
        return jsonify(lectura.to_dict())
    
    # Si no hay lectura, devolvemos ceros
    return jsonify({
        'temperatura': 0.0,
        'humedad': 0.0,
        'amoniaco': 0.0,
        'iluminacion': 0.0,
        'agua': 0.0,
        'alimento': 0.0
    })

@telemetria_bp.route('/api/sensores/registrar', methods=['POST'])
# NOTA: Este endpoint en el mundo real estaría protegido con un API Key (token de IoT), 
# pero para la demostración lo dejamos abierto o lo simulamos de forma interna.
def registrar_sensores():
    data = request.get_json()
    if not data or 'id_lote' not in data:
        return jsonify({'error': 'Faltan datos'}), 400
        
    lectura = LecturaSensor(
        id_lote=data['id_lote'],
        temperatura=data.get('temperatura', 0.0),
        humedad=data.get('humedad', 0.0),
        amoniaco=data.get('amoniaco', 0.0),
        iluminacion=data.get('iluminacion', 0.0),
        agua=data.get('agua', 0.0),
        alimento=data.get('alimento', 0.0)
    )
    
    db.session.add(lectura)
    db.session.commit()
    
    return jsonify({'success': True, 'id': lectura.id_lectura})
