from .base import db

class Etapa(db.Model):
    __tablename__ = 'etapa'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False) # Ej: 'pequeno'
    descripcion = db.Column(db.String(100), nullable=True)

    def __init__(self, nombre, descripcion=None, **kwargs):
        super().__init__(**kwargs)
        self.nombre = nombre
        self.descripcion = descripcion

    def __repr__(self):
        return f'<Etapa {self.nombre}>'