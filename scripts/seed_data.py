import os
import sys
import random
from datetime import date, timedelta

# Agregar el directorio raíz al path para importar la app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from models import db
from models.jaula import Jaula
from models.lote import Lote
from models.asignacion import AsignacionJaula
from models.mortalidad import Mortalidad

app = create_app()

def clear_data():
    print("[1] Eliminando datos anteriores...")
    Mortalidad.query.delete()
    AsignacionJaula.query.delete()
    Lote.query.delete()
    Jaula.query.delete()
    db.session.commit()
    print("    - Datos eliminados correctamente.")

def seed_jaulas():
    print("[2] Construyendo infraestructura física (Jaulas)...")
    tipos = ['pequeño', 'mediano', 'grande']
    jaulas_creadas = 0
    # 5 Galpones, 3 Niveles por galpón, 8 Filas por nivel = 24 jaulas por galpón -> 120 jaulas
    for g in range(1, 6):
        # Asignar un tipo de jaula por galpón para tener orden
        tipo = 'pequeño' if g == 1 else ('mediano' if g in [2, 3] else 'grande')
        
        for n in range(1, 4):
            for f in range(1, 9):
                ubicacion = f"G{g}-F{f}-N{n}"
                j = Jaula(
                    ubicacion=ubicacion,
                    estado=1, # 1 = Disponible
                    tipo_jaula=tipo,
                    metros_cuadrados=random.uniform(10.0, 20.0),
                    fecha_creacion=date.today() - timedelta(days=365)
                )
                db.session.add(j)
                jaulas_creadas += 1
                
    db.session.commit()
    print(f"    - {jaulas_creadas} jaulas creadas.")

def seed_lotes():
    print("[3] Generando historial de Lotes y simulando actividad...")
    
    proveedores = ['Avícola San Juan', 'Genética Premium', 'Pollos El Rey', 'Granja La Esperanza']
    tipos_ave = ['Broiler Cobb 500', 'Broiler Ross 308', 'Gallina Ponedora']
    
    lotes_creados = 0
    hoy = date.today()
    
    # Obtener todas las jaulas para la asignación
    jaulas = Jaula.query.all()
    
    # 100 lotes (70 históricos cerrados, 30 activos recientes)
    for i in range(100):
        # Es histórico?
        is_historic = i < 70
        
        if is_historic:
            # Hace de 300 a 40 días
            dias_ingreso = random.randint(40, 300)
            fecha_in = hoy - timedelta(days=dias_ingreso)
            # Vivió unos 35-45 días
            dias_vividos = random.randint(35, 45)
            fecha_out = fecha_in + timedelta(days=dias_vividos)
            estado = 0
        else:
            # Hace de 1 a 35 días
            dias_ingreso = random.randint(1, 35)
            fecha_in = hoy - timedelta(days=dias_ingreso)
            fecha_out = None
            estado = 1
            
        cantidad = random.randint(1500, 3000)
        
        lote = Lote(
            fecha_ingreso=fecha_in,
            cantidad_inicial=cantidad,
            edad_inicial=1,
            proveedor=random.choice(proveedores),
            tipo_ave=random.choice(tipos_ave),
            peso_inicial=random.uniform(40.0, 50.0),
            estado_activo_cerrado=estado,
            fecha_cierre=fecha_out,
            observaciones=f"Lote generado #{i+1}",
            id_usuario=1 # Asume admin user
        )
        db.session.add(lote)
        db.session.flush() # Para obtener ID
        
        # Asignar a 2 o 4 jaulas disponibles (sólo si está activo, o histórico simulamos que ocupó)
        # Para simplificar, los históricos no bloquean jaulas (estado jaula es disponible)
        if estado == 1:
            jaulas_disponibles = [j for j in jaulas if j.estado == 1]
            num_jaulas = random.choice([2, 4])
            if len(jaulas_disponibles) >= num_jaulas:
                seleccionadas = random.sample(jaulas_disponibles, num_jaulas)
                aves_per_jaula = cantidad // num_jaulas
                
                for j in seleccionadas:
                    asig = AsignacionJaula(
                        id_lote_=lote.id_lote_,
                        id_jaula_=j.id_jaula_,
                        fecha_inicio=fecha_in,
                        fecha_fin=fecha_out if estado == 0 else None,
                        cantidad_aves=aves_per_jaula
                    )
                    db.session.add(asig)
                    j.estado = 0 # Ocupar jaula
                    
        # Simular Mortalidad
        dias_a_simular = (fecha_out - fecha_in).days if estado == 0 else (hoy - fecha_in).days
        if dias_a_simular > 0:
            for d in range(1, dias_a_simular + 1):
                # Probabilidad de muerte diaria baja
                if random.random() < 0.4:
                    m = Mortalidad(
                        id_lote_=lote.id_lote_,
                        fecha=fecha_in + timedelta(days=d),
                        cantidad=random.randint(1, 5),
                        causa=random.choice(['Natural', 'Enfermedad', 'Desconocida', 'Accidente'])
                    )
                    db.session.add(m)
        
        lotes_creados += 1
        
    db.session.commit()
    print(f"    - {lotes_creados} lotes creados y asignados.")

if __name__ == '__main__':
    with app.app_context():
        print("Iniciando sembrado de datos en la granja...")
        clear_data()
        seed_jaulas()
        seed_lotes()
        print("[¡COMPLETADO!] Los datos hiper-realistas han sido inyectados.")
