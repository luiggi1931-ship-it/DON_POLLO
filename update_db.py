from app import app
from models import db
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE jaula ADD COLUMN metros_cuadrados DECIMAL(10,2) DEFAULT NULL;"))
        db.session.execute(text("ALTER TABLE jaula ADD COLUMN fecha_creacion DATE DEFAULT NULL;"))
        db.session.commit()
        print("Columnas agregadas con éxito.")
    except Exception as e:
        print(f"Error o columnas ya existen: {e}")
