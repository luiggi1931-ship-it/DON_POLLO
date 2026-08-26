from models.base import db
from datetime import datetime

class Gasto(db.Model):
    __tablename__ = 'gastos'

    id_gasto = db.Column(db.Integer, primary_key=True)
    id_lote = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=True)
    fecha_gasto = db.Column(db.Date, nullable=False, default=datetime.now, index=True)
    concepto = db.Column(db.String(100), nullable=False) # Alimento, Vacunas, Transporte, Otros
    monto = db.Column(db.Float, nullable=False)
    observaciones = db.Column(db.String(250), nullable=True)

    # Relación
    lote = db.relationship('Lote', backref=db.backref('gastos', lazy=True))

    def __init__(self, concepto, monto, id_lote=None, observaciones=None, fecha_gasto=None, **kwargs):
        super().__init__(**kwargs)
        self.id_lote = id_lote
        self.concepto = concepto
        self.monto = monto
        self.observaciones = observaciones
        if fecha_gasto:
            self.fecha_gasto = fecha_gasto

    def to_dict(self):
        return {
            'id_gasto': self.id_gasto,
            'id_lote': self.id_lote,
            'fecha_gasto': self.fecha_gasto.strftime('%Y-%m-%d') if self.fecha_gasto else None,
            'concepto': self.concepto,
            'monto': self.monto,
            'observaciones': self.observaciones
        }
