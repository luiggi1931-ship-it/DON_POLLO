from flask import Flask
from flask_login import LoginManager
from config import Config
from models import db, login_manager
from extensions import limiter

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
    limiter.init_app(app)
    login_manager.init_app(app)

    # Registrar Blueprints
    from routes.auth import auth_bp
    from routes.general import general_bp
    from routes.lotes import lotes_bp
    from routes.configuracion import configuracion_bp
    from routes.usuarios import usuarios_bp
    from routes.telemetria import telemetria_bp
    from routes.reportes import reportes_bp
    from routes.exportacion import exportacion_bp
    from routes.ventas import ventas_bp

    app.register_blueprint(general_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(lotes_bp)
    app.register_blueprint(configuracion_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(telemetria_bp)
    app.register_blueprint(reportes_bp)
    app.register_blueprint(exportacion_bp)
    app.register_blueprint(ventas_bp)

    @app.after_request
    def add_cache_control(response):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response

    @app.errorhandler(404)
    def not_found_error(error):
        from flask import request, jsonify, render_template
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Not found'}), 404
        return "404 No Encontrado", 404

    @app.errorhandler(Exception)
    def internal_error(error):
        from flask import request, jsonify
        import traceback
        if request.path.startswith('/api/'):
            # En producción, no mostrar el traceback real
            return jsonify({'error': 'Error interno del servidor', 'message': str(error)}), 500
        return f"500 Error Interno: {str(error)}", 500

    return app


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    _seed_admin(app)
    app.run(debug=True)