-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-03-2026 a las 02:14:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `granjadepollitos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alimento`
--

CREATE TABLE `alimento` (
  `id_alimento_` int(11) NOT NULL,
  `nombre` char(150) NOT NULL,
  `tipo_` char(150) NOT NULL,
  `costo_unitario` int(11) NOT NULL,
  `unidad_medida` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_jaula`
--

CREATE TABLE `asignacion_jaula` (
  `id_asignacion_` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `cantidad_aves` int(11) NOT NULL,
  `id_lote_` int(11) NOT NULL,
  `id_jaula_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignacion_jaula`
--

INSERT INTO `asignacion_jaula` (`id_asignacion_`, `fecha_inicio`, `fecha_fin`, `cantidad_aves`, `id_lote_`, `id_jaula_`) VALUES
(1, '2026-03-11', NULL, 200, 3, 1),
(2, '2026-03-11', NULL, 200, 3, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `id_variable` int(11) NOT NULL,
  `id_etapa` int(11) NOT NULL,
  `valor_min` float NOT NULL,
  `valor_max` float NOT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `id_variable`, `id_etapa`, `valor_min`, `valor_max`, `fecha_actualizacion`) VALUES
(1, 1, 1, 60, 70, '2026-03-01 13:37:09'),
(2, 1, 2, 55, 65, '2026-03-01 13:37:09'),
(3, 1, 3, 50, 60, '2026-03-01 13:37:09'),
(4, 2, 1, 32, 34, '2026-03-01 13:37:09'),
(5, 2, 2, 21, 26, '2026-03-01 13:37:09'),
(6, 2, 3, 18, 24, '2026-03-01 13:37:09'),
(7, 3, 1, 0, 10, '2026-03-01 13:37:09'),
(8, 3, 2, 10, 15, '2026-03-01 13:37:09'),
(9, 3, 3, 15, 20, '2026-03-01 13:37:09'),
(10, 4, 1, 30, 45, '2026-03-01 13:37:09'),
(11, 4, 2, 15, 20, '2026-03-01 13:37:09'),
(12, 4, 3, 5, 10, '2026-03-01 13:37:09'),
(13, 5, 1, 15, 30, '2026-03-01 13:37:09'),
(14, 5, 2, 60, 90, '2026-03-01 13:37:09'),
(15, 5, 3, 110, 150, '2026-03-01 13:37:09'),
(16, 6, 1, 30, 50, '2026-03-01 13:37:09'),
(17, 6, 2, 120, 180, '2026-03-01 13:37:09'),
(18, 6, 3, 250, 300, '2026-03-01 13:37:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consumo_agua`
--

CREATE TABLE `consumo_agua` (
  `id_consumo_agua_` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `cantidad_litros` int(11) NOT NULL,
  `origen_IOT_MANUAL` char(150) NOT NULL,
  `id_lote_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consumo_alimento`
--

CREATE TABLE `consumo_alimento` (
  `id_consumo_` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `cantidad` int(11) NOT NULL,
  `id_lote_` int(11) NOT NULL,
  `id_alimento_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `costo_lote`
--

CREATE TABLE `costo_lote` (
  `id_costo` int(11) NOT NULL,
  `tipo` varchar(150) NOT NULL,
  `monto` float NOT NULL,
  `fecha` date NOT NULL,
  `id_lote_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `crecimiento`
--

CREATE TABLE `crecimiento` (
  `id_crecimiento_` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `peso_promedio` float NOT NULL,
  `cantidad_muestra` int(11) NOT NULL,
  `id_lote_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etapa`
--

CREATE TABLE `etapa` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `etapa`
--

INSERT INTO `etapa` (`id`, `nombre`, `descripcion`) VALUES
(1, 'pequeno', NULL),
(2, 'mediano', NULL),
(3, 'grande', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_inventario` int(11) NOT NULL,
  `nombre_insumo` varchar(150) NOT NULL,
  `tipo` varchar(150) NOT NULL,
  `stock_actual` int(11) NOT NULL,
  `unidad` int(11) NOT NULL,
  `stock_minimo` int(11) NOT NULL,
  `costo_unitario` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jaula`
--

CREATE TABLE `jaula` (
  `id_jaula_` int(11) NOT NULL,
  `ubicacion` char(150) NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jaula`
--

INSERT INTO `jaula` (`id_jaula_`, `ubicacion`, `estado`) VALUES
(1, 'galpon a, nivel 1, fila 3', 0),
(2, 'galpon b, nivel 2, fila 1', 0),
(3, 'galpon c, nivel 3, fila 2', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lectura_sensor`
--

CREATE TABLE `lectura_sensor` (
  `id_lectura_` int(11) NOT NULL,
  `fecha_hora` date NOT NULL,
  `valor` int(11) NOT NULL,
  `id_sensor` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_movimiento_auditoria`
--

CREATE TABLE `log_movimiento_auditoria` (
  `id_log_` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `accion` char(150) NOT NULL,
  `entidad_afectada` varchar(150) NOT NULL,
  `id_registro` int(11) NOT NULL,
  `ip_origen` char(150) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lote`
--

CREATE TABLE `lote` (
  `id_lote_` int(11) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `cantidad_inicial` int(11) NOT NULL,
  `proveedor` varchar(150) NOT NULL,
  `tipo_ave` varchar(150) NOT NULL,
  `peso_inicial` float NOT NULL,
  `estado_activo_cerrado` int(11) NOT NULL,
  `fecha_cierre` date DEFAULT NULL,
  `observaciones` varchar(150) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `edad_inicial` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lote`
--

INSERT INTO `lote` (`id_lote_`, `fecha_ingreso`, `cantidad_inicial`, `proveedor`, `tipo_ave`, `peso_inicial`, `estado_activo_cerrado`, `fecha_cierre`, `observaciones`, `id_usuario`, `edad_inicial`) VALUES
(2, '2026-02-18', 2344, 'Pollos del Sur - 78.345.678-9', 'Pollo de Engorde', 123, 1, NULL, '', 1, 0),
(3, '2026-03-11', 400, 'Productora Nacional - 80.567.890-1', 'Pollo Campero', 3, 1, NULL, '', 1, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mortalidad`
--

CREATE TABLE `mortalidad` (
  `id_mortalidad_` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `cantidad` int(11) NOT NULL,
  `causa` varchar(150) NOT NULL,
  `id_lote_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mortalidad`
--

INSERT INTO `mortalidad` (`id_mortalidad_`, `fecha`, `cantidad`, `causa`, `id_lote_`) VALUES
(1, '2026-03-11', 6, 'enfermedad', 3),
(2, '2026-03-11', 10, 'enfermedad', 3),
(3, '2026-03-11', 2, 'enfermedad', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_inventario`
--

CREATE TABLE `movimiento_inventario` (
  `id_movimiento_` int(11) NOT NULL,
  `tipo_entrada_salida` char(150) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `motivo` varchar(150) NOT NULL,
  `id_inventario` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sensor`
--

CREATE TABLE `sensor` (
  `id_sensor` int(11) NOT NULL,
  `tipo` varchar(150) NOT NULL,
  `ubicacion` varchar(150) NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` char(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasenia_hash` varchar(150) NOT NULL,
  `rol_ADMIN_OPERADOR_TECNICO` varchar(150) NOT NULL,
  `estado_activo_inactivo` int(11) NOT NULL,
  `fecha_creacion` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `correo`, `contrasenia_hash`, `rol_ADMIN_OPERADOR_TECNICO`, `estado_activo_inactivo`, `fecha_creacion`) VALUES
(1, 'Admin Pollo', 'admin@granja.com', 'hash_temporal_123', 'ADMIN', 1, '2026-02-17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variable`
--

CREATE TABLE `variable` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `unidad_medida` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `variable`
--

INSERT INTO `variable` (`id`, `nombre`, `unidad_medida`) VALUES
(1, 'humedad', '%'),
(2, 'temperatura', '°C'),
(3, 'amonico', 'ppm'),
(4, 'iluminacion', 'lux'),
(5, 'comida', 'kg'),
(6, 'agua', 'L');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_vacuna`
--

CREATE TABLE `_vacuna` (
  `id_vacuna_` int(11) NOT NULL,
  `nombre` char(150) NOT NULL,
  `dosis` float NOT NULL,
  `descripcion` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_vacunacion`
--

CREATE TABLE `_vacunacion` (
  `id_vacunacion_` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `observacion` varchar(150) NOT NULL,
  `id_lote_` int(11) NOT NULL,
  `id_vacuna_` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alimento`
--
ALTER TABLE `alimento`
  ADD PRIMARY KEY (`id_alimento_`);

--
-- Indices de la tabla `asignacion_jaula`
--
ALTER TABLE `asignacion_jaula`
  ADD PRIMARY KEY (`id_asignacion_`),
  ADD KEY `id_lote_` (`id_lote_`),
  ADD KEY `id_jaula_` (`id_jaula_`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_variable` (`id_variable`),
  ADD KEY `id_etapa` (`id_etapa`);

--
-- Indices de la tabla `consumo_agua`
--
ALTER TABLE `consumo_agua`
  ADD PRIMARY KEY (`id_consumo_agua_`),
  ADD KEY `id_lote_` (`id_lote_`);

--
-- Indices de la tabla `consumo_alimento`
--
ALTER TABLE `consumo_alimento`
  ADD PRIMARY KEY (`id_consumo_`),
  ADD KEY `id_lote_` (`id_lote_`),
  ADD KEY `id_alimento_` (`id_alimento_`);

--
-- Indices de la tabla `costo_lote`
--
ALTER TABLE `costo_lote`
  ADD PRIMARY KEY (`id_costo`),
  ADD KEY `id_lote_` (`id_lote_`);

--
-- Indices de la tabla `crecimiento`
--
ALTER TABLE `crecimiento`
  ADD PRIMARY KEY (`id_crecimiento_`),
  ADD KEY `id_lote_` (`id_lote_`);

--
-- Indices de la tabla `etapa`
--
ALTER TABLE `etapa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_inventario`);

--
-- Indices de la tabla `jaula`
--
ALTER TABLE `jaula`
  ADD PRIMARY KEY (`id_jaula_`);

--
-- Indices de la tabla `lectura_sensor`
--
ALTER TABLE `lectura_sensor`
  ADD PRIMARY KEY (`id_lectura_`),
  ADD KEY `id_sensor` (`id_sensor`);

--
-- Indices de la tabla `log_movimiento_auditoria`
--
ALTER TABLE `log_movimiento_auditoria`
  ADD PRIMARY KEY (`id_log_`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `lote`
--
ALTER TABLE `lote`
  ADD PRIMARY KEY (`id_lote_`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `mortalidad`
--
ALTER TABLE `mortalidad`
  ADD PRIMARY KEY (`id_mortalidad_`),
  ADD KEY `id_lote_` (`id_lote_`);

--
-- Indices de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD PRIMARY KEY (`id_movimiento_`),
  ADD KEY `id_inventario` (`id_inventario`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `sensor`
--
ALTER TABLE `sensor`
  ADD PRIMARY KEY (`id_sensor`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `variable`
--
ALTER TABLE `variable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `_vacuna`
--
ALTER TABLE `_vacuna`
  ADD PRIMARY KEY (`id_vacuna_`);

--
-- Indices de la tabla `_vacunacion`
--
ALTER TABLE `_vacunacion`
  ADD PRIMARY KEY (`id_vacunacion_`),
  ADD KEY `id_lote_` (`id_lote_`),
  ADD KEY `id_vacuna_` (`id_vacuna_`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alimento`
--
ALTER TABLE `alimento`
  MODIFY `id_alimento_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignacion_jaula`
--
ALTER TABLE `asignacion_jaula`
  MODIFY `id_asignacion_` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `consumo_agua`
--
ALTER TABLE `consumo_agua`
  MODIFY `id_consumo_agua_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consumo_alimento`
--
ALTER TABLE `consumo_alimento`
  MODIFY `id_consumo_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `costo_lote`
--
ALTER TABLE `costo_lote`
  MODIFY `id_costo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `crecimiento`
--
ALTER TABLE `crecimiento`
  MODIFY `id_crecimiento_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `etapa`
--
ALTER TABLE `etapa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jaula`
--
ALTER TABLE `jaula`
  MODIFY `id_jaula_` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `lectura_sensor`
--
ALTER TABLE `lectura_sensor`
  MODIFY `id_lectura_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `log_movimiento_auditoria`
--
ALTER TABLE `log_movimiento_auditoria`
  MODIFY `id_log_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lote`
--
ALTER TABLE `lote`
  MODIFY `id_lote_` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `mortalidad`
--
ALTER TABLE `mortalidad`
  MODIFY `id_mortalidad_` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  MODIFY `id_movimiento_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sensor`
--
ALTER TABLE `sensor`
  MODIFY `id_sensor` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `variable`
--
ALTER TABLE `variable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `_vacuna`
--
ALTER TABLE `_vacuna`
  MODIFY `id_vacuna_` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `_vacunacion`
--
ALTER TABLE `_vacunacion`
  MODIFY `id_vacunacion_` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignacion_jaula`
--
ALTER TABLE `asignacion_jaula`
  ADD CONSTRAINT `asignacion_jaula_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`),
  ADD CONSTRAINT `asignacion_jaula_ibfk_2` FOREIGN KEY (`id_jaula_`) REFERENCES `jaula` (`id_jaula_`);

--
-- Filtros para la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD CONSTRAINT `configuracion_ibfk_1` FOREIGN KEY (`id_variable`) REFERENCES `variable` (`id`),
  ADD CONSTRAINT `configuracion_ibfk_2` FOREIGN KEY (`id_etapa`) REFERENCES `etapa` (`id`);

--
-- Filtros para la tabla `consumo_agua`
--
ALTER TABLE `consumo_agua`
  ADD CONSTRAINT `consumo_agua_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`);

--
-- Filtros para la tabla `consumo_alimento`
--
ALTER TABLE `consumo_alimento`
  ADD CONSTRAINT `consumo_alimento_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`),
  ADD CONSTRAINT `consumo_alimento_ibfk_2` FOREIGN KEY (`id_alimento_`) REFERENCES `alimento` (`id_alimento_`);

--
-- Filtros para la tabla `costo_lote`
--
ALTER TABLE `costo_lote`
  ADD CONSTRAINT `costo_lote_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`);

--
-- Filtros para la tabla `crecimiento`
--
ALTER TABLE `crecimiento`
  ADD CONSTRAINT `crecimiento_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`);

--
-- Filtros para la tabla `lectura_sensor`
--
ALTER TABLE `lectura_sensor`
  ADD CONSTRAINT `lectura_sensor_ibfk_1` FOREIGN KEY (`id_sensor`) REFERENCES `sensor` (`id_sensor`);

--
-- Filtros para la tabla `log_movimiento_auditoria`
--
ALTER TABLE `log_movimiento_auditoria`
  ADD CONSTRAINT `log_movimiento_auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `lote`
--
ALTER TABLE `lote`
  ADD CONSTRAINT `lote_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `mortalidad`
--
ALTER TABLE `mortalidad`
  ADD CONSTRAINT `mortalidad_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`);

--
-- Filtros para la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`id_inventario`) REFERENCES `inventario` (`id_inventario`),
  ADD CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `_vacunacion`
--
ALTER TABLE `_vacunacion`
  ADD CONSTRAINT `_vacunacion_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`),
  ADD CONSTRAINT `_vacunacion_ibfk_2` FOREIGN KEY (`id_vacuna_`) REFERENCES `_vacuna` (`id_vacuna_`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
