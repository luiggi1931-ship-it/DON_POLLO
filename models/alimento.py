from models import db

class Alimento(db.Model):
    __tablename__ = 'alimento'
    id_alimento_ = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(150), nullable=False)
    tipo_ = db.Column(db.String(150), nullable=False)
    costo_unitario = db.Column(db.Integer, nullable=False)
    unidad_medida = db.Column(db.Integer, nullable=False)
