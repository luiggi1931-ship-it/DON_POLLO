-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: granjadepollitos
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `granjadepollitos`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `granjadepollitos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `granjadepollitos`;

--
-- Table structure for table `_vacuna`
--

DROP TABLE IF EXISTS `_vacuna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_vacuna` (
  `id_vacuna_` int NOT NULL AUTO_INCREMENT,
  `nombre` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `dosis` float NOT NULL,
  `descripcion` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id_vacuna_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_vacuna`
--

LOCK TABLES `_vacuna` WRITE;
/*!40000 ALTER TABLE `_vacuna` DISABLE KEYS */;
/*!40000 ALTER TABLE `_vacuna` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_vacunacion`
--

DROP TABLE IF EXISTS `_vacunacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_vacunacion` (
  `id_vacunacion_` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `observacion` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `id_lote_` int NOT NULL,
  `id_vacuna_` int NOT NULL,
  PRIMARY KEY (`id_vacunacion_`),
  KEY `id_lote_` (`id_lote_`),
  KEY `id_vacuna_` (`id_vacuna_`),
  CONSTRAINT `_vacunacion_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`),
  CONSTRAINT `_vacunacion_ibfk_2` FOREIGN KEY (`id_vacuna_`) REFERENCES `_vacuna` (`id_vacuna_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_vacunacion`
--

LOCK TABLES `_vacunacion` WRITE;
/*!40000 ALTER TABLE `_vacunacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `_vacunacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alimento`
--

DROP TABLE IF EXISTS `alimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alimento` (
  `id_alimento_` int NOT NULL AUTO_INCREMENT,
  `nombre` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `costo_unitario` int NOT NULL,
  `unidad_medida` int NOT NULL,
  PRIMARY KEY (`id_alimento_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimento`
--

LOCK TABLES `alimento` WRITE;
/*!40000 ALTER TABLE `alimento` DISABLE KEYS */;
/*!40000 ALTER TABLE `alimento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_jaula`
--

DROP TABLE IF EXISTS `asignacion_jaula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_jaula` (
  `id_asignacion_` int NOT NULL AUTO_INCREMENT,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `cantidad_aves` int NOT NULL,
  `id_lote_` int NOT NULL,
  `id_jaula_` int NOT NULL,
  PRIMARY KEY (`id_asignacion_`),
  KEY `id_lote_` (`id_lote_`),
  KEY `id_jaula_` (`id_jaula_`),
  CONSTRAINT `asignacion_jaula_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`),
  CONSTRAINT `asignacion_jaula_ibfk_2` FOREIGN KEY (`id_jaula_`) REFERENCES `jaula` (`id_jaula_`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_jaula`
--

LOCK TABLES `asignacion_jaula` WRITE;
/*!40000 ALTER TABLE `asignacion_jaula` DISABLE KEYS */;
INSERT INTO `asignacion_jaula` VALUES (1,'2026-03-11',NULL,200,3,1),(2,'2026-03-11',NULL,200,3,2);
/*!40000 ALTER TABLE `asignacion_jaula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_variable` int NOT NULL,
  `id_etapa` int NOT NULL,
  `valor_min` float NOT NULL,
  `valor_max` float NOT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_variable` (`id_variable`),
  KEY `id_etapa` (`id_etapa`),
  CONSTRAINT `configuracion_ibfk_1` FOREIGN KEY (`id_variable`) REFERENCES `variable` (`id`),
  CONSTRAINT `configuracion_ibfk_2` FOREIGN KEY (`id_etapa`) REFERENCES `etapa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,1,1,60,70,'2026-03-01 13:37:09'),(2,1,2,55,65,'2026-03-01 13:37:09'),(3,1,3,50,60,'2026-03-01 13:37:09'),(4,2,1,32,34,'2026-03-01 13:37:09'),(5,2,2,21,26,'2026-03-01 13:37:09'),(6,2,3,18,24,'2026-03-01 13:37:09'),(7,3,1,0,10,'2026-03-01 13:37:09'),(8,3,2,10,15,'2026-03-01 13:37:09'),(9,3,3,15,20,'2026-03-01 13:37:09'),(10,4,1,30,45,'2026-03-01 13:37:09'),(11,4,2,15,20,'2026-03-01 13:37:09'),(12,4,3,5,10,'2026-03-01 13:37:09'),(13,5,1,15,30,'2026-03-01 13:37:09'),(14,5,2,60,90,'2026-03-01 13:37:09'),(15,5,3,110,150,'2026-03-01 13:37:09'),(16,6,1,30,50,'2026-03-01 13:37:09'),(17,6,2,120,180,'2026-03-01 13:37:09'),(18,6,3,250,300,'2026-03-01 13:37:09');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consumo_agua`
--

DROP TABLE IF EXISTS `consumo_agua`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumo_agua` (
  `id_consumo_agua_` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `cantidad_litros` int NOT NULL,
  `origen_IOT_MANUAL` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `id_lote_` int NOT NULL,
  PRIMARY KEY (`id_consumo_agua_`),
  KEY `id_lote_` (`id_lote_`),
  CONSTRAINT `consumo_agua_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumo_agua`
--

LOCK TABLES `consumo_agua` WRITE;
/*!40000 ALTER TABLE `consumo_agua` DISABLE KEYS */;
/*!40000 ALTER TABLE `consumo_agua` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consumo_alimento`
--

DROP TABLE IF EXISTS `consumo_alimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consumo_alimento` (
  `id_consumo_` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `cantidad` int NOT NULL,
  `id_lote_` int NOT NULL,
  `id_alimento_` int NOT NULL,
  PRIMARY KEY (`id_consumo_`),
  KEY `id_lote_` (`id_lote_`),
  KEY `id_alimento_` (`id_alimento_`),
  CONSTRAINT `consumo_alimento_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`),
  CONSTRAINT `consumo_alimento_ibfk_2` FOREIGN KEY (`id_alimento_`) REFERENCES `alimento` (`id_alimento_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consumo_alimento`
--

LOCK TABLES `consumo_alimento` WRITE;
/*!40000 ALTER TABLE `consumo_alimento` DISABLE KEYS */;
/*!40000 ALTER TABLE `consumo_alimento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `costo_lote`
--

DROP TABLE IF EXISTS `costo_lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `costo_lote` (
  `id_costo` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `monto` float NOT NULL,
  `fecha` date NOT NULL,
  `id_lote_` int NOT NULL,
  PRIMARY KEY (`id_costo`),
  KEY `id_lote_` (`id_lote_`),
  CONSTRAINT `costo_lote_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `costo_lote`
--

LOCK TABLES `costo_lote` WRITE;
/*!40000 ALTER TABLE `costo_lote` DISABLE KEYS */;
/*!40000 ALTER TABLE `costo_lote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crecimiento`
--

DROP TABLE IF EXISTS `crecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crecimiento` (
  `id_crecimiento_` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `peso_promedio` float NOT NULL,
  `cantidad_muestra` int NOT NULL,
  `id_lote_` int NOT NULL,
  PRIMARY KEY (`id_crecimiento_`),
  KEY `id_lote_` (`id_lote_`),
  CONSTRAINT `crecimiento_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crecimiento`
--

LOCK TABLES `crecimiento` WRITE;
/*!40000 ALTER TABLE `crecimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `crecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etapa`
--

DROP TABLE IF EXISTS `etapa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etapa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etapa`
--

LOCK TABLES `etapa` WRITE;
/*!40000 ALTER TABLE `etapa` DISABLE KEYS */;
INSERT INTO `etapa` VALUES (1,'pequeno',NULL),(2,'mediano',NULL),(3,'grande',NULL);
/*!40000 ALTER TABLE `etapa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int NOT NULL AUTO_INCREMENT,
  `nombre_insumo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `stock_actual` int NOT NULL,
  `unidad` int NOT NULL,
  `stock_minimo` int NOT NULL,
  `costo_unitario` float NOT NULL,
  PRIMARY KEY (`id_inventario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jaula`
--

DROP TABLE IF EXISTS `jaula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jaula` (
  `id_jaula_` int NOT NULL AUTO_INCREMENT,
  `ubicacion` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_jaula` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'mediano',
  `estado` int NOT NULL,
  `metros_cuadrados` decimal(10,2) DEFAULT NULL,
  `fecha_creacion` date DEFAULT NULL,
  PRIMARY KEY (`id_jaula_`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jaula`
--

LOCK TABLES `jaula` WRITE;
/*!40000 ALTER TABLE `jaula` DISABLE KEYS */;
INSERT INTO `jaula` VALUES (1,'galpon a, nivel 1, fila 3','mediano',0,NULL,NULL),(2,'galpon b, nivel 2, fila 1','mediano',0,NULL,NULL),(3,'galpon c, nivel 3, fila 2','mediano',1,NULL,NULL);
/*!40000 ALTER TABLE `jaula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lectura_sensor`
--

DROP TABLE IF EXISTS `lectura_sensor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lectura_sensor` (
  `id_lectura_` int NOT NULL AUTO_INCREMENT,
  `fecha_hora` date NOT NULL,
  `valor` int NOT NULL,
  `id_sensor` int NOT NULL,
  PRIMARY KEY (`id_lectura_`),
  KEY `id_sensor` (`id_sensor`),
  CONSTRAINT `lectura_sensor_ibfk_1` FOREIGN KEY (`id_sensor`) REFERENCES `sensor` (`id_sensor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lectura_sensor`
--

LOCK TABLES `lectura_sensor` WRITE;
/*!40000 ALTER TABLE `lectura_sensor` DISABLE KEYS */;
/*!40000 ALTER TABLE `lectura_sensor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_movimiento_auditoria`
--

DROP TABLE IF EXISTS `log_movimiento_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_movimiento_auditoria` (
  `id_log_` int NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime NOT NULL,
  `accion` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `entidad_afectada` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `id_registro` int NOT NULL,
  `ip_origen` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_log_`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `log_movimiento_auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_movimiento_auditoria`
--

LOCK TABLES `log_movimiento_auditoria` WRITE;
/*!40000 ALTER TABLE `log_movimiento_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_movimiento_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lote`
--

DROP TABLE IF EXISTS `lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote` (
  `id_lote_` int NOT NULL AUTO_INCREMENT,
  `fecha_ingreso` date NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `proveedor` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_ave` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `peso_inicial` float NOT NULL,
  `estado_activo_cerrado` int NOT NULL,
  `fecha_cierre` date DEFAULT NULL,
  `observaciones` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_usuario` int NOT NULL,
  `edad_inicial` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_lote_`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `lote_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote`
--

LOCK TABLES `lote` WRITE;
/*!40000 ALTER TABLE `lote` DISABLE KEYS */;
INSERT INTO `lote` VALUES (2,'2026-02-18',2344,'Pollos del Sur - 78.345.678-9','Pollo de Engorde',123,1,NULL,'',1,0),(3,'2026-03-11',400,'Productora Nacional - 80.567.890-1','Pollo Campero',3,1,NULL,'',1,10);
/*!40000 ALTER TABLE `lote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mortalidad`
--

DROP TABLE IF EXISTS `mortalidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mortalidad` (
  `id_mortalidad_` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `cantidad` int NOT NULL,
  `causa` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `id_lote_` int NOT NULL,
  PRIMARY KEY (`id_mortalidad_`),
  KEY `id_lote_` (`id_lote_`),
  CONSTRAINT `mortalidad_ibfk_1` FOREIGN KEY (`id_lote_`) REFERENCES `lote` (`id_lote_`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mortalidad`
--

LOCK TABLES `mortalidad` WRITE;
/*!40000 ALTER TABLE `mortalidad` DISABLE KEYS */;
INSERT INTO `mortalidad` VALUES (1,'2026-03-11',6,'enfermedad',3),(2,'2026-03-11',10,'enfermedad',3),(3,'2026-03-11',2,'enfermedad',3);
/*!40000 ALTER TABLE `mortalidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_inventario`
--

DROP TABLE IF EXISTS `movimiento_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_inventario` (
  `id_movimiento_` int NOT NULL AUTO_INCREMENT,
  `tipo_entrada_salida` char(150) COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` date NOT NULL,
  `motivo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `id_inventario` int NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_movimiento_`),
  KEY `id_inventario` (`id_inventario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `movimiento_inventario_ibfk_1` FOREIGN KEY (`id_inventario`) REFERENCES `inventario` (`id_inventario`),
  CONSTRAINT `movimiento_inventario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_inventario`
--

LOCK TABLES `movimiento_inventario` WRITE;
/*!40000 ALTER TABLE `movimiento_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensor`
--

DROP TABLE IF EXISTS `sensor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensor` (
  `id_sensor` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `ubicacion` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` int NOT NULL,
  PRIMARY KEY (`id_sensor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensor`
--

LOCK TABLES `sensor` WRITE;
/*!40000 ALTER TABLE `sensor` DISABLE KEYS */;
/*!40000 ALTER TABLE `sensor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` char(100) COLLATE utf8mb4_general_ci NOT NULL,
  `correo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `contrasenia_hash` varchar(512) COLLATE utf8mb4_general_ci NOT NULL,
  `rol_ADMIN_OPERADOR_TECNICO` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `estado_activo_inactivo` int NOT NULL,
  `fecha_creacion` date NOT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Admin Pollo','admin@granja.com','hash_temporal_123','ADMIN',1,'2026-02-17'),(2,'admin','admin@donpollo.local','scrypt:32768:8:1$8ivzE4TgsL2aQB7r$591b29d3ed5b84b7146453370f67b9f89e46be8f1cfca2fa7dbf6292de3bebae9245966bd77a4e914797985b5d2bb0b56a31bbd2f077e145718ecf8f08992e57','ADMIN',1,'2026-08-23');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variable`
--

DROP TABLE IF EXISTS `variable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variable` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `unidad_medida` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variable`
--

LOCK TABLES `variable` WRITE;
/*!40000 ALTER TABLE `variable` DISABLE KEYS */;
INSERT INTO `variable` VALUES (1,'humedad','%'),(2,'temperatura','??C'),(3,'amonico','ppm'),(4,'iluminacion','lux'),(5,'comida','kg'),(6,'agua','L');
/*!40000 ALTER TABLE `variable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'granjadepollitos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-23 22:34:02
