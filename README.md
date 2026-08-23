# Don Pollo 🐔

Sistema de gestión de lotes avícolas.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

---

## Cómo ejecutar el proyecto

### 1. Clonar / descomprimir el proyecto
Coloca la carpeta `DON_POLLO` en cualquier lugar de tu PC.

### 2. Crear el archivo de entorno para Docker
Dentro de la carpeta del proyecto, crea un archivo llamado `.env.docker` con este contenido:

```
SECRET_KEY=genera-una-clave-secreta-larga-aqui
DATABASE_URL=mysql+pymysql://root:tu_password@db/granjadepollitos
FLASK_ENV=production
FLASK_DEBUG=0
```

> ⚠️ Este archivo no se incluye en el ZIP por seguridad (está en `.gitignore`).

### 3. Levantar el sistema

```bash
docker-compose up --build -d
```

Esto levanta la base de datos MySQL **y** la aplicación Flask automáticamente.  
La primera vez tarda ~2 minutos (descarga de imágenes).

### 4. Abrir la aplicación

Ir a: **http://localhost:5000**

Credenciales por defecto:
- Usuario: `admin`
- Contraseña: `admin123`

---

## Comandos útiles

| Acción | Comando |
|---|---|
| Encender | `docker-compose up -d` |
| Apagar | `docker-compose down` |
| Ver logs | `docker logs donpollo-web -f` |
| Reconstruir tras cambios | `docker-compose up --build -d` |

---

## Estructura del proyecto

```
DON_POLLO/
├── models/          # Modelos de la base de datos
├── routes/          # Rutas y controladores
├── services/        # Lógica de negocio
├── static/          # CSS, JS, imágenes
├── templates/       # HTML (Jinja2)
├── app.py           # Punto de entrada
├── config.py        # Configuración de Flask
├── Dockerfile       # Imagen de la app
├── docker-compose.yml  # Orquestación BD + App
└── granjadepollitos.sql  # Datos iniciales de la BD
```
