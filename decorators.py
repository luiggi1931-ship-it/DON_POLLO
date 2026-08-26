from functools import wraps
from flask import flash, redirect, url_for, request, jsonify
from flask_login import current_user

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.rol != 'ADMIN':
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'success': False, 'error': 'Permiso denegado. Se requiere rol de Administrador.'}), 403
            flash('No tienes permisos para acceder a esta sección.', 'danger')
            return redirect(url_for('general.dashboard'))
        return f(*args, **kwargs)
    return decorated_function
