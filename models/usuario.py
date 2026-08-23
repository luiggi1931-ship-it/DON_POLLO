from .base import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    __tablename__ = 'usuario'

    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(150), nullable=False)
    contrasenia_hash = db.Column(db.String(150), nullable=False) 
    rol = db.Column('rol_ADMIN_OPERADOR_TECNICO', db.String(150), nullable=False) 
    estado = db.Column('estado_activo_inactivo', db.Integer, nullable=False) 
    fecha_creacion = db.Column(db.Date, nullable=False)

    def set_password(self, password):
        self.contrasenia_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.contrasenia_hash, password)