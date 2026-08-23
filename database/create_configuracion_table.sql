CREATE TABLE IF NOT EXISTS configuracion (
  id_configuracion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
  -- Humedad
  humedad_pequeno_min FLOAT DEFAULT 60,
  humedad_pequeno_max FLOAT DEFAULT 70,
  humedad_mediano_min FLOAT DEFAULT 55,
  humedad_mediano_max FLOAT DEFAULT 65,
  humedad_grande_min FLOAT DEFAULT 50,
  humedad_grande_max FLOAT DEFAULT 60,
  
  -- Temperatura
  temperatura_pequeno_min FLOAT DEFAULT 32,
  temperatura_pequeno_max FLOAT DEFAULT 34,
  temperatura_mediano_min FLOAT DEFAULT 21,
  temperatura_mediano_max FLOAT DEFAULT 26,
  temperatura_grande_min FLOAT DEFAULT 18,
  temperatura_grande_max FLOAT DEFAULT 24,
  
  -- Amónico
  amonico_pequeno_min FLOAT DEFAULT 0,
  amonico_pequeno_max FLOAT DEFAULT 10,
  amonico_mediano_min FLOAT DEFAULT 10,
  amonico_mediano_max FLOAT DEFAULT 15,
  amonico_grande_min FLOAT DEFAULT 15,
  amonico_grande_max FLOAT DEFAULT 20,
  
  -- Iluminación
  iluminacion_pequeno_min FLOAT DEFAULT 30,
  iluminacion_pequeno_max FLOAT DEFAULT 45,
  iluminacion_mediano_min FLOAT DEFAULT 15,
  iluminacion_mediano_max FLOAT DEFAULT 20,
  iluminacion_grande_min FLOAT DEFAULT 5,
  iluminacion_grande_max FLOAT DEFAULT 10,
  
  -- Comida
  comida_pequeno_min FLOAT DEFAULT 15,
  comida_pequeno_max FLOAT DEFAULT 30,
  comida_mediano_min FLOAT DEFAULT 60,
  comida_mediano_max FLOAT DEFAULT 90,
  comida_grande_min FLOAT DEFAULT 110,
  comida_grande_max FLOAT DEFAULT 150,
  
  -- Agua
  agua_pequeno_min FLOAT DEFAULT 30,
  agua_pequeno_max FLOAT DEFAULT 50,
  agua_mediano_min FLOAT DEFAULT 120,
  agua_mediano_max FLOAT DEFAULT 180,
  agua_grande_min FLOAT DEFAULT 250,
  agua_grande_max FLOAT DEFAULT 300,
  
  fecha_actualizacion DATETIME NULL
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar configuración por defecto
INSERT INTO configuracion (id_configuracion) VALUES (1);