import time
import random
from app import create_app, db
from models.lote import Lote
from models.lectura_sensor import LecturaSensor

def simular_datos():
    app = create_app()
    with app.app_context():
        print("[Simulador IoT] Iniciando generación de telemetría...")
        while True:
            # Buscar lotes activos
            lotes_activos = Lote.query.filter_by(estado_activo_cerrado=1).all()
            for lote in lotes_activos:
                # Generar valores aleatorios realistas
                # Temp: 20-35 C, Humedad: 40-70%, Amoniaco: 0-25 ppm
                # Agua y alimento: acumulados que van subiendo poco a poco
                
                # Obtener última lectura para acumular agua y alimento
                ultima = LecturaSensor.query.filter_by(id_lote=lote.id_lote_).order_by(LecturaSensor.id_lectura.desc()).first()
                
                agua_base = ultima.agua if ultima else 0.0
                alimento_base = ultima.alimento if ultima else 0.0

                lectura = LecturaSensor(
                    id_lote=lote.id_lote_,
                    temperatura=round(random.uniform(10.0, 40.0), 1),
                    humedad=round(random.uniform(40.0, 80.0), 1),
                    amoniaco=round(random.uniform(5.0, 30.0), 1),
                    iluminacion=round(random.uniform(5.0, 50.0), 1),
                    agua=round(agua_base + random.uniform(0.1, 1.0), 2),
                    alimento=round(alimento_base + random.uniform(0.5, 2.0), 2)
                )
                db.session.add(lectura)
            
            if lotes_activos:
                db.session.commit()
                print(f"[Simulador IoT] {len(lotes_activos)} lotes actualizados.")
            
            # Esperar 5 segundos antes de generar más datos
            time.sleep(5)

if __name__ == '__main__':
    simular_datos()
