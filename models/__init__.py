from .base import db
from flask_login import LoginManager

login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Inicia sesión para acceder.'
login_manager.login_message_category = 'error'

# Importamos los modelos para que SQLAlchemy los registre
from .lote import Lote
from .configuracion import Configuracion
from .variable import Variable
from .etapa import Etapa
from .mortalidad import Mortalidad
from .usuario import Usuario
from .jaula import Jaula
from .asignacion import AsignacionJaula
from .alerta import Alerta
from .lectura_sensor import LecturaSensor
from .vacuna import Vacuna
from .vacunacion import Vacunacion
from .venta import Venta
from .gasto import Gasto


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Usuario, int(user_id))
from .inventario import Inventario
from .movimiento_inventario import MovimientoInventario
from .consumo_agua import ConsumoAgua
from .consumo_alimento import ConsumoAlimento
from .alimento import Alimento
