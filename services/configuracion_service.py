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
        'temperatura':  {'pequeno': (28, 34), 'mediano': (21, 25), 'grande': (18, 22)},
        'amonico':      {'pequeno': (0, 10),  'mediano': (0, 15),  'grande': (0, 20)},
        'iluminacion':  {'pequeno': (20, 40), 'mediano': (8, 15),  'grande': (5, 10)},
        'comida':       {'pequeno': (15, 35), 'mediano': (50, 90), 'grande': (100, 150)},
        'agua':         {'pequeno': (30, 60), 'mediano': (100, 180), 'grande': (200, 300)},
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
