from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from models.usuario import Usuario

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        password = request.form.get('password', '').strip()

        usuario = Usuario.query.filter_by(nombre=nombre).first()

        if usuario and usuario.check_password(password) and usuario.estado == 1:
            login_user(usuario)
            next_page = request.args.get('next')
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
