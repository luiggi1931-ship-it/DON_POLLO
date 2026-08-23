-- Insertar usuario de prueba para las pruebas
-- Ejecutar en phpMyAdmin o terminal MySQL

INSERT INTO usuario (id_usuario, nombre, correo, contrasenia_hash, rol_ADMIN_OPERADOR_TECNICO, estado_activo_inactivo, fecha_creacion) 
VALUES (1, 'Admin Pollo', 'admin@granja.com', 'hash_temporal_123', 'ADMIN', 1, CURDATE());
