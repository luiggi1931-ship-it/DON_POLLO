# 🐔 Diagnóstico de Arquitectura — DON_POLLO

## Resumen Ejecutivo

Flask MVC monolítico para gestión de una granja avícola. El proyecto tiene una base sólida pero presenta deuda técnica crítica de seguridad y acoplamiento fuerte que limitará su escalabilidad.

---

## Mapa de Arquitectura Actual

```
DON_POLLO/
├── app.py               # Entry point (Factory Pattern incompleto)
├── config.py            # Configuración (credenciales hardcoded ⚠️)
├── routes.py            # UN solo archivo con TODA la lógica (God File 🚨)
├── models/              # ORM SQLAlchemy — Bien estructurado ✅
│   ├── lote.py          # Modelo central con propiedades calculadas
│   ├── usuario.py       # Hash de contraseñas con werkzeug ✅
│   ├── configuracion.py # Tabla cruzada Variable × Etapa
│   ├── jaula.py, mortalidad.py, asignacion.py...
│   └── [12 archivos vacíos sin implementar 🚧]
├── services/            # Directorio VACÍO — capa de servicio ausente 🚨
├── templates/           # Jinja2: 6 templates (reportes/pruebas sin contenido)
├── static/              # CSS, JS, img, música
└── database/            # Scripts SQL de migración manual
```

---

## Patrones Identificados

| Capa | Patrón | Estado |
|------|--------|--------|
| Entry point | Application Factory (parcial) | ⚠️ Incompleto — `db.create_all()` solo en `__main__` |
| Routing | Blueprint único `main` | 🚨 Monolítico, sin separación por dominio |
| Datos | SQLAlchemy ORM + MySQL | ✅ Correcto |
| Lógica de negocio | Embebida en routes | 🚨 Viola SRP |
| Autenticación | Modelo implementado, sin uso | 🚨 Sin Flask-Login ni sesiones |
| Migraciones | Scripts SQL manuales | ⚠️ Sin Flask-Migrate/Alembic |
| Tests | Ninguno | 🚨 Cero cobertura |

---

## 🚨 Problemas Críticos

### 1. Seguridad — ALTA PRIORIDAD

```python
# config.py — EXPUESTO en Git
SECRET_KEY = 'granja_pollitos_super_secreta_clave_2026'  # ← Hardcoded
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/granjadepollitos'  # ← Sin contraseña, root
```
**Fix:** Variables de entorno con `python-dotenv` + archivo `.env` en `.gitignore`.

### 2. Sin Autenticación Funcional
El modelo `Usuario` existe con hash de contraseñas, pero **ninguna ruta está protegida**. El campo `id_usuario` está hardcodeado como `1` en `guardar_lote`. Cualquier usuario puede acceder a todo.

```python
# routes.py:61 — Usuario hardcodeado
'id_usuario': 1
```

### 3. `routes.py` — God File (322 líneas, seguirá creciendo)
Todo el proyecto cabe en un solo Blueprint. No hay capa de servicios. La lógica de negocio (distribución de aves en jaulas, cálculo de saldos, inicialización de datos maestros) está mezclada con el routing HTTP.

### 4. N+1 Query Problem en `saldo_actual`
```python
# models/lote.py:30 — Se llama en un loop en routes.py:37
@property
def saldo_actual(self):
    total_muertes = sum(m.cantidad for m in self.mortalidades)  # ← lazy load por cada lote
```
Cuando `/lotes` carga todos los lotes, dispara una query extra por cada uno.

### 5. Manejo de errores silencioso
```python
except Exception as e:
    db.session.rollback()
    print(f"Error: {e}")   # ← Solo consola, sin feedback al usuario
return redirect(url_for('main.lotes'))  # Siempre redirige como si fuera OK
```
El usuario nunca sabe si algo falló.

### 6. Validación solo en frontend
La regla "exactamente 4 jaulas" se valida en JS **y** en el backend, pero el manejo del fallo solo hace `rollback + redirect` sin mensaje de error.

---

## ⚠️ Problemas Moderados

- **12 modelos vacíos** (`sensor.py`, `vacuna.py`, `inventario.py`, etc.) — esquema SQL más avanzado que el código Python
- **`services/` vacío** — la intención arquitectónica existe pero no se ejecutó
- **Sin paginación** en `/lotes` — con volumen alto, carga todo en memoria
- **`Lote.query.get(id)` deprecado** en SQLAlchemy 2.x → usar `db.session.get(Lote, id)`
- **`mortalidad_porcentaje`** recalcula `sum` cuando ya lo hace `saldo_actual` — duplicación
- **Templates `reportes.html` y `pruebas.html`** son stubs de ~300 bytes sin funcionalidad

---

## ✅ Fortalezas del Proyecto

- **Separación models/routes** — base MVC presente
- **Propiedades calculadas en el modelo** (`edad_dias`, `saldo_actual`, `mortalidad_porcentaje`) — buena encapsulación de lógica de dominio
- **Werkzeug para hash** — buena decisión de seguridad para contraseñas
- **Blueprint** — estructura modular lista para expandir
- **Lógica de distribución de jaulas** — algoritmo de división con sobrante correcto
- **`db.session.flush()`** antes de crear asignaciones — manejo correcto de IDs temporales

---

## Hoja de Ruta Recomendada

### Fase 1 — Seguridad (Inmediato)
1. `python-dotenv` + `.env` → mover `SECRET_KEY` y `DATABASE_URI`
2. `Flask-Login` → proteger todas las rutas con `@login_required`
3. Implementar ruta `/login` y `/logout`

### Fase 2 — Calidad (Corto plazo)
4. Dividir `routes.py` en Blueprints por dominio: `lotes_bp`, `configuracion_bp`, `reportes_bp`
5. Crear capa `services/` — extraer lógica de negocio de routes
6. `Flask-Migrate` (Alembic) → gestión de migraciones versionadas
7. Flash messages para feedback de errores al usuario

### Fase 3 — Escalabilidad (Mediano plazo)
8. Eager loading en consulta de lotes (`joinedload`) para resolver N+1
9. Paginación en `/lotes`
10. Implementar modelos pendientes (`sensor`, `vacuna`, `inventario`)
11. Tests unitarios para modelos y servicios

---

## Stack Actual vs Recomendado

| Componente | Actual | Recomendado |
|---|---|---|
| Config | Hardcoded | `python-dotenv` + `.env` |
| Auth | Sin implementar | `Flask-Login` |
| Migraciones | SQL manual | `Flask-Migrate` |
| Errores | `print()` | `Flask.flash()` + logging |
| Tests | Ninguno | `pytest` + `pytest-flask` |
| Queries N+1 | Lazy load | `joinedload` / `selectinload` |
