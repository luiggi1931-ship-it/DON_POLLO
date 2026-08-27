from models import db
from datetime import datetime

class ConsumoAlimento(db.Model):
    __tablename__ = 'consumo_alimento'
    id_consumo_ = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha = db.Column(db.Date, nullable=False, default=datetime.today)
    cantidad = db.Column(db.Integer, nullable=False)
    id_lote_ = db.Column(db.Integer, db.ForeignKey('lote.id_lote_'), nullable=False)
    id_alimento_ = db.Column(db.Integer, db.ForeignKey('alimento.id_alimento_'), nullable=True)
