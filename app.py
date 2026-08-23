from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from config import Config
from models import db, login_manager

migrate = Migrate()


def _seed_admin(app):
    """Crea el usuario admin por defecto si no existe."""
    from models.usuario import Usuario
    from datetime import date
    with app.app_context():
        if not Usuario.query.filter_by(nombre='admin').first():
            admin = Usuario(
                nombre='admin',
                correo='admin@donpollo.local',
                rol='ADMIN',
                estado=1,
                fecha_creacion=date.today()
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('[OK] Usuario admin creado: admin / admin123')


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Registrar Blueprints
    from routes.auth import auth_bp
    from routes.general import general_bp
    from routes.lotes import lotes_bp
    from routes.configuracion import configuracion_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(general_bp)
    app.register_blueprint(lotes_bp)
    app.register_blueprint(configuracion_bp)

    return app


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    _seed_admin(app)
    app.run(debug=True)