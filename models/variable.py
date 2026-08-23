from .base import db

class Variable(db.Model):
    __tablename__ = 'variable'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False) 
    unidad_medida = db.Column(db.String(20), nullable=False)       

    def __init__(self, nombre, unidad_medida, **kwargs):
        super().__init__(**kwargs)
        self.nombre = nombre
        self.unidad_medida = unidad_medida

    def __repr__(self):
        return f'<Variable {self.nombre}>'