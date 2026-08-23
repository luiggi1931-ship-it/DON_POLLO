"""
Servicio de configuración — inicialización y datos maestros.
"""
from models import db
from models.variable import Variable
from models.etapa import Etapa
from models.configuracion import Configuracion


def inicializar_datos_si_vacio():
    """
    Inicializa variables, etapas y configuración por defecto si la BD está vacía.
    Se llama al arrancar la vista de configuración.
    """
    if Variable.query.first():
        return  # Ya inicializado, salir rápido

    # 1. Crear Variables
    vars_data = [
        ('humedad', '%'), ('temperatura', '°C'), ('amonico', 'ppm'),
        ('iluminacion', 'lux'), ('comida', 'kg'), ('agua', 'L')
    ]
    for nombre, unidad in vars_data:
        db.session.add(Variable(nombre=nombre, unidad_medida=unidad))

    # 2. Crear Etapas
    for nombre in ['pequeno', 'mediano', 'grande']:
        db.session.add(Etapa(nombre=nombre))

    db.session.commit()

    # 3. Configuración por defecto (Variable × Etapa)
    defaults = {
        'humedad':      {'pequeno': (60, 70), 'mediano': (55, 65), 'grande': (50, 60)},
        'temperatura':  {'pequeno': (32, 34), 'mediano': (21, 26), 'grande': (18, 24)},
        'amonico':      {'pequeno': (0, 10),  'mediano': (10, 15), 'grande': (15, 20)},
        'iluminacion':  {'pequeno': (30, 45), 'mediano': (15, 20), 'grande': (5, 10)},
        'comida':       {'pequeno': (15, 30), 'mediano': (60, 90), 'grande': (110, 150)},
        'agua':         {'pequeno': (30, 50), 'mediano': (120, 180), 'grande': (250, 300)},
    }

    map_vars = {v.nombre: v.id for v in Variable.query.all()}
    map_etapas = {e.nombre: e.id for e in Etapa.query.all()}

    for var_nom, etapas_dict in defaults.items():
        for etapa_nom, (v_min, v_max) in etapas_dict.items():
            if var_nom in map_vars and etapa_nom in map_etapas:
                db.session.add(Configuracion(
                    id_variable=map_vars[var_nom],
                    id_etapa=map_etapas[etapa_nom],
                    valor_min=v_min,
                    valor_max=v_max
                ))
    db.session.commit()
