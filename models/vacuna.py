from models.base import db

class Vacuna(db.Model):
    __tablename__ = 'vacunas'

    id_vacuna = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.String(250), nullable=True)
    enfermedad_objetivo = db.Column(db.String(150), nullable=False) # ej: Newcastle, Gumboro
    via_administracion = db.Column(db.String(100), nullable=False) # ej: Agua, Ocular, Inyección
    dias_aplicacion_recomendado = db.Column(db.Integer, nullable=False) # Día de vida del ave en que debe aplicarse
    
    def __init__(self, nombre, enfermedad_objetivo, via_administracion, dias_aplicacion_recomendado, descripcion=None, **kwargs):
        super().__init__(**kwargs)
        self.nombre = nombre
        self.enfermedad_objetivo = enfermedad_objetivo
        self.via_administracion = via_administracion
        self.dias_aplicacion_recomendado = dias_aplicacion_recomendado
        self.descripcion = descripcion

    def to_dict(self):
        return {
            'id_vacuna': self.id_vacuna,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'enfermedad_objetivo': self.enfermedad_objetivo,
            'via_administracion': self.via_administracion,
            'dias_aplicacion_recomendado': self.dias_aplicacion_recomendado
        }
