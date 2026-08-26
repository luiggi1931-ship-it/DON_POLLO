from models.base import db
from datetime import datetime

class LecturaSensor(db.Model):
    __tablename__ = 'lecturas_sensores'

    id_lectura = db.Column(db.Integer, primary_key=True)
    id_lote = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)
    
    # Variables Ambientales
    temperatura = db.Column(db.Float, nullable=False, default=0.0)
    humedad = db.Column(db.Float, nullable=False, default=0.0)
    amoniaco = db.Column(db.Float, nullable=False, default=0.0)
    iluminacion = db.Column(db.Float, nullable=False, default=0.0)
    
    # Consumos
    agua = db.Column(db.Float, nullable=False, default=0.0)
    alimento = db.Column(db.Float, nullable=False, default=0.0)
    
    fecha_hora = db.Column(db.DateTime, default=datetime.now)

    lote = db.relationship('Lote', backref=db.backref('lecturas_sensores', lazy=True, cascade="all, delete-orphan"))

    def __init__(self, id_lote, temperatura=0.0, humedad=0.0, amoniaco=0.0, iluminacion=0.0, agua=0.0, alimento=0.0, **kwargs):
        super().__init__(**kwargs)
        self.id_lote = id_lote
        self.temperatura = temperatura
        self.humedad = humedad
        self.amoniaco = amoniaco
        self.iluminacion = iluminacion
        self.agua = agua
        self.alimento = alimento

    def to_dict(self):
        return {
            'id_lectura': self.id_lectura,
            'id_lote': self.id_lote,
            'temperatura': self.temperatura,
            'humedad': self.humedad,
            'amoniaco': self.amoniaco,
            'iluminacion': self.iluminacion,
            'agua': self.agua,
            'alimento': self.alimento,
            'fecha_hora': self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')
        }
