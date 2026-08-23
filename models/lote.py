from .base import db
from datetime import date

class Lote(db.Model):
    __tablename__ = 'lote'  

    id_lote_ = db.Column('id_lote_', db.Integer, primary_key=True)
    fecha_ingreso = db.Column(db.Date, nullable=False)
    cantidad_inicial = db.Column(db.Integer, nullable=False)
    edad_inicial = db.Column(db.Integer, nullable=False, default=0) 
    proveedor = db.Column(db.String(150), nullable=False)
    tipo_ave = db.Column(db.String(150), nullable=False)
    peso_inicial = db.Column(db.Float, nullable=False)
    estado_activo_cerrado = db.Column(db.Integer, nullable=False)  # 1=activo, 0=cerrado
    fecha_cierre = db.Column(db.Date, nullable=True)  # NULL cuando lote está activo
    observaciones = db.Column(db.String(150), nullable=True)
    id_usuario = db.Column(db.Integer, nullable=False)

    # Relación con Mortalidad 
    mortalidades = db.relationship('Mortalidad', backref='lote', lazy=True)

    def __init__(self, fecha_ingreso, cantidad_inicial, proveedor, tipo_ave, peso_inicial, estado_activo_cerrado, id_usuario, edad_inicial=0, fecha_cierre=None, observaciones=None, **kwargs):
        super().__init__(**kwargs)
        self.fecha_ingreso = fecha_ingreso
        self.cantidad_inicial = cantidad_inicial
        self.edad_inicial = edad_inicial
        self.proveedor = proveedor
        self.tipo_ave = tipo_ave
        self.peso_inicial = peso_inicial
        self.estado_activo_cerrado = estado_activo_cerrado
        self.fecha_cierre = fecha_cierre
        self.observaciones = observaciones
        self.id_usuario = id_usuario


    @property
    def edad_dias(self):
        fin = self.fecha_cierre if self.fecha_cierre else date.today()
        delta = fin - self.fecha_ingreso
        return delta.days + self.edad_inicial

    @property
    def saldo_actual(self):
        total_muertes = sum(m.cantidad for m in self.mortalidades)
        return self.cantidad_inicial - total_muertes

    @property
    def mortalidad_porcentaje(self):
        """Calcula el porcentaje de mortalidad acumulada"""
        if self.cantidad_inicial == 0:
            return 0.0
        bajas = sum(m.cantidad for m in self.mortalidades)
        pct = (bajas / self.cantidad_inicial) * 100
        return round(pct, 2)

    def __repr__(self):
        return f'<Lote {self.id_lote_}>'