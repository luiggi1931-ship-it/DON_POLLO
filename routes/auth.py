from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from urllib.parse import urlparse
from models.usuario import Usuario
from extensions import limiter

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['GET', 'POST'])
@limiter.limit('20 per minute')
def login():
    # Si ya está autenticado, redirigir al dashboard
    if current_user.is_authenticated:
        return redirect(url_for('general.dashboard'))

    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        password = request.form.get('password', '').strip()

        usuario = Usuario.query.filter_by(nombre=nombre).first()

        if usuario and usuario.check_password(password) and usuario.estado == 1:
            login_user(usuario)
            next_page = request.args.get('next')
            # Prevenir open redirect: solo permite rutas internas
            if next_page and urlparse(next_page).netloc:
                next_page = None
            return redirect(next_page or url_for('general.dashboard'))
        else:
            flash('Usuario o contraseña incorrectos.', 'error')

    return render_template('login.html')


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    flash('Sesión cerrada correctamente.', 'success')
    return redirect(url_for('auth.login'))
