from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import json
from sqlalchemy import or_


from models import db           
from models.lote import Lote    
from models.configuracion import Configuracion  
from models.variable import Variable
from models.etapa import Etapa
from models.mortalidad import Mortalidad
from models.jaula import Jaula
from models.asignacion import AsignacionJaula

main = Blueprint('main', __name__)

# --- RUTA DASHBOARD ---
@main.route('/')
def dashboard():
    return render_template('dashboard.html')

# --- RUTAS DE LOTES ---
@main.route('/lotes')
def lotes():
    search = request.args.get('search', '')
    query = Lote.query
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(Lote.proveedor.like(search_term), Lote.tipo_ave.like(search_term)))
    
    lista_lotes = query.order_by(Lote.fecha_ingreso.desc()).all()
    lista_jaulas = Jaula.query.order_by(Jaula.id_jaula_).all() 
    
    # Usamos saldo_actual (que ya resta la mortalidad) en lugar de cantidad_inicial
    total_aves = sum(l.saldo_actual for l in lista_lotes)
    activos = sum(1 for l in lista_lotes if l.estado_activo_cerrado == 1)
    cerrados = sum(1 for l in lista_lotes if l.estado_activo_cerrado == 0)

    return render_template('lotes.html', lotes=lista_lotes, jaulas=lista_jaulas,
                           total_aves=total_aves, activos=activos, cerrados=cerrados)

@main.route('/guardar_lote', methods=['POST'])
def guardar_lote():
    try:
        data = request.form
        id_lote = data.get('id_lote')
        
        # Preparar datos comunes
        datos_lote = {
            'fecha_ingreso': datetime.strptime(data['fecha_ingreso'], '%Y-%m-%d'),
            'cantidad_inicial': int(data['cantidad_inicial']),
            'edad_inicial': int(data.get('edad_inicial', 0)),
            'proveedor': data['proveedor'],
            'tipo_ave': data['tipo_ave'],
            'peso_inicial': float(data['peso_inicial']),
            'estado_activo_cerrado': 1 if data['estado_activo_cerrado'] == 'ACTIVO' else 0,
            'observaciones': data['observaciones'],
            'fecha_cierre': datetime.strptime(data['fecha_cierre'], '%Y-%m-%d') if data.get('fecha_cierre') else None,
            'id_usuario': 1
        }

        if id_lote:
            # EDITAR
            lote = Lote.query.get(id_lote)
            
            # LÓGICA AUTOMÁTICA: Si el lote se cierra (1 -> 0), liberar sus jaulas
            if lote.estado_activo_cerrado == 1 and datos_lote['estado_activo_cerrado'] == 0:
                for asignacion in lote.asignaciones:
                    asignacion.jaula.estado = 1 # 1 = Disponible

            for key, value in datos_lote.items():
                setattr(lote, key, value) 
        else:
            # CREAR
            nuevo_lote = Lote(**datos_lote)
            db.session.add(nuevo_lote)
            db.session.flush() # Generamos el ID del lote antes de hacer commit

            # --- DISTRIBUCIÓN BASADA EN SELECCIÓN DEL USUARIO ---
            # Obtenemos los IDs de las jaulas marcadas en el checkbox
            ids_seleccionados = request.form.getlist('jaulas_seleccionadas')
            
            # VALIDACIÓN ESTRICTA: Deben ser exactamente 4 jaulas
            if len(ids_seleccionados) != 4:
                # Nota: Idealmente deberíamos mostrar un error visual, pero por seguridad revertimos
                db.session.rollback()
                return redirect(url_for('main.lotes'))
            
            if ids_seleccionados and nuevo_lote.cantidad_inicial > 0:
                jaulas_seleccionadas = Jaula.query.filter(Jaula.id_jaula_.in_(ids_seleccionados)).all()
                aves_por_jaula = nuevo_lote.cantidad_inicial // 4 # División exacta entre 4
                sobra = nuevo_lote.cantidad_inicial % 4

                for i, jaula in enumerate(jaulas_seleccionadas):
                    # Si hay sobrante (ej: 10 aves en 3 jaulas), sumamos 1 a las primeras
                    cantidad_asignar = aves_por_jaula + (1 if i < sobra else 0)

                    nueva_asignacion = AsignacionJaula(
                        fecha_inicio=nuevo_lote.fecha_ingreso,
                        cantidad_aves=cantidad_asignar,
                        id_lote_=nuevo_lote.id_lote_,
                        id_jaula_=jaula.id_jaula_
                    )
                    db.session.add(nueva_asignacion)
                    
                    # Marcar jaula como Ocupada
                    jaula.estado = 0 

        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
        
    return redirect(url_for('main.lotes')) 

@main.route('/eliminar_lote/<int:id_lote>', methods=['POST'])
def eliminar_lote(id_lote):
    """Elimina un lote de manera segura (requiere POST)"""
    try:
        lote = Lote.query.get(id_lote)
        if lote:
            # 1. Liberar jaulas y eliminar asignaciones (para evitar error de llave foránea)
            for asignacion in lote.asignaciones:
                asignacion.jaula.estado = 1 # Liberar la jaula
                db.session.delete(asignacion)
            
            # 2. Eliminar historial de mortalidad asociado
            for mort in lote.mortalidades:
                db.session.delete(mort)
            
            # 3. Eliminar el lote
            db.session.delete(lote)
            db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
    return redirect(url_for('main.lotes'))

@main.route('/registrar_mortalidad', methods=['POST'])
def registrar_mortalidad():
    try:
        data = request.form
        nueva_baja = Mortalidad(
            id_lote_=int(data['id_lote']),
            fecha=datetime.strptime(data['fecha'], '%Y-%m-%d'),
            cantidad=int(data['cantidad']),
            causa=data['causa']
        )
        db.session.add(nueva_baja)
        db.session.commit()
    except Exception as e:
        print(f"Error registrando mortalidad: {e}")
    return redirect(url_for('main.lotes'))

# --- RUTAS DE JAULAS ---
@main.route('/jaulas')
def jaulas():
    lista_jaulas = Jaula.query.all()
    return render_template('jaulas.html', jaulas=lista_jaulas)

@main.route('/guardar_jaula', methods=['POST'])
def guardar_jaula():
    try:
        data = request.form
        nueva_jaula = Jaula(
            ubicacion=data['ubicacion'],
            estado=1 
        )
        db.session.add(nueva_jaula)
        db.session.commit()
    except Exception as e:
        print(f"Error: {e}")
    return redirect(url_for('main.lotes')) # Redirigimos a lotes para mantenernos en la misma pantalla

@main.route('/eliminar_jaula/<int:id_jaula>', methods=['POST'])
def eliminar_jaula(id_jaula):
    try:
        jaula = Jaula.query.get(id_jaula)
        if jaula:
            db.session.delete(jaula)
            db.session.commit()
    except Exception as e:
        print(f"Error al eliminar jaula: {e}")
    return redirect(url_for('main.lotes'))

# --- FUNCIÓN AUXILIAR PARA INICIALIZAR DATOS MAESTROS ---
def inicializar_datos_si_vacio():
    if not Variable.query.first():
        # 1. Crear Variables
        vars_data = [
            ('humedad', '%'), ('temperatura', '°C'), ('amonico', 'ppm'),
            ('iluminacion', 'lux'), ('comida', 'kg'), ('agua', 'L')
        ]
        for nombre, unidad in vars_data:
            db.session.add(Variable(nombre=nombre, unidad_medida=unidad))
        
        # 2. Crear Etapas
        etapas_data = ['pequeno', 'mediano', 'grande']
        for nombre in etapas_data:
            db.session.add(Etapa(nombre=nombre))
        
        db.session.commit()

        # 3. Crea Configuración por defecto (Cruzando Variables x Etapas)
        # Diccionario de valores por defecto (Variable -> Etapa -> (Min, Max))
        defaults = {
            'humedad': {'pequeno': (60, 70), 'mediano': (55, 65), 'grande': (50, 60)},
            'temperatura': {'pequeno': (32, 34), 'mediano': (21, 26), 'grande': (18, 24)},
            'amonico': {'pequeno': (0, 10), 'mediano': (10, 15), 'grande': (15, 20)},
            'iluminacion': {'pequeno': (30, 45), 'mediano': (15, 20), 'grande': (5, 10)},
            'comida': {'pequeno': (15, 30), 'mediano': (60, 90), 'grande': (110, 150)},
            'agua': {'pequeno': (30, 50), 'mediano': (120, 180), 'grande': (250, 300)}
        }

        # Obtener mapas de IDs
        map_vars = {v.nombre: v.id for v in Variable.query.all()}
        map_etapas = {e.nombre: e.id for e in Etapa.query.all()}

        for var_nom, etapas_dict in defaults.items():
            for etapa_nom, (v_min, v_max) in etapas_dict.items():
                if var_nom in map_vars and etapa_nom in map_etapas:
                    nuevo = Configuracion(
                        id_variable=map_vars[var_nom],
                        id_etapa=map_etapas[etapa_nom],
                        valor_min=v_min,
                        valor_max=v_max
                    )
                    db.session.add(nuevo)
        db.session.commit()

# --- OTRAS RUTAS ---
@main.route('/configuracion')
def configuracion():
    inicializar_datos_si_vacio()
    return render_template('configuracion.html')

# --- API DE CONFIGURACIÓN ---
@main.route('/api/obtener_configuracion')
def obtener_configuracion():
    inicializar_datos_si_vacio()
    
    # Join para traer los nombres
    configs = Configuracion.query.all()
    
    #diccionario anidado para el frontend
    resultado = {}
    for c in configs:
        var_nombre = c.variable.nombre
        etapa_nombre = c.etapa.nombre
        
        if var_nombre not in resultado:
            resultado[var_nombre] = {}
        
        resultado[var_nombre][etapa_nombre] = {
            'min': c.valor_min,
            'max': c.valor_max
        }
        
    return jsonify(resultado)

@main.route('/api/parametros_etapa/<etapa>')
def parametros_etapa(etapa):
    """Obtiene los parámetros de configuración para una etapa específica (pequeño, mediano, grande)"""
    etapa_obj = Etapa.query.filter_by(nombre=etapa).first()
    if not etapa_obj:
        return jsonify({})

    configs = Configuracion.query.filter_by(id_etapa=etapa_obj.id).all()
    
    # Construir diccionario con parámetros de esa etapa
    parametros = {}
    for c in configs:
        parametros[c.variable.nombre] = {
            'min': c.valor_min,
            'max': c.valor_max
        }
    
    return jsonify(parametros)

@main.route('/api/guardar_configuracion', methods=['POST'])
def guardar_configuracion():
    """Guarda la configuración recibida desde el frontend"""
    try:
        data = request.get_json()
        
        # Recorrer el JSON anidado
        for parametro, etapas in data.items():
            for etapa, valores in etapas.items():
                # Buscar el registro específico en la BD
                # Necesitamos los IDs primero
                var_obj = Variable.query.filter_by(nombre=parametro).first()
                etapa_obj = Etapa.query.filter_by(nombre=etapa).first()

                if var_obj and etapa_obj:
                    config_item = Configuracion.query.filter_by(
                        id_variable=var_obj.id, 
                        id_etapa=etapa_obj.id
                    ).first()
                
                    if config_item:
                        # Actualizar valores
                        config_item.valor_min = float(valores.get('min', 0))
                        config_item.valor_max = float(valores.get('max', 0))
                        config_item.fecha_actualizacion = datetime.now()

        db.session.commit()
        
        return jsonify({'success': True, 'mensaje': 'Configuración guardada correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@main.route('/reportes')
def reportes():
    return render_template('reportes.html')

@main.route('/pruebas')
def pruebas():
    return render_template('pruebas.html')