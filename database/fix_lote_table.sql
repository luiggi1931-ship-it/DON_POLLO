-- Script para corregir la tabla lote en XAMPP
-- Ejecutar en phpmyadmin o en la terminal de MySQL

-- Modificar la columna fecha_cierre para que sea nullable
ALTER TABLE lote MODIFY COLUMN fecha_cierre date NULL;

-- Modificar la columna observaciones para que sea nullable
ALTER TABLE lote MODIFY COLUMN observaciones varchar(150) NULL;
