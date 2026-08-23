import os
from dotenv import load_dotenv

load_dotenv()  # Carga las variables del archivo .env

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-insegura-cambiar')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:@localhost/granjadepollitos')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Seguridad de sesiones
    SESSION_COOKIE_HTTPONLY = True   # JS no puede leer la cookie
    SESSION_COOKIE_SAMESITE = 'Lax' # Protege contra CSRF básico
    PERMANENT_SESSION_LIFETIME = 3600  # Sesión expira en 1 hora