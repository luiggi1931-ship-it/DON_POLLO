from models import db

class Inventario(db.Model):
    __tablename__ = 'inventario'
    id_inventario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_insumo = db.Column(db.String(150), nullable=False)
    tipo = db.Column(db.String(150), nullable=False)
    stock_actual = db.Column(db.Integer, nullable=False, default=0)
    unidad = db.Column(db.Integer, nullable=False, default=1)
    stock_minimo = db.Column(db.Integer, nullable=False, default=0)
    costo_unitario = db.Column(db.Float, nullable=False, default=0.0)
    
    movimientos = db.relationship('MovimientoInventario', backref='inventario_rel', lazy=True)
