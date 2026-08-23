from .base import db
from datetime import datetime

class Configuracion(db.Model):
    __tablename__ = 'configuracion'

    id = db.Column(db.Integer, primary_key=True)
    
    # Claves foráneas hacia las tablas maestras
    id_variable = db.Column(db.Integer, db.ForeignKey('variable.id'), nullable=False)
    id_etapa = db.Column(db.Integer, db.ForeignKey('etapa.id'), nullable=False)
    
    valor_min = db.Column(db.Float, nullable=False)
    valor_max = db.Column(db.Float, nullable=False)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relaciones para acceder a los nombres fácilmente
    variable = db.relationship('Variable', backref='configuraciones')
    etapa = db.relationship('Etapa', backref='configuraciones')
