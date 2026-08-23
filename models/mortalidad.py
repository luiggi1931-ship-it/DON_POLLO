from .base import db
from datetime import datetime

class Mortalidad(db.Model):
    __tablename__ = 'mortalidad'

    id_mortalidad_ = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, nullable=False, default=datetime.now)
    cantidad = db.Column(db.Integer, nullable=False)
    causa = db.Column(db.String(150), nullable=False)
    id_lote_ = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)

    def __init__(self, cantidad, causa, id_lote_, fecha=None, **kwargs):
        super().__init__(**kwargs)
        if fecha:
            self.fecha = fecha
        self.cantidad = cantidad
        self.causa = causa
        self.id_lote_ = id_lote_


    def __repr__(self):
        return f'<Mortalidad {self.cantidad} en Lote {self.id_lote_}>'