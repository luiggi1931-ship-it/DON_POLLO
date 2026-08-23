from .base import db

# Importamos los modelos aquí para que SQLAlchemy los registre

from .lote import Lote
from .configuracion import Configuracion
from .variable import Variable
from .etapa import Etapa
from .mortalidad import Mortalidad
from .usuario import Usuario
from .jaula import Jaula
from .asignacion import AsignacionJaula