-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: muraldigital
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `classificados`
--

DROP TABLE IF EXISTS `classificados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classificados` (
  `id_classificados` int NOT NULL AUTO_INCREMENT,
  `titulo_classificados` varchar(255) DEFAULT NULL,
  `descricao_classificados` text,
  `preco` decimal(10,2) DEFAULT NULL,
  `contato` varchar(100) DEFAULT NULL,
  `foto_url_class` text,
  `morador_id_class` int DEFAULT NULL,
  PRIMARY KEY (`id_classificados`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classificados`
--

LOCK TABLES `classificados` WRITE;
/*!40000 ALTER TABLE `classificados` DISABLE KEYS */;
/*!40000 ALTER TABLE `classificados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comunicados`
--

DROP TABLE IF EXISTS `comunicados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunicados` (
  `id_comunicados` int NOT NULL AUTO_INCREMENT,
  `titulo_comunicados` varchar(255) DEFAULT NULL,
  `descricao_comunicados` text,
  `data_criacao` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_comunicados`),
  UNIQUE KEY `id` (`id_comunicados`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunicados`
--

LOCK TABLES `comunicados` WRITE;
/*!40000 ALTER TABLE `comunicados` DISABLE KEYS */;
INSERT INTO `comunicados` VALUES (1,'Bebedouro estragado','gshfahfd','2025-09-22 22:41:01'),(2,'quadra de tênis','Quadra de tenies em reforma','2025-09-22 23:04:05');
/*!40000 ALTER TABLE `comunicados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manutencao`
--

DROP TABLE IF EXISTS `manutencao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manutencao` (
  `id_manutenção` int NOT NULL AUTO_INCREMENT,
  `titulo_manutencao` varchar(255) DEFAULT NULL,
  `descricao_manutencao` text,
  `status_manutencao` text,
  `data_manutencao` text,
  PRIMARY KEY (`id_manutenção`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manutencao`
--

LOCK TABLES `manutencao` WRITE;
/*!40000 ALTER TABLE `manutencao` DISABLE KEYS */;
/*!40000 ALTER TABLE `manutencao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `area` varchar(50) NOT NULL,
  `data` date NOT NULL,
  `status` varchar(20) DEFAULT 'pendente',
  `morador_id` int DEFAULT NULL,
  `horario` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_reserva`),
  UNIQUE KEY `id` (`id_reserva`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,'salao-festas','2025-09-23','pendente',3,'10:30 - 15:00'),(2,'academia','2025-09-22','pendente',2,'20:00 - 21:00'),(3,'piscina','2025-09-25','pendente',1,'13:00 - 14:00'),(4,'quadra-tenis','2025-09-28','pendente',3,'13:00 - 14:00'),(5,'academia','2025-09-24','pendente',2,'08:00 - 09:00'),(6,'salao-festas','2025-10-14','pendente',4,'18:00 - 22:00'),(7,'salao-festas','2025-10-14','pendente',4,'18:00 - 22:00');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `endereco` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `nivel` char(1) NOT NULL DEFAULT 'M',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `id` (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (3,'jorge','6656','jorgecabuloso@gmail.com','6240088922',NULL,'M'),(4,'jubilão destroçador','5555','higortga@gmail.com','6113132132132123',NULL,'M'),(5,'Cachorro mil grau','145','gwpihjgoh@gmial.com','62 95559263','/uploads/fe44f0252e98ac46bd3a8bcd0012ca21.jpg','M');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 16:45:06
