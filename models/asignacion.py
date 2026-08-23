from .base import db

class AsignacionJaula(db.Model):
    __tablename__ = 'asignacion_jaula'

    id_asignacion_ = db.Column(db.Integer, primary_key=True)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=True)
    cantidad_aves = db.Column(db.Integer, nullable=False)
    
    id_lote_ = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)
    id_jaula_ = db.Column(db.Integer, db.ForeignKey('jaula.id_jaula_'), nullable=False)

    # Relaciones
    jaula = db.relationship('Jaula', backref='asignaciones')
    lote = db.relationship('Lote', backref='asignaciones')

    def __init__(self, fecha_inicio, cantidad_aves, id_lote_, id_jaula_, fecha_fin=None, **kwargs):
        super().__init__(**kwargs)
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.cantidad_aves = cantidad_aves
        self.id_lote_ = id_lote_
        self.id_jaula_ = id_jaula_

    def __repr__(self):
        return f'<Asignacion {self.cantidad_aves} aves en Jaula {self.id_jaula_}>'