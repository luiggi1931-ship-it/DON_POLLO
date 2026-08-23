from .base import db

class Jaula(db.Model):
    __tablename__ = 'jaula'

    id_jaula_ = db.Column(db.Integer, primary_key=True)
    ubicacion = db.Column(db.String(150), nullable=False)
    tipo_jaula = db.Column(db.String(20), nullable=False, default='mediano')  # pequeño | mediano | grande
    estado = db.Column(db.Integer, nullable=False)  # 1=Disponible, 0=Ocupada
    metros_cuadrados = db.Column(db.Numeric(10, 2), nullable=True)
    fecha_creacion = db.Column(db.Date, nullable=True)

    def __init__(self, ubicacion, estado, tipo_jaula='mediano', metros_cuadrados=None, fecha_creacion=None, **kwargs):
        super().__init__(**kwargs)
        self.ubicacion = ubicacion
        self.tipo_jaula = tipo_jaula
        self.estado = estado
        self.metros_cuadrados = metros_cuadrados
        self.fecha_creacion = fecha_creacion


    @property
    def lote_actual(self):
        for asignacion in self.asignaciones:
            if asignacion.lote and asignacion.lote.estado_activo_cerrado == 1:
                return asignacion.lote
        return None

    def __repr__(self):
        return f'<Jaula {self.ubicacion}>'