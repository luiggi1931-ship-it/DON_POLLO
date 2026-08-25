from .base import db
from datetime import datetime

def get_current_time():
    return datetime.now()

class Alerta(db.Model):
    __tablename__ = 'alertas'
    
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False) # 'warning', 'danger', 'info'
    mensaje = db.Column(db.String(255), nullable=False)
    fecha = db.Column(db.DateTime, default=get_current_time, nullable=False)
    leida = db.Column(db.Boolean, default=False, nullable=False)

    def __init__(self, tipo, mensaje, leida=False, fecha=None):
        self.tipo = tipo
        self.mensaje = mensaje
        self.leida = leida
        if fecha:
            self.fecha = fecha

    def to_dict(self):
        # Convertimos fecha a string legible, ej: "23 Ago, 15:30"
        return {
            'id': self.id,
            'tipo': self.tipo,
            'mensaje': self.mensaje,
            'fecha': self.fecha.strftime("%d %b, %H:%M"),
            'fecha_iso': self.fecha.isoformat(),
            'leida': self.leida
        }
