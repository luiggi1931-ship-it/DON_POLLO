import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from models import db
from models.variable import Variable
from models.etapa import Etapa
from models.configuracion import Configuracion

defaults = {
    'humedad':      {'pequeno': (60, 70), 'mediano': (55, 65), 'grande': (50, 60)},
    'temperatura':  {'pequeno': (28, 34), 'mediano': (21, 25), 'grande': (18, 22)},
    'amonico':      {'pequeno': (0, 10),  'mediano': (0, 15),  'grande': (0, 20)},
    'iluminacion':  {'pequeno': (20, 40), 'mediano': (8, 15),  'grande': (5, 10)},
    'comida':       {'pequeno': (15, 35), 'mediano': (50, 90), 'grande': (100, 150)},
    'agua':         {'pequeno': (30, 60), 'mediano': (100, 180), 'grande': (200, 300)},
}

with app.app_context():
    map_vars = {v.nombre: v.id for v in Variable.query.all()}
    map_etapas = {e.nombre: e.id for e in Etapa.query.all()}

    for var_nom, etapas_dict in defaults.items():
        for etapa_nom, (v_min, v_max) in etapas_dict.items():
            if var_nom in map_vars and etapa_nom in map_etapas:
                config = Configuracion.query.filter_by(
                    id_variable=map_vars[var_nom],
                    id_etapa=map_etapas[etapa_nom]
                ).first()
                if config:
                    config.valor_min = v_min
                    config.valor_max = v_max
                    print(f"Updated {var_nom} - {etapa_nom}: {v_min} - {v_max}")
                else:
                    db.session.add(Configuracion(
                        id_variable=map_vars[var_nom],
                        id_etapa=map_etapas[etapa_nom],
                        valor_min=v_min,
                        valor_max=v_max
                    ))
                    print(f"Added {var_nom} - {etapa_nom}: {v_min} - {v_max}")
    
    db.session.commit()
    print("DB Configuration Update Complete.")
