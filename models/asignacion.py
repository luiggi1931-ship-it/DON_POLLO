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

    def __repr__(self):
        return f'<Asignacion {self.cantidad_aves} aves en Jaula {self.id_jaula_}>'