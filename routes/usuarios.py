from flask import Blueprint, request, jsonify
from flask_login import login_required
from datetime import date
from models import db
from models.usuario import Usuario
from decorators import admin_required

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/api/usuarios', methods=['GET'])
@login_required
@admin_required
def get_usuarios():
    usuarios = Usuario.query.all()
    lista = []
    for u in usuarios:
        lista.append({
            'id': u.id_usuario,
            'nombre': u.nombre,
            'correo': u.correo,
            'rol': u.rol,
            'estado': u.estado,
            'fecha_creacion': u.fecha_creacion.strftime('%Y-%m-%d')
        })
    return jsonify(lista)

@usuarios_bp.route('/api/usuarios', methods=['POST'])
@login_required
@admin_required
def crear_usuario():
    data = request.get_json()
    nombre = data.get('nombre')
    correo = data.get('correo')
    rol = data.get('rol')
    password = data.get('password')

    if not nombre or not password or not rol:
        return jsonify({'success': False, 'error': 'Faltan datos obligatorios'}), 400

    if ' ' in nombre:
        return jsonify({'success': False, 'error': 'El nombre de usuario no puede contener espacios.'}), 400

    existente = Usuario.query.filter_by(nombre=nombre).first()
    if existente:
        return jsonify({'success': False, 'error': 'El nombre de usuario ya existe'}), 400

    nuevo = Usuario(
        nombre=nombre,
        correo=correo or f"{nombre}@donpollo.local",
        rol=rol,
        estado=1,
        fecha_creacion=date.today()
    )
    nuevo.set_password(password)
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({'success': True, 'mensaje': 'Usuario creado correctamente'})

@usuarios_bp.route('/api/usuarios/<int:id_usuario>', methods=['DELETE'])
@login_required
@admin_required
def eliminar_usuario(id_usuario):
    # Evitar borrar al propio admin actual o al único admin
    if id_usuario == 1:
        return jsonify({'success': False, 'error': 'No se puede eliminar al Administrador principal'}), 403
    
    usuario = db.session.get(Usuario, id_usuario)
    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Usuario eliminado'})
    return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404

@usuarios_bp.route('/api/usuarios/<int:id_usuario>', methods=['PUT'])
@login_required
@admin_required
def editar_usuario(id_usuario):
    data = request.get_json()
    new_password = data.get('password')
    nuevo_rol = data.get('rol')
    nuevo_nombre = data.get('nombre')
    nuevo_correo = data.get('correo')
    
    usuario = db.session.get(Usuario, id_usuario)
    if usuario:
        if nuevo_nombre:
            if ' ' in nuevo_nombre:
                return jsonify({'success': False, 'error': 'El nombre de usuario no puede contener espacios.'}), 400
                
            # Validar que no exista otro con ese nombre
            existente = Usuario.query.filter(Usuario.nombre == nuevo_nombre, Usuario.id_usuario != id_usuario).first()
            if existente:
                return jsonify({'success': False, 'error': 'El nombre de usuario ya existe'}), 400
            usuario.nombre = nuevo_nombre
            
        if nuevo_rol:
            usuario.rol = nuevo_rol
            
        if nuevo_correo is not None:
            usuario.correo = nuevo_correo
            
        if new_password:
            usuario.set_password(new_password)
            
        db.session.commit()
        return jsonify({'success': True, 'mensaje': 'Usuario actualizado correctamente'})
    return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
