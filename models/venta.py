from models.base import db
from datetime import datetime

class Venta(db.Model):
    __tablename__ = 'ventas'

    id_venta = db.Column(db.Integer, primary_key=True)
    id_lote = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)
    fecha_venta = db.Column(db.Date, nullable=False, default=datetime.now, index=True)
    cantidad_aves = db.Column(db.Integer, nullable=False)
    peso_total_kg = db.Column(db.Float, nullable=False)
    precio_por_kg = db.Column(db.Float, nullable=False)
    ingreso_total = db.Column(db.Float, nullable=False)
    cliente = db.Column(db.String(150), nullable=True)
    observaciones = db.Column(db.String(250), nullable=True)

    # Relación
    lote = db.relationship('Lote', backref=db.backref('ventas', lazy=True))

    def __init__(self, id_lote, cantidad_aves, peso_total_kg, precio_por_kg, ingreso_total, cliente=None, observaciones=None, fecha_venta=None, **kwargs):
        super().__init__(**kwargs)
        self.id_lote = id_lote
        self.cantidad_aves = cantidad_aves
        self.peso_total_kg = peso_total_kg
        self.precio_por_kg = precio_por_kg
        self.ingreso_total = ingreso_total
        self.cliente = cliente
        self.observaciones = observaciones
        if fecha_venta:
            self.fecha_venta = fecha_venta

    def to_dict(self):
        return {
            'id_venta': self.id_venta,
            'id_lote': self.id_lote,
            'fecha_venta': self.fecha_venta.strftime('%Y-%m-%d') if self.fecha_venta else None,
            'cantidad_aves': self.cantidad_aves,
            'peso_total_kg': self.peso_total_kg,
            'precio_por_kg': self.precio_por_kg,
            'ingreso_total': self.ingreso_total,
            'cliente': self.cliente,
            'observaciones': self.observaciones
        }
