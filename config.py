import os

class Config:
    
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/granjadepollitos'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'granja_pollitos_super_secreta_clave_2026'