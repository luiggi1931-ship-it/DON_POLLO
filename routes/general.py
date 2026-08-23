from flask import Blueprint, render_template
from flask_login import login_required

general_bp = Blueprint('general', __name__)


@general_bp.route('/')
@login_required
def dashboard():
    return render_template('dashboard.html')


@general_bp.route('/reportes')
@login_required
def reportes():
    return render_template('reportes.html')


@general_bp.route('/pruebas')
@login_required
def pruebas():
    return render_template('pruebas.html')
