from models import db
from datetime import datetime

class MovimientoInventario(db.Model):
    __tablename__ = 'movimiento_inventario'
    id_movimiento_ = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tipo_entrada_salida = db.Column(db.String(150), nullable=False) # 'Entrada' o 'Salida'
    cantidad = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.Date, nullable=False, default=datetime.today)
    motivo = db.Column(db.String(150), nullable=False)
    id_inventario = db.Column(db.Integer, db.ForeignKey('inventario.id_inventario'), nullable=False)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario'), nullable=True)
