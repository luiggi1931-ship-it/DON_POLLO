from models.base import db
from datetime import datetime

class Vacunacion(db.Model):
    __tablename__ = 'vacunaciones'

    id_vacunacion = db.Column(db.Integer, primary_key=True)
    id_lote = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)
    id_vacuna = db.Column(db.Integer, db.ForeignKey('vacunas.id_vacuna'), nullable=False)
    
    fecha_aplicacion = db.Column(db.Date, nullable=False, default=datetime.now)
    estado = db.Column(db.String(50), nullable=False, default='Aplicada') # 'Aplicada', 'Pendiente', 'Atrasada'
    observaciones = db.Column(db.String(250), nullable=True)

    # Relaciones
    lote = db.relationship('Lote', backref=db.backref('vacunaciones', lazy=True, cascade="all, delete-orphan"))
    vacuna = db.relationship('Vacuna', backref=db.backref('aplicaciones', lazy=True))

    def __init__(self, id_lote, id_vacuna, fecha_aplicacion=None, estado='Aplicada', observaciones=None, **kwargs):
        super().__init__(**kwargs)
        self.id_lote = id_lote
        self.id_vacuna = id_vacuna
        if fecha_aplicacion:
            self.fecha_aplicacion = fecha_aplicacion
        self.estado = estado
        self.observaciones = observaciones

    def to_dict(self):
        return {
            'id_vacunacion': self.id_vacunacion,
            'id_lote': self.id_lote,
            'id_vacuna': self.id_vacuna,
            'vacuna_nombre': self.vacuna.nombre if self.vacuna else '',
            'fecha_aplicacion': self.fecha_aplicacion.strftime('%Y-%m-%d') if self.fecha_aplicacion else None,
            'estado': self.estado,
            'observaciones': self.observaciones
        }
