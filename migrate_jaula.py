from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        db.session.execute(text(
            "ALTER TABLE jaula ADD COLUMN tipo_jaula VARCHAR(20) NOT NULL DEFAULT 'mediano' AFTER ubicacion"
        ))
        db.session.commit()
        print("OK: columna tipo_jaula agregada.")
    except Exception as e:
        print(f"ERROR: {e}")
