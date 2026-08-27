from models import db
from datetime import datetime

class ConsumoAgua(db.Model):
    __tablename__ = 'consumo_agua'
    id_consumo_agua_ = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha = db.Column(db.Date, nullable=False, default=datetime.today)
    cantidad_litros = db.Column(db.Integer, nullable=False)
    origen_IOT_MANUAL = db.Column(db.String(150), nullable=False, default='MANUAL')
    id_lote_ = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)
