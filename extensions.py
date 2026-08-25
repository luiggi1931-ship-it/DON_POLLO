from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Instancia global, usamos memory:// explícitamente para quitar el warning de desarrollo
limiter = Limiter(key_func=get_remote_address, default_limits=[], storage_uri="memory://")

