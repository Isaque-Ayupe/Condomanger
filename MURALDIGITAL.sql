-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: muraldigital
-- ------------------------------------------------------
-- Server version	8.0.44

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
  `usuario` int NOT NULL,
  PRIMARY KEY (`id_classificados`,`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classificados`
--

LOCK TABLES `classificados` WRITE;
/*!40000 ALTER TABLE `classificados` DISABLE KEYS */;
INSERT INTO `classificados` VALUES (4,'didy','eita',9000000.00,'(11) 98764-3521','/uploads/Captura_de_tela_2025-08-16_231833.png',6),(5,'personagens gays','nao compre se for homem!\neu compro sim',10000.00,'(21) 97453-2091','/uploads/Captura_de_tela_2025-08-31_140336.png',9),(6,'higor naruto','higuin fofin',100.00,'(62) 99858-8520','/uploads/Captura_de_tela_2025-06-09_125808.png',7),(7,'grafo ','um belo grafo',8534.00,'(62) 99858-8520','/uploads/Captura_de_tela_2025-05-19_172700.png',6),(9,'nata fofo','pretin pra hora',830.00,'(62) 99858-8520','/uploads/Captura_de_tela_2025-05-25_163601.png',14),(10,'naruto online 2','o melhor jogo de naruto da historia pse',1000.00,'(62) 99858-8520','/uploads/Captura_de_tela_2025-06-09_125808.png',16);
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
  `usuario` varchar(45) NOT NULL,
  PRIMARY KEY (`id_comunicados`,`usuario`),
  UNIQUE KEY `id` (`id_comunicados`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunicados`
--

LOCK TABLES `comunicados` WRITE;
/*!40000 ALTER TABLE `comunicados` DISABLE KEYS */;
INSERT INTO `comunicados` VALUES (4,'piscina em lim','segunda iremos limpar a piscina! nao ira funcionar!','2025-11-23 19:19:24','6'),(10,'iremos fechar para o feriado','nao traga visitas!!!','2025-11-27 02:52:46','14');
/*!40000 ALTER TABLE `comunicados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_reservas`
--

DROP TABLE IF EXISTS `log_reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_reservas` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_reservas` int DEFAULT NULL,
  `acao_log` varchar(50) DEFAULT NULL,
  `id_usuario_log` int DEFAULT NULL,
  `local_area` varchar(20) DEFAULT NULL,
  `data_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `idx_id_usuario_log` (`id_usuario_log`),
  KEY `idx_id_reservas` (`id_reservas`),
  CONSTRAINT `fk_log_reservas_usuario` FOREIGN KEY (`id_usuario_log`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_reservas`
--

LOCK TABLES `log_reservas` WRITE;
/*!40000 ALTER TABLE `log_reservas` DISABLE KEYS */;
INSERT INTO `log_reservas` VALUES (2,17,'INSERT',14,'piscina','2025-11-27 00:49:43'),(9,19,'INSERT',14,'quadra-tenis','2025-11-27 01:15:58'),(11,19,'DELETE',14,'quadra-tenis','2025-11-27 01:20:17'),(12,20,'INSERT',14,'salao-festas','2025-11-27 01:40:32'),(13,21,'INSERT',14,'salao-festas','2025-11-27 01:56:11'),(14,22,'INSERT',14,'salao-festas','2025-11-27 01:56:44'),(15,23,'INSERT',16,'salao-festas','2025-11-27 02:06:17'),(16,24,'INSERT',16,'salao-festas','2025-11-27 02:06:24'),(17,21,'DELETE',14,'salao-festas','2025-11-27 02:18:26'),(18,25,'INSERT',14,'salao-festas','2025-11-27 02:28:12'),(19,22,'DELETE',14,'salao-festas','2025-11-27 02:33:32'),(20,23,'DELETE',16,'salao-festas','2025-11-27 02:34:21'),(21,26,'INSERT',16,'salao-festas','2025-11-27 02:34:36'),(22,26,'DELETE',16,'salao-festas','2025-11-27 02:34:40'),(23,27,'INSERT',14,'quadra-tenis','2025-11-27 02:36:05'),(24,28,'INSERT',16,'quadra-tenis','2025-11-27 02:36:32'),(25,28,'DELETE',16,'quadra-tenis','2025-11-27 02:37:59'),(26,24,'DELETE',16,'salao-festas','2025-11-27 02:39:49'),(27,29,'INSERT',16,'salao-festas','2025-11-27 02:41:12'),(28,29,'DELETE',16,'salao-festas','2025-11-27 02:41:20'),(29,30,'INSERT',16,'salao-festas','2025-11-27 02:41:31'),(30,31,'INSERT',16,'salao-festas','2025-11-27 02:41:37'),(31,32,'INSERT',16,'salao-festas','2025-11-27 02:41:44'),(32,33,'INSERT',14,'salao-festas','2025-11-27 03:15:40'),(33,34,'INSERT',16,'salao-festas','2025-11-27 03:16:12'),(34,33,'DELETE',14,'salao-festas','2025-11-27 03:16:42'),(35,25,'DELETE',14,'salao-festas','2025-11-27 03:18:26'),(36,34,'DELETE',16,'salao-festas','2025-11-27 03:40:31'),(37,35,'INSERT',14,'academia','2025-11-27 03:41:06'),(38,35,'DELETE',14,'academia','2025-11-27 03:41:10'),(39,36,'INSERT',16,'academia','2025-11-27 03:41:15'),(40,31,'DELETE',16,'salao-festas','2025-11-27 04:16:38'),(41,37,'INSERT',16,'salao-festas','2025-11-27 04:16:47'),(42,37,'DELETE',16,'salao-festas','2025-11-27 04:16:52');
/*!40000 ALTER TABLE `log_reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manutencao`
--

DROP TABLE IF EXISTS `manutencao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manutencao` (
  `id_manutencao` int NOT NULL AUTO_INCREMENT,
  `titulo_manutencao` varchar(255) DEFAULT NULL,
  `descricao_manutencao` text,
  `status_manutencao` text,
  `data_manutencao` text,
  `usuario` varchar(45) NOT NULL,
  PRIMARY KEY (`id_manutencao`,`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manutencao`
--

LOCK TABLES `manutencao` WRITE;
/*!40000 ALTER TABLE `manutencao` DISABLE KEYS */;
INSERT INTO `manutencao` VALUES (1,'porta lala','iremos concenrtar a porta hoje','in-progress','2025-11-23 16:58:20','6'),(5,'lampada bloco a','concertar lampada','pending','2025-11-24 19:30:26','6'),(6,'poste 2','poste','pending','2025-11-24 20:58:38','14'),(10,'lampada torre litorando todo','la ele\n','pendente','2025-11-26 23:42:57','16'),(11,'energia','energia oscilando na torre 2\n','pendente','2025-11-26 23:53:33','14'),(13,'quebrou o gas aqui de casa','por favor concertar do ap 16003','pendente','2025-11-27 01:06:54','16');
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
  `usuario` int NOT NULL,
  `horario` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_reserva`,`usuario`),
  UNIQUE KEY `id` (`id_reserva`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,'salao-festas','2025-09-23','pendente',3,'10:30 - 15:00'),(2,'academia','2025-09-22','pendente',2,'20:00 - 21:00'),(3,'piscina','2025-09-25','pendente',1,'13:00 - 14:00'),(4,'quadra-tenis','2025-09-28','pendente',3,'13:00 - 14:00'),(5,'academia','2025-09-24','pendente',2,'08:00 - 09:00'),(6,'salao-festas','2025-10-14','pendente',4,'18:00 - 22:00'),(7,'salao-festas','2025-10-14','pendente',4,'18:00 - 22:00'),(8,'academia','2025-11-26','pendente',1,'18:00 -22:00'),(13,'salao-festas','2025-11-25','ativo',14,'18:00 - 22:00'),(14,'academia','2025-11-26','ativo',14,'21:00 - 22:00'),(17,'piscina','2025-11-27','ativo',14,'17:00 - 18:00'),(20,'salao-festas','2025-11-26','ativo',14,'10:30 - 15:00'),(27,'quadra-tenis','2025-11-26','ativo',14,'08:00 - 09:00'),(30,'salao-festas','2025-11-30','ativo',16,'18:00 - 22:00'),(32,'salao-festas','2025-11-28','ativo',16,'10:30 - 15:00'),(36,'academia','2025-11-27','ativo',16,'14:00 - 15:00');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_log_reservas_insert` AFTER INSERT ON `reservas` FOR EACH ROW BEGIN
    INSERT INTO log_reservas (
        id_reservas,
        acao_log,
        id_usuario_log,
        local_area,
        data_hora
    ) VALUES (
        NEW.id_reserva,
        'INSERT',
        NEW.usuario,
        NEW.area,
        NOW()
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_log_reservas_delete` BEFORE DELETE ON `reservas` FOR EACH ROW BEGIN
    INSERT INTO log_reservas (
        id_reservas,
        acao_log,
        id_usuario_log,
        local_area,
        data_hora
    ) VALUES (
        OLD.id_reserva,
        'DELETE',
        OLD.usuario,
        OLD.area,
        NOW()
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `usuario_classificados`
--

DROP TABLE IF EXISTS `usuario_classificados`;
/*!50001 DROP VIEW IF EXISTS `usuario_classificados`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `usuario_classificados` AS SELECT 
 1 AS `id_classificados`,
 1 AS `titulo_classificados`,
 1 AS `descricao`,
 1 AS `preco`,
 1 AS `contato`,
 1 AS `foto_url_class`,
 1 AS `vendedor`,
 1 AS `id_usuario`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `usuario_manutencao`
--

DROP TABLE IF EXISTS `usuario_manutencao`;
/*!50001 DROP VIEW IF EXISTS `usuario_manutencao`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `usuario_manutencao` AS SELECT 
 1 AS `id`,
 1 AS `titulo`,
 1 AS `descricao`,
 1 AS `status`,
 1 AS `data`,
 1 AS `nome`,
 1 AS `id_usuario`*/;
SET character_set_client = @saved_cs_client;

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
  `senha` varchar(250) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `id` (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (14,'isaque ayupe','ap10234','isaque@teste.com','62998588520','/uploads/Captura_de_tela_2025-05-25_163601.png','S','$2b$12$LERkzu6QodYmMNJWIB.DYOwZRenuBkCSU3FPwyGpgl1P/rwqoM6Na'),(16,'alex discord','1000','alex@gmail.com','11986435723','/uploads/Captura_de_tela_2025-07-13_125502.png','M','$2b$12$w5RLqyX7KMYMA94ya1PWL.EKeuSXC93O.oxqdIOJdygNy.vOLjEqa');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_log_reservas`
--

DROP TABLE IF EXISTS `vw_log_reservas`;
/*!50001 DROP VIEW IF EXISTS `vw_log_reservas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_log_reservas` AS SELECT 
 1 AS `id_log`,
 1 AS `id_reservas`,
 1 AS `acao_log`,
 1 AS `id_usuario_log`,
 1 AS `local_area`,
 1 AS `data_hora`,
 1 AS `usuario_cadastrado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_reservas_com_moradores`
--

DROP TABLE IF EXISTS `vw_reservas_com_moradores`;
/*!50001 DROP VIEW IF EXISTS `vw_reservas_com_moradores`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_reservas_com_moradores` AS SELECT 
 1 AS `id_reserva`,
 1 AS `area`,
 1 AS `data`,
 1 AS `status`,
 1 AS `horario`,
 1 AS `nome`,
 1 AS `usuario`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'muraldigital'
--

--
-- Dumping routines for database 'muraldigital'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_gerenciar_manutencao` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_gerenciar_manutencao`(
    IN p_acao VARCHAR(20),          -- 'INSERIR', 'EDITAR' ou 'EXCLUIR'
    IN p_id_manutencao INT,         -- ID para editar/excluir (NULL no inserir)
    IN p_titulo VARCHAR(255),       -- Título
    IN p_descricao TEXT,            -- Descrição
    IN p_status VARCHAR(50),        -- Status (NULL no inserir força 'pendente')
    IN p_usuario_id INT             -- ID do usuário
)
BEGIN

    IF p_acao = 'INSERIR' THEN
        INSERT INTO manutencao (titulo_manutencao, descricao_manutencao, status_manutencao, data_manutencao, usuario)
        VALUES (p_titulo, p_descricao, 'pendente', NOW(), p_usuario_id);

        -- Retorna o ID criado para o Python pegar
        SELECT LAST_INSERT_ID() as id;
        
    ELSEIF p_acao = 'EDITAR' THEN
        UPDATE manutencao
        SET titulo_manutencao = p_titulo,
            descricao_manutencao = p_descricao,
            status_manutencao = p_status
        WHERE id_manutencao = p_id_manutencao;

    ELSEIF p_acao = 'EXCLUIR' THEN
        DELETE FROM manutencao
        WHERE id_manutencao = p_id_manutencao;

    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `usuario_classificados`
--

/*!50001 DROP VIEW IF EXISTS `usuario_classificados`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `usuario_classificados` AS select `c`.`id_classificados` AS `id_classificados`,`c`.`titulo_classificados` AS `titulo_classificados`,`c`.`descricao_classificados` AS `descricao`,`c`.`preco` AS `preco`,`c`.`contato` AS `contato`,`c`.`foto_url_class` AS `foto_url_class`,`u`.`nome` AS `vendedor`,`u`.`id_usuario` AS `id_usuario` from (`classificados` `c` join `usuarios` `u` on((`u`.`id_usuario` = `c`.`usuario`))) order by `c`.`id_classificados` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `usuario_manutencao`
--

/*!50001 DROP VIEW IF EXISTS `usuario_manutencao`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `usuario_manutencao` AS select `m`.`id_manutencao` AS `id`,`m`.`titulo_manutencao` AS `titulo`,`m`.`descricao_manutencao` AS `descricao`,`m`.`status_manutencao` AS `status`,`m`.`data_manutencao` AS `data`,`u`.`nome` AS `nome`,`u`.`id_usuario` AS `id_usuario` from (`manutencao` `m` join `usuarios` `u` on((`u`.`id_usuario` = `m`.`usuario`))) order by `m`.`data_manutencao` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_log_reservas`
--

/*!50001 DROP VIEW IF EXISTS `vw_log_reservas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_log_reservas` AS select `l`.`id_log` AS `id_log`,`l`.`id_reservas` AS `id_reservas`,`l`.`acao_log` AS `acao_log`,`l`.`id_usuario_log` AS `id_usuario_log`,`l`.`local_area` AS `local_area`,`l`.`data_hora` AS `data_hora`,`u`.`nome` AS `usuario_cadastrado` from (`log_reservas` `l` left join `usuarios` `u` on((`u`.`id_usuario` = `l`.`id_usuario_log`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_reservas_com_moradores`
--

/*!50001 DROP VIEW IF EXISTS `vw_reservas_com_moradores`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_reservas_com_moradores` AS select `r`.`id_reserva` AS `id_reserva`,`r`.`area` AS `area`,`r`.`data` AS `data`,`r`.`status` AS `status`,`r`.`horario` AS `horario`,`u`.`nome` AS `nome`,`r`.`usuario` AS `usuario` from (`reservas` `r` join `usuarios` `u` on((`u`.`id_usuario` = `r`.`usuario`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27  1:25:31
