-- MySQL dump 10.13  Distrib 8.4.6, for Linux (x86_64)
--
-- Host: localhost    Database: gympoint
-- ------------------------------------------------------
-- Server version	8.4.6

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
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20260101-create-core-auth-tables.js'),('20260102-create-profile-tables.js'),('20260103-create-gym-ecosystem.js'),('20260104-create-fitness-tracking.js'),('20260105-create-exercise-routines.js'),('20260106-create-rewards-challenges.js'),('20260107-create-media-notifications.js'),('20260109-create-gym-request.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_deletion_request`
--

DROP TABLE IF EXISTS `account_deletion_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_deletion_request` (
  `id_deletion_request` int NOT NULL AUTO_INCREMENT COMMENT 'ID único de la solicitud',
  `id_account` int NOT NULL COMMENT 'Cuenta que solicita eliminación',
  `reason` text COMMENT 'Razón de la eliminación (opcional)',
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT 'Estado de la solicitud',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de solicitud',
  `processed_at` datetime DEFAULT NULL COMMENT 'Fecha de procesamiento',
  `processed_by` int DEFAULT NULL COMMENT 'Admin que procesó la solicitud',
  `notes` text COMMENT 'Notas del administrador',
  PRIMARY KEY (`id_deletion_request`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_deletion_request_account_status` (`id_account`,`status`),
  KEY `idx_deletion_request_status_date` (`status`,`requested_at`),
  CONSTRAINT `account_deletion_request_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_deletion_request_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `admin_profiles` (`id_admin_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_deletion_request`
--

LOCK TABLES `account_deletion_request` WRITE;
/*!40000 ALTER TABLE `account_deletion_request` DISABLE KEYS */;
INSERT INTO `account_deletion_request` VALUES (1,2,'Validacion final del backend','CANCELLED','2025-11-01 01:45:46',NULL,NULL,NULL),(2,3,'No se','CANCELLED','2025-11-01 01:59:28',NULL,NULL,NULL),(3,3,'Aaa','CANCELLED','2025-11-02 20:01:39',NULL,NULL,NULL),(4,3,'A','CANCELLED','2025-11-02 20:02:42',NULL,NULL,NULL),(5,3,'Ass','CANCELLED','2025-11-03 11:18:59',NULL,NULL,NULL),(6,3,'Ggg','CANCELLED','2025-11-04 13:14:47',NULL,NULL,NULL);
/*!40000 ALTER TABLE `account_deletion_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_roles`
--

DROP TABLE IF EXISTS `account_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_roles` (
  `id_account_role` int NOT NULL AUTO_INCREMENT COMMENT 'ID único de la asignación',
  `id_account` int NOT NULL COMMENT 'Cuenta asociada',
  `id_role` int NOT NULL COMMENT 'Rol asignado',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account_role`),
  UNIQUE KEY `unique_account_role` (`id_account`,`id_role`),
  KEY `id_role` (`id_role`),
  CONSTRAINT `account_roles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_roles_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_roles`
--

LOCK TABLES `account_roles` WRITE;
/*!40000 ALTER TABLE `account_roles` DISABLE KEYS */;
INSERT INTO `account_roles` VALUES (1,1,2,'2025-11-01 01:44:36'),(2,2,1,'2025-11-01 01:45:03'),(3,3,1,'2025-11-01 01:56:34'),(4,4,1,'2025-11-01 02:03:28'),(5,5,1,'2025-11-01 04:48:23'),(6,6,1,'2025-11-01 05:12:53'),(7,7,1,'2025-11-01 05:14:34'),(8,8,1,'2025-11-01 05:16:05'),(9,9,1,'2025-11-01 05:18:52'),(10,10,1,'2025-11-01 05:28:55'),(11,11,1,'2025-11-02 07:10:27'),(12,12,1,'2025-11-02 07:15:00'),(13,13,1,'2025-11-02 07:17:47'),(14,14,1,'2025-11-02 07:22:25'),(15,15,1,'2025-11-03 04:03:51');
/*!40000 ALTER TABLE `account_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id_account` int NOT NULL AUTO_INCREMENT COMMENT 'ID único de la cuenta',
  `email` varchar(100) NOT NULL COMMENT 'Email único para login',
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'Hash de contraseña (NULL si es login social)',
  `auth_provider` enum('local','google') NOT NULL DEFAULT 'local' COMMENT 'Proveedor de autenticación',
  `google_id` varchar(255) DEFAULT NULL COMMENT 'ID de Google (si usa Google OAuth)',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el email está verificado',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si la cuenta está activa (no baneada)',
  `last_login` datetime DEFAULT NULL COMMENT 'Última fecha de login',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_accounts_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'admin@gympoint.com','$2b$10$qE6peC/yLptB1cu/ZWbEUu78sWKJxsLV9Ek1F9D7eL31l5zVzNz6S','local',NULL,1,1,'2025-11-04 15:30:04','2025-11-01 01:44:36','2025-11-04 15:30:04'),(2,'test@validation.com','$2b$12$.ru8Omg/OM259FFpMFEqpeD0hYFhvU2gjs2uYTh78Y9xJSP13f8Ra','local',NULL,0,1,NULL,'2025-11-01 01:45:03','2025-11-01 01:45:03'),(3,'g@g.com','$2b$12$kr54hToAYUHXbp/92t4hw.DylCOB6ZISepJA2ilodBGxDoDY.Z/v.','local',NULL,0,1,'2025-11-05 03:18:17','2025-11-01 01:56:34','2025-11-05 03:18:17'),(4,'progress2@test.com','$2b$12$pD1UXqC7MberGJKIsV0zs.8HPZQLBIGgFBsX2vzXTMzPUd.S3LiTW','local',NULL,0,1,NULL,'2025-11-01 02:03:28','2025-11-01 02:03:28'),(5,'routine@test.com','$2b$12$lxe.yWPd18VdB.ooRLAh.OxeTGpxz9LVQZ4vkWJJocaKwEWBekjtO','local',NULL,0,1,'2025-11-01 05:12:17','2025-11-01 04:48:23','2025-11-01 05:12:17'),(6,'final@test.com','$2b$12$7K2GV.BtHF8g/Ev/7dl.QOidnjQVeUYMY50IG9IfisQ.AdkY.ivnu','local',NULL,0,1,NULL,'2025-11-01 05:12:53','2025-11-01 05:12:53'),(7,'test@final.com','$2b$12$ji/toGVgHE5zUxElbLCkmOhUz6NKl.6CSKwVyLJx4Bsd7kut6DP0C','local',NULL,0,1,NULL,'2025-11-01 05:14:34','2025-11-01 05:14:34'),(8,'useroutine@test.com','$2b$12$wsTgz3bm8mU3Ptb/lFBzou42TuSDjlmeMxVl6to0f/wGELXRgyjqC','local',NULL,0,1,NULL,'2025-11-01 05:16:05','2025-11-01 05:16:05'),(9,'success@test.com','$2b$12$o6IJZHufZjMw2rJmP4oGNOTv1ANig41W0GM2.Uw7vLzem4RqFTOKe','local',NULL,0,1,NULL,'2025-11-01 05:18:52','2025-11-01 05:18:52'),(10,'usertest@test.com','$2b$12$rQ4j.dY.RcWuhJ413N4XlOlQor5Sr4bnCfGhXcJnHPjsgAC0PgPxS','local',NULL,0,1,NULL,'2025-11-01 05:28:55','2025-11-01 05:28:55'),(11,'finaltest@test.com','$2b$12$FA5NzGPWUem2uNcI0ovlPuWJ6AcDJwM3G5gVcDZHMX/dW6RGGgATq','local',NULL,0,1,NULL,'2025-11-02 07:10:26','2025-11-02 07:10:26'),(12,'complete@test.com','$2b$12$lFsjJYxcWnV9IqkXkHtN7uHWStXKY5fsuRwL3xR5TdrWoIpNvpbZy','local',NULL,0,1,NULL,'2025-11-02 07:15:00','2025-11-02 07:15:00'),(13,'suite@test.com','$2b$12$nrMfwUrYugmyPcTlnosB6ug6Pk2/4Sfl0ngeEzgsl9H3dNX84yCpK','local',NULL,0,1,NULL,'2025-11-02 07:17:46','2025-11-02 07:17:46'),(14,'final-suite@test.com','$2b$12$1SFNvnGN5huYJOm.1y2Dj.JtbKACj/1vz8AxSUFenE7uge69QvAmC','local',NULL,0,1,NULL,'2025-11-02 07:22:25','2025-11-02 07:22:25'),(15,'nurylabrillante@gmail.com','$2b$12$LvnM2.t5tLQMM400M9ua3O.N0CmVa7fCsTCWIsaeGinblVM/L7JMa','local',NULL,0,1,'2025-11-03 04:04:09','2025-11-03 04:03:51','2025-11-03 04:04:09');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievement_definition`
--

DROP TABLE IF EXISTS `achievement_definition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievement_definition` (
  `id_achievement_definition` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'Código único del logro (ej: FIRST_WORKOUT, STREAK_7_DAYS)',
  `name` varchar(120) NOT NULL,
  `description` text,
  `category` enum('ONBOARDING','STREAK','FREQUENCY','ATTENDANCE','ROUTINE','CHALLENGE','PROGRESS','TOKEN','SOCIAL') NOT NULL DEFAULT 'ONBOARDING',
  `metric_type` enum('STREAK_DAYS','STREAK_RECOVERY_USED','ASSISTANCE_TOTAL','FREQUENCY_WEEKS_MET','ROUTINE_COMPLETED_COUNT','WORKOUT_SESSION_COMPLETED','DAILY_CHALLENGE_COMPLETED_COUNT','PR_RECORD_COUNT','BODY_WEIGHT_PROGRESS','TOKEN_BALANCE_REACHED','TOKEN_SPENT_TOTAL','ONBOARDING_STEP_COMPLETED') NOT NULL,
  `target_value` int NOT NULL COMMENT 'Valor objetivo para desbloquear',
  `metadata` json DEFAULT NULL COMMENT 'Información adicional',
  `icon_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_achievement_definition`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `idx_achievement_def_code` (`code`),
  KEY `idx_achievement_def_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_definition`
--

LOCK TABLES `achievement_definition` WRITE;
/*!40000 ALTER TABLE `achievement_definition` DISABLE KEYS */;
INSERT INTO `achievement_definition` VALUES (1,'FIRST_LOGIN','Bienvenido a GymPoint','Iniciaste sesión por primera vez','ONBOARDING','ONBOARDING_STEP_COMPLETED',1,NULL,NULL,0,'2025-11-01 01:44:36','2025-11-04 14:21:41'),(2,'STREAK_3_DAYS','Racha de 3 días','Mantuviste una racha de 3 días consecutivos','STREAK','STREAK_DAYS',3,NULL,NULL,0,'2025-11-01 01:44:36','2025-11-04 14:22:00'),(3,'STREAK_7_DAYS','Racha de 7 días','Mantuviste una racha de una semana','STREAK','STREAK_DAYS',7,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(4,'STREAK_30_DAYS','Racha de 30 días','Un mes completo de consistencia','STREAK','STREAK_DAYS',30,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(5,'FIRST_WORKOUT','Primera Asistencia','Registraste tu primera asistencia al gym','ATTENDANCE','ASSISTANCE_TOTAL',1,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(6,'WORKOUT_10','10 Entrenamientos','Completaste 10 sesiones de entrenamiento','ATTENDANCE','ASSISTANCE_TOTAL',10,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(7,'WORKOUT_50','50 Entrenamientos','Completaste 50 sesiones de entrenamiento','ATTENDANCE','ASSISTANCE_TOTAL',50,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(8,'WORKOUT_100','Centenario','100 entrenamientos completados','ATTENDANCE','ASSISTANCE_TOTAL',100,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(9,'FREQUENCY_1_WEEK','Meta Semanal','Cumpliste tu meta de frecuencia semanal','FREQUENCY','FREQUENCY_WEEKS_MET',1,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(10,'FREQUENCY_4_WEEKS','Mes Completo','Cumpliste tu meta 4 semanas seguidas','FREQUENCY','FREQUENCY_WEEKS_MET',4,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(11,'CHALLENGE_1','Primer Desafío','Completaste tu primer desafío diario','CHALLENGE','DAILY_CHALLENGE_COMPLETED_COUNT',1,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(12,'CHALLENGE_7','Semana de Desafíos','Completaste 7 desafíos diarios','CHALLENGE','DAILY_CHALLENGE_COMPLETED_COUNT',7,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(13,'TOKENS_100','Ahorrador','Acumulaste 100 tokens','TOKEN','TOKEN_BALANCE_REACHED',100,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36'),(14,'TOKENS_500','Coleccionista','Acumulaste 500 tokens','TOKEN','TOKEN_BALANCE_REACHED',500,NULL,NULL,1,'2025-11-01 01:44:36','2025-11-01 01:44:36');
/*!40000 ALTER TABLE `achievement_definition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_profiles`
--

DROP TABLE IF EXISTS `admin_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_profiles` (
  `id_admin_profile` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del perfil de administrador',
  `id_account` int NOT NULL COMMENT 'Relación 1:1 con account',
  `name` varchar(50) NOT NULL COMMENT 'Nombre del administrador',
  `lastname` varchar(50) NOT NULL COMMENT 'Apellido del administrador',
  `department` varchar(100) DEFAULT NULL COMMENT 'Departamento (IT, Support, Management, etc.)',
  `notes` text COMMENT 'Notas internas sobre el administrador',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  UNIQUE KEY `idx_admin_profiles_account` (`id_account`),
  CONSTRAINT `admin_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_profiles`
--

LOCK TABLES `admin_profiles` WRITE;
/*!40000 ALTER TABLE `admin_profiles` DISABLE KEYS */;
INSERT INTO `admin_profiles` VALUES (1,1,'Admin','Sistema','IT',NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36');
/*!40000 ALTER TABLE `admin_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assistance`
--

DROP TABLE IF EXISTS `assistance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assistance` (
  `id_assistance` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `date` date NOT NULL COMMENT 'Fecha de la asistencia',
  `check_in_time` time NOT NULL COMMENT 'Hora de entrada',
  `check_out_time` time DEFAULT NULL COMMENT 'Hora de salida',
  `duration_minutes` int DEFAULT NULL COMMENT 'Duración en minutos',
  `auto_checkin` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si fue auto check-in por geofence',
  `distance_meters` decimal(6,2) DEFAULT NULL COMMENT 'Distancia en metros al momento del check-in',
  `verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si la asistencia fue verificada',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_assistance`),
  KEY `idx_assistance_user_date` (`id_user_profile`,`date`),
  KEY `idx_assistance_gym_date` (`id_gym`,`date`),
  KEY `idx_assistance_auto_date` (`auto_checkin`,`date`),
  KEY `idx_assistance_duration` (`duration_minutes`),
  CONSTRAINT `assistance_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assistance`
--

LOCK TABLES `assistance` WRITE;
/*!40000 ALTER TABLE `assistance` DISABLE KEYS */;
INSERT INTO `assistance` VALUES (1,2,1,'2025-11-02','20:37:29',NULL,NULL,0,NULL,0,'2025-11-02 20:37:30');
/*!40000 ALTER TABLE `assistance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `claimed_reward`
--

DROP TABLE IF EXISTS `claimed_reward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `claimed_reward` (
  `id_claimed_reward` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_reward` int NOT NULL,
  `id_code` int DEFAULT NULL,
  `claimed_date` date NOT NULL,
  `status` enum('PENDING','ACTIVE','USED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `tokens_spent` int NOT NULL COMMENT 'Tokens gastados en esta recompensa',
  `used_at` datetime DEFAULT NULL COMMENT 'Cuándo se usó/canjeó la recompensa',
  `expires_at` datetime DEFAULT NULL COMMENT 'Fecha y hora de expiración de la recompensa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_claimed_reward`),
  KEY `id_reward` (`id_reward`),
  KEY `id_code` (`id_code`),
  KEY `idx_claimed_reward_user_date` (`id_user_profile`,`claimed_date`),
  KEY `idx_claimed_reward_status` (`status`),
  KEY `idx_claimed_reward_expires` (`expires_at`,`status`),
  CONSTRAINT `claimed_reward_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `claimed_reward_ibfk_2` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `claimed_reward_ibfk_3` FOREIGN KEY (`id_code`) REFERENCES `reward_code` (`id_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `claimed_reward`
--

LOCK TABLES `claimed_reward` WRITE;
/*!40000 ALTER TABLE `claimed_reward` DISABLE KEYS */;
/*!40000 ALTER TABLE `claimed_reward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_challenge`
--

DROP TABLE IF EXISTS `daily_challenge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_challenge` (
  `id_challenge` int NOT NULL AUTO_INCREMENT,
  `challenge_date` date NOT NULL COMMENT 'Fecha del desafío',
  `title` varchar(100) NOT NULL,
  `description` text,
  `challenge_type` enum('MINUTES','EXERCISES','FREQUENCY','SETS','REPS') NOT NULL COMMENT 'Tipo de desafío',
  `target_value` int NOT NULL COMMENT 'Valor objetivo del desafío',
  `target_unit` varchar(20) DEFAULT NULL COMMENT 'Unidad (minutos, ejercicios, etc.)',
  `tokens_reward` int NOT NULL DEFAULT '10' COMMENT 'Tokens otorgados al completar',
  `difficulty` enum('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
  `id_template` int DEFAULT NULL COMMENT 'Plantilla de donde se generó (NULL si es manual)',
  `auto_generated` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si fue generado automáticamente por rotación',
  `created_by` int DEFAULT NULL COMMENT 'ID del admin que lo creó (NULL si es auto-generado)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_challenge`),
  UNIQUE KEY `challenge_date` (`challenge_date`),
  KEY `id_template` (`id_template`),
  KEY `idx_daily_challenge_date_active` (`challenge_date`,`is_active`),
  CONSTRAINT `daily_challenge_ibfk_1` FOREIGN KEY (`id_template`) REFERENCES `daily_challenge_template` (`id_template`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge`
--

LOCK TABLES `daily_challenge` WRITE;
/*!40000 ALTER TABLE `daily_challenge` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_challenge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_challenge_settings`
--

DROP TABLE IF EXISTS `daily_challenge_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_challenge_settings` (
  `id_config` int NOT NULL DEFAULT '1' COMMENT 'Singleton: solo existe id=1',
  `auto_rotation_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si la rotación automática está habilitada',
  `rotation_cron` varchar(50) NOT NULL DEFAULT '1 0 * * *' COMMENT 'Cron expression para rotación (default: 00:01 diario)',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge_settings`
--

LOCK TABLES `daily_challenge_settings` WRITE;
/*!40000 ALTER TABLE `daily_challenge_settings` DISABLE KEYS */;
INSERT INTO `daily_challenge_settings` VALUES (1,1,'1 0 * * *','2025-11-01 01:44:33');
/*!40000 ALTER TABLE `daily_challenge_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_challenge_template`
--

DROP TABLE IF EXISTS `daily_challenge_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_challenge_template` (
  `id_template` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT 'Título de la plantilla',
  `description` text COMMENT 'Descripción del desafío',
  `challenge_type` enum('MINUTES','EXERCISES','FREQUENCY') NOT NULL COMMENT 'Tipo de desafío',
  `target_value` int NOT NULL COMMENT 'Valor objetivo (ej: 30 minutos, 5 ejercicios)',
  `target_unit` varchar(20) DEFAULT NULL COMMENT 'Unidad del objetivo (minutos, ejercicios, días)',
  `tokens_reward` int NOT NULL DEFAULT '10' COMMENT 'Tokens que se otorgan al completar',
  `difficulty` varchar(20) NOT NULL DEFAULT 'MEDIUM' COMMENT 'Dificultad: EASY, MEDIUM, HARD',
  `rotation_weight` int NOT NULL DEFAULT '1' COMMENT 'Peso para selección aleatoria (mayor = más probable)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si está activo para rotación',
  `created_by` int DEFAULT NULL COMMENT 'ID del admin que creó la plantilla',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_template`),
  KEY `idx_template_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge_template`
--

LOCK TABLES `daily_challenge_template` WRITE;
/*!40000 ALTER TABLE `daily_challenge_template` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_challenge_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise`
--

DROP TABLE IF EXISTS `exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise` (
  `id_exercise` int NOT NULL AUTO_INCREMENT,
  `exercise_name` varchar(100) NOT NULL,
  `muscular_group` varchar(100) NOT NULL COMMENT 'Grupo muscular principal',
  `secondary_muscles` json DEFAULT NULL COMMENT 'Músculos secundarios trabajados',
  `equipment_needed` json DEFAULT NULL COMMENT 'Equipamiento necesario',
  `difficulty_level` enum('BEGINNER','INTERMEDIATE','ADVANCED') DEFAULT NULL,
  `description` text,
  `instructions` text COMMENT 'Instrucciones del ejercicio',
  `video_url` varchar(500) DEFAULT NULL,
  `created_by` int DEFAULT NULL COMMENT 'Usuario que creó el ejercicio (NULL = sistema)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_exercise`),
  KEY `created_by` (`created_by`),
  KEY `idx_exercise_muscle_group` (`muscular_group`),
  KEY `idx_exercise_difficulty` (`difficulty_level`),
  KEY `idx_exercise_deleted` (`deleted_at`),
  CONSTRAINT `exercise_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (1,'Press de Banca','PECHO',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(2,'Press Inclinado con Mancuernas','PECHO',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(3,'Fondos en Paralelas','PECHO',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(4,'Aperturas con Mancuernas','PECHO',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(5,'Dominadas','ESPALDA',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(6,'Remo con Barra','ESPALDA',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(7,'Peso Muerto','ESPALDA',NULL,NULL,'ADVANCED',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(8,'Jalón al Pecho','ESPALDA',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(9,'Remo con Mancuerna','ESPALDA',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(10,'Sentadilla con Barra','PIERNAS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(11,'Prensa de Piernas','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(12,'Zancadas','PIERNAS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(13,'Extensión de Cuádriceps','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(14,'Curl Femoral','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(15,'Elevación de Pantorrillas','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(16,'Press Militar','HOMBROS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(17,'Elevaciones Laterales','HOMBROS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(18,'Elevaciones Frontales','HOMBROS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(19,'Pájaros','HOMBROS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(20,'Curl de Bíceps con Barra','BRAZOS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(21,'Curl Martillo','BRAZOS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(22,'Extensiones de Tríceps','BRAZOS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(23,'Fondos para Tríceps','BRAZOS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(24,'Plancha','CORE',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(25,'Crunches','CORE',NULL,NULL,'BEGINNER',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(26,'Elevación de Piernas','CORE',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL),(27,'Mountain Climbers','CORE',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,NULL,'2025-11-01 01:44:36','2025-11-01 01:44:36',NULL);
/*!40000 ALTER TABLE `exercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frequency`
--

DROP TABLE IF EXISTS `frequency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frequency` (
  `id_frequency` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL COMMENT 'Usuario al que pertenece la frecuencia',
  `goal` int NOT NULL DEFAULT '3' COMMENT 'Meta de asistencias por semana',
  `assist` int NOT NULL DEFAULT '0' COMMENT 'Asistencias en la semana actual',
  `achieved_goal` int NOT NULL DEFAULT '0' COMMENT 'Cantidad de semanas con meta cumplida',
  `week_start_date` date DEFAULT NULL COMMENT 'Fecha de inicio de la semana actual',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_frequency`),
  KEY `idx_frequency_user` (`id_user_profile`),
  KEY `idx_frequency_week` (`week_start_date`),
  CONSTRAINT `frequency_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequency`
--

LOCK TABLES `frequency` WRITE;
/*!40000 ALTER TABLE `frequency` DISABLE KEYS */;
INSERT INTO `frequency` VALUES (1,1,3,0,0,'2025-10-27','2025-11-01 01:45:03','2025-11-01 01:45:03'),(2,2,2,1,0,'2025-10-27','2025-11-01 01:56:34','2025-11-02 20:37:30'),(3,3,3,0,0,'2025-10-27','2025-11-01 02:03:28','2025-11-01 02:03:28'),(4,4,3,0,0,'2025-10-27','2025-11-01 04:48:23','2025-11-01 04:48:23'),(5,5,3,0,0,'2025-10-27','2025-11-01 05:12:53','2025-11-01 05:12:53'),(6,6,3,0,0,'2025-10-27','2025-11-01 05:14:34','2025-11-01 05:14:34'),(7,7,3,0,0,'2025-10-27','2025-11-01 05:16:06','2025-11-01 05:16:06'),(8,8,3,0,0,'2025-10-27','2025-11-01 05:18:52','2025-11-01 05:18:52'),(9,9,3,0,0,'2025-10-27','2025-11-01 05:28:55','2025-11-01 05:28:55'),(10,10,3,0,0,'2025-10-27','2025-11-02 07:10:27','2025-11-02 07:10:27'),(11,11,3,0,0,'2025-10-27','2025-11-02 07:15:00','2025-11-02 07:15:00'),(12,12,3,0,0,'2025-10-27','2025-11-02 07:17:47','2025-11-02 07:17:47'),(13,13,3,0,0,'2025-10-27','2025-11-02 07:22:26','2025-11-02 07:22:26'),(14,14,2,0,0,'2025-11-03','2025-11-03 04:03:51','2025-11-03 04:03:51');
/*!40000 ALTER TABLE `frequency` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frequency_history`
--

DROP TABLE IF EXISTS `frequency_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frequency_history` (
  `id_history` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `week_start_date` date NOT NULL COMMENT 'Inicio de la semana',
  `week_end_date` date NOT NULL COMMENT 'Fin de la semana',
  `goal` int NOT NULL COMMENT 'Meta de la semana',
  `achieved` int NOT NULL COMMENT 'Asistencias logradas',
  `goal_met` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si se cumplió la meta',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_history`),
  UNIQUE KEY `idx_frequency_history_user_week` (`id_user_profile`,`week_start_date`),
  CONSTRAINT `frequency_history_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequency_history`
--

LOCK TABLES `frequency_history` WRITE;
/*!40000 ALTER TABLE `frequency_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `frequency_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym`
--

DROP TABLE IF EXISTS `gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym` (
  `id_gym` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_media` json DEFAULT NULL COMMENT 'Redes sociales: {facebook, instagram, twitter, etc.}',
  `equipment` json DEFAULT NULL COMMENT 'Equipamiento por categoría: { "fuerza": [{ "name": "Banco press", "quantity": 4 }], "cardio": [...] }',
  `services` json DEFAULT NULL COMMENT 'Array de servicios/tipos: ["Funcional", "CrossFit", "Musculación"]',
  `month_price` double DEFAULT NULL,
  `week_price` double DEFAULT NULL,
  `max_capacity` int DEFAULT NULL COMMENT 'Capacidad máxima de personas',
  `area_sqm` decimal(10,2) DEFAULT NULL COMMENT 'Área en metros cuadrados',
  `verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el gimnasio está verificado por el sistema',
  `featured` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es destacado en la app',
  `photo_url` varchar(500) DEFAULT NULL COMMENT 'URL de foto principal',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'URL del logo',
  `rules` json DEFAULT NULL COMMENT 'Reglas del gimnasio (array de strings)',
  `instagram` varchar(100) DEFAULT NULL COMMENT 'Usuario de Instagram (sin @)',
  `facebook` varchar(100) DEFAULT NULL COMMENT 'Usuario o página de Facebook',
  `google_maps_url` varchar(500) DEFAULT NULL COMMENT 'URL completa de Google Maps para navegación',
  `geofence_radius_meters` int NOT NULL DEFAULT '150' COMMENT 'Radio de geofence para auto check-in en metros',
  `auto_checkin_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si el auto check-in está habilitado',
  `min_stay_minutes` int NOT NULL DEFAULT '10' COMMENT 'Tiempo mínimo de estadía para confirmar check-in',
  `trial_allowed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el gimnasio permite visitas de prueba sin suscripción',
  `registration_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete',
  PRIMARY KEY (`id_gym`),
  KEY `idx_gym_city` (`city`),
  KEY `idx_gym_verified_featured` (`verified`,`featured`),
  KEY `idx_gym_location` (`latitude`,`longitude`),
  KEY `idx_gym_deleted` (`deleted_at`),
  KEY `idx_gym_instagram` (`instagram`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym`
--

LOCK TABLES `gym` WRITE;
/*!40000 ALTER TABLE `gym` DISABLE KEYS */;
INSERT INTO `gym` VALUES (1,'GONZA GYM','ignasio no gei no nuria','Resistencia','Avenida San Martín 3099, Resistencia, Provincia de Chaco, H3504, Argentina',-27.47967311,-59.00936612,'3624316647',NULL,NULL,NULL,NULL,'{\"BARRAS\": [{\"name\": \"OLIMPICAS\", \"quantity\": 10}, {\"name\": \"BARRA W\", \"quantity\": 4}], \"Máquinas\": [{\"name\": \"PRENSAS\", \"quantity\": 24}, {\"name\": \"CAMILLA CUADRICEPS\", \"quantity\": 90}]}','[\"Pesas\"]',10000,NULL,NULL,NULL,0,0,NULL,NULL,'[\"No mirar culos\", \"No ser gei\", \"No lesbiana\", \"No nurias\"]',NULL,NULL,NULL,100,1,30,0,'2025-11-01 22:47:23','2025-11-01 22:47:23','2025-11-01 22:48:18',NULL),(2,'gay','Sin descripción proporcionada','Resistencia','Bartolomé Mitre 300, Resistencia, Provincia de Chaco, 3500, Argentina',-27.44819580,-58.98492420,'31154554664565',NULL,NULL,NULL,NULL,'{\"Fuerza\": [], \"Máquinas\": [{\"name\": \"Prensa\", \"quantity\": 5}, {\"name\": \"PENE\", \"quantity\": 10}]}','[\"Funcional\", \"Pesas\"]',1.2030121231231233e51,NULL,NULL,NULL,0,0,NULL,NULL,'[\"Llevar toalla\", \"NO SER GAY\"]',NULL,NULL,NULL,100,0,30,0,'2025-11-04 14:11:09','2025-11-04 14:11:09','2025-11-04 14:11:09',NULL);
/*!40000 ALTER TABLE `gym` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_amenity`
--

DROP TABLE IF EXISTS `gym_amenity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_amenity` (
  `id_amenity` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Nombre de la amenidad (Ducha, Locker, WiFi, etc.)',
  `category` varchar(50) DEFAULT NULL COMMENT 'Categoría (FACILITY, SERVICE, EQUIPMENT)',
  `icon_name` varchar(50) DEFAULT NULL COMMENT 'Nombre del ícono para la UI',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_amenity`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_amenity`
--

LOCK TABLES `gym_amenity` WRITE;
/*!40000 ALTER TABLE `gym_amenity` DISABLE KEYS */;
INSERT INTO `gym_amenity` VALUES (1,'Duchas','FACILITY','shower','2025-11-01 01:44:36'),(2,'Lockers','FACILITY','locker','2025-11-01 01:44:36'),(3,'WiFi','FACILITY','wifi','2025-11-01 01:44:36'),(4,'Estacionamiento','FACILITY','parking','2025-11-01 01:44:36'),(5,'Aire Acondicionado','FACILITY','ac','2025-11-01 01:44:36'),(6,'Vestuarios','FACILITY','changing-room','2025-11-01 01:44:36'),(7,'Agua Potable','FACILITY','water','2025-11-01 01:44:36'),(8,'Entrenador Personal','SERVICE','trainer','2025-11-01 01:44:36'),(9,'Clases Grupales','SERVICE','group-class','2025-11-01 01:44:36'),(10,'Nutricionista','SERVICE','nutrition','2025-11-01 01:44:36'),(11,'Sauna','FACILITY','sauna','2025-11-01 01:44:36'),(12,'Piscina','FACILITY','pool','2025-11-01 01:44:36'),(13,'Máquinas Cardio','EQUIPMENT','cardio','2025-11-01 01:44:36'),(14,'Pesas Libres','EQUIPMENT','weights','2025-11-01 01:44:36'),(15,'Máquinas de Fuerza','EQUIPMENT','machines','2025-11-01 01:44:36'),(16,'Área Funcional','EQUIPMENT','functional','2025-11-01 01:44:36'),(17,'Barras y Discos','EQUIPMENT','barbell','2025-11-01 01:44:36'),(18,'Mancuernas','EQUIPMENT','dumbbell','2025-11-01 01:44:36');
/*!40000 ALTER TABLE `gym_amenity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_gym_amenity`
--

DROP TABLE IF EXISTS `gym_gym_amenity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_gym_amenity` (
  `id_gym` int NOT NULL,
  `id_amenity` int NOT NULL,
  `notes` text COMMENT 'Notas adicionales sobre esta amenidad en este gym',
  PRIMARY KEY (`id_gym`,`id_amenity`),
  KEY `idx_gym_amenity_amenity` (`id_amenity`),
  CONSTRAINT `gym_gym_amenity_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_gym_amenity_ibfk_2` FOREIGN KEY (`id_amenity`) REFERENCES `gym_amenity` (`id_amenity`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_gym_amenity`
--

LOCK TABLES `gym_gym_amenity` WRITE;
/*!40000 ALTER TABLE `gym_gym_amenity` DISABLE KEYS */;
INSERT INTO `gym_gym_amenity` VALUES (1,1,NULL),(1,3,NULL),(2,3,NULL);
/*!40000 ALTER TABLE `gym_gym_amenity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_payment`
--

DROP TABLE IF EXISTS `gym_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_payment` (
  `id_payment` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `period_start` date DEFAULT NULL COMMENT 'Inicio del período pagado',
  `period_end` date DEFAULT NULL COMMENT 'Fin del período pagado',
  `status` enum('PENDING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id_payment`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_gym_payment_user_gym` (`id_user_profile`,`id_gym`),
  KEY `idx_gym_payment_date_status` (`payment_date`,`status`),
  CONSTRAINT `gym_payment_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_payment`
--

LOCK TABLES `gym_payment` WRITE;
/*!40000 ALTER TABLE `gym_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_rating_stats`
--

DROP TABLE IF EXISTS `gym_rating_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_rating_stats` (
  `id_gym` int NOT NULL,
  `avg_rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `total_reviews` int NOT NULL DEFAULT '0',
  `rating_5_count` int NOT NULL DEFAULT '0',
  `rating_4_count` int NOT NULL DEFAULT '0',
  `rating_3_count` int NOT NULL DEFAULT '0',
  `rating_2_count` int NOT NULL DEFAULT '0',
  `rating_1_count` int NOT NULL DEFAULT '0',
  `avg_cleanliness` decimal(3,2) NOT NULL DEFAULT '0.00',
  `avg_equipment` decimal(3,2) NOT NULL DEFAULT '0.00',
  `avg_staff` decimal(3,2) NOT NULL DEFAULT '0.00',
  `avg_value` decimal(3,2) NOT NULL DEFAULT '0.00',
  `last_review_date` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_gym`),
  KEY `idx_gym_stats_rating` (`avg_rating`),
  CONSTRAINT `gym_rating_stats_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_rating_stats`
--

LOCK TABLES `gym_rating_stats` WRITE;
/*!40000 ALTER TABLE `gym_rating_stats` DISABLE KEYS */;
INSERT INTO `gym_rating_stats` VALUES (1,4.00,1,0,1,0,0,0,0.00,0.00,0.00,0.00,'2025-11-04 13:55:04','2025-11-04 13:55:04'),(2,3.00,1,0,0,1,0,0,0.00,0.00,0.00,0.00,'2025-11-04 14:12:55','2025-11-04 14:12:55');
/*!40000 ALTER TABLE `gym_rating_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_request`
--

DROP TABLE IF EXISTS `gym_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_request` (
  `id_gym_request` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Nombre del gimnasio',
  `description` text COMMENT 'Descripción del gimnasio',
  `city` varchar(50) NOT NULL COMMENT 'Ciudad',
  `address` varchar(200) NOT NULL COMMENT 'Dirección física',
  `latitude` decimal(10,8) DEFAULT NULL COMMENT 'Latitud geográfica',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT 'Longitud geográfica',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Teléfono de contacto',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email de contacto',
  `website` varchar(255) DEFAULT NULL COMMENT 'Sitio web',
  `instagram` varchar(100) DEFAULT NULL COMMENT 'Usuario de Instagram',
  `facebook` varchar(100) DEFAULT NULL COMMENT 'Página de Facebook',
  `photos` json DEFAULT NULL COMMENT 'URLs de fotos del gimnasio',
  `equipment` json DEFAULT NULL COMMENT 'Equipamiento categorizado: { "fuerza": [{ "name": "Banco press", "quantity": 4 }], "cardio": [...] }',
  `services` json DEFAULT NULL COMMENT 'Servicios/tipos ofrecidos: ["Funcional", "CrossFit", "Musculación"]',
  `rules` json DEFAULT NULL COMMENT 'Reglas del gimnasio',
  `monthly_price` double DEFAULT NULL COMMENT 'Precio mensual',
  `weekly_price` double DEFAULT NULL COMMENT 'Precio semanal',
  `daily_price` double DEFAULT NULL COMMENT 'Precio diario',
  `schedule` json DEFAULT NULL COMMENT 'Horarios de atención por día',
  `amenities` json DEFAULT NULL COMMENT 'Amenidades y servicios del gimnasio',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la solicitud',
  `rejection_reason` text COMMENT 'Razón de rechazo',
  `id_gym` int DEFAULT NULL COMMENT 'ID del gimnasio creado tras aprobación',
  `processed_by` int DEFAULT NULL COMMENT 'ID del admin que procesó la solicitud',
  `processed_at` datetime DEFAULT NULL COMMENT 'Fecha de procesamiento',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_gym_request`),
  KEY `fk_gym_request_gym` (`id_gym`),
  KEY `idx_gym_request_status` (`status`),
  KEY `idx_gym_request_city` (`city`),
  KEY `idx_gym_request_created` (`created_at`),
  CONSTRAINT `fk_gym_request_gym` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_request`
--

LOCK TABLES `gym_request` WRITE;
/*!40000 ALTER TABLE `gym_request` DISABLE KEYS */;
INSERT INTO `gym_request` VALUES (1,'GONZA GYM','ignasio no gei no nuria','Resistencia','Avenida San Martín 3099, Resistencia, Provincia de Chaco, H3504, Argentina',-27.47967311,-59.00936612,'3624316647',NULL,NULL,NULL,NULL,'[\"https://res.cloudinary.com/dkl24l8en/image/upload/v1762037064/gympoint/gyms/wiaqfjblmlntkz59zns5.jpg\", \"https://res.cloudinary.com/dkl24l8en/image/upload/v1762037073/gympoint/gyms/cwsojz6xu6mbbgyrubyh.jpg\"]','{\"BARRAS\": [{\"name\": \"OLIMPICAS\", \"quantity\": 10}, {\"name\": \"BARRA W\", \"quantity\": 4}], \"Máquinas\": [{\"name\": \"PRENSAS\", \"quantity\": 24}, {\"name\": \"CAMILLA CUADRICEPS\", \"quantity\": 90}]}','[\"Pesas\"]','[\"No mirar culos\", \"No ser gei\", \"No lesbiana\", \"No nurias\"]',10000,5000,1000,'[{\"day\": \"lunes\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"martes\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"miércoles\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"jueves\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"viernes\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"sábado\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"domingo\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}]','[1, 3]','approved',NULL,1,1,'2025-11-01 22:47:23','2025-11-01 22:46:45','2025-11-01 22:47:23'),(2,'gay','Sin descripción proporcionada','Resistencia','Bartolomé Mitre 300, Resistencia, Provincia de Chaco, 3500, Argentina',-27.44819580,-58.98492420,'31154554664565',NULL,NULL,NULL,NULL,'[]','{\"Fuerza\": [], \"Máquinas\": [{\"name\": \"Prensa\", \"quantity\": 5}, {\"name\": \"PENE\", \"quantity\": 10}]}','[\"Funcional\", \"Pesas\"]','[\"Llevar toalla\", \"NO SER GAY\"]',1.2030121231231231e51,123123,123121,'[{\"day\": \"lunes\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"martes\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"miércoles\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"jueves\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"viernes\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"sábado\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}, {\"day\": \"domingo\", \"opens\": \"07:00\", \"closes\": \"22:00\", \"is_open\": true}]','[3]','approved',NULL,2,1,'2025-11-04 14:11:09','2025-11-04 14:10:59','2025-11-04 14:11:09');
/*!40000 ALTER TABLE `gym_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_review`
--

DROP TABLE IF EXISTS `gym_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_review` (
  `id_review` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `id_user_profile` int NOT NULL,
  `rating` decimal(2,1) NOT NULL COMMENT 'Rating general (1.0 - 5.0)',
  `title` varchar(100) DEFAULT NULL,
  `comment` text,
  `cleanliness_rating` tinyint DEFAULT NULL COMMENT 'Rating de limpieza (1-5)',
  `equipment_rating` tinyint DEFAULT NULL COMMENT 'Rating de equipamiento (1-5)',
  `staff_rating` tinyint DEFAULT NULL COMMENT 'Rating de personal (1-5)',
  `value_rating` tinyint DEFAULT NULL COMMENT 'Rating de relación calidad-precio (1-5)',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si la review está verificada (usuario asistió al gym)',
  `helpful_count` int NOT NULL DEFAULT '0' COMMENT 'Cantidad de usuarios que marcaron como útil',
  `reported` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `uniq_user_gym_review` (`id_user_profile`,`id_gym`),
  KEY `idx_gym_rating` (`id_gym`,`rating`),
  KEY `idx_review_created_at` (`created_at`),
  CONSTRAINT `gym_review_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_review_ibfk_2` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_review`
--

LOCK TABLES `gym_review` WRITE;
/*!40000 ALTER TABLE `gym_review` DISABLE KEYS */;
INSERT INTO `gym_review` VALUES (2,1,2,4.0,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,'2025-11-04 13:55:04','2025-11-04 13:55:04'),(3,2,2,3.0,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,'2025-11-04 14:12:55','2025-11-04 14:12:55');
/*!40000 ALTER TABLE `gym_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_schedule`
--

DROP TABLE IF EXISTS `gym_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_schedule` (
  `id_schedule` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `day_of_week` tinyint NOT NULL COMMENT '0=Domingo, 1=Lunes, ..., 6=Sábado',
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si está cerrado ese día',
  PRIMARY KEY (`id_schedule`),
  KEY `idx_gym_schedule_gym_day` (`id_gym`,`day_of_week`),
  CONSTRAINT `gym_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_schedule`
--

LOCK TABLES `gym_schedule` WRITE;
/*!40000 ALTER TABLE `gym_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_special_schedule`
--

DROP TABLE IF EXISTS `gym_special_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_special_schedule` (
  `id_special_schedule` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `date` date NOT NULL COMMENT 'Fecha específica (feriados, eventos especiales)',
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `reason` varchar(255) DEFAULT NULL COMMENT 'Razón del horario especial',
  PRIMARY KEY (`id_special_schedule`),
  UNIQUE KEY `idx_gym_special_schedule_gym_date` (`id_gym`,`date`),
  CONSTRAINT `gym_special_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_special_schedule`
--

LOCK TABLES `gym_special_schedule` WRITE;
/*!40000 ALTER TABLE `gym_special_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_special_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id_media` int NOT NULL AUTO_INCREMENT,
  `entity_type` enum('USER_PROFILE','GYM','EXERCISE','PROGRESS','REVIEW') NOT NULL COMMENT 'Tipo de entidad a la que pertenece',
  `entity_id` int NOT NULL COMMENT 'ID de la entidad',
  `media_type` enum('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE',
  `url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `file_size` int DEFAULT NULL COMMENT 'Tamaño en bytes',
  `mime_type` varchar(100) DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es la imagen principal',
  `display_order` int NOT NULL DEFAULT '0',
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_media`),
  KEY `idx_media_entity` (`entity_type`,`entity_id`),
  KEY `idx_media_primary` (`entity_type`,`entity_id`,`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mercadopago_payment`
--

DROP TABLE IF EXISTS `mercadopago_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mercadopago_payment` (
  `id_mp_payment` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_gym` int DEFAULT NULL COMMENT 'Gimnasio si el pago es por suscripción',
  `payment_id` varchar(100) DEFAULT NULL COMMENT 'ID del pago en MercadoPago',
  `preference_id` varchar(100) DEFAULT NULL COMMENT 'ID de la preferencia de pago',
  `status` enum('PENDING','APPROVED','AUTHORIZED','IN_PROCESS','IN_MEDIATION','REJECTED','CANCELLED','REFUNDED','CHARGED_BACK') NOT NULL DEFAULT 'PENDING',
  `status_detail` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'ARS' COMMENT 'Código de moneda (ISO 4217)',
  `description` text,
  `subscription_type` enum('MONTHLY','WEEKLY','DAILY','ANNUAL') DEFAULT NULL,
  `payment_method_id` varchar(50) DEFAULT NULL,
  `payment_type_id` varchar(50) DEFAULT NULL,
  `payer_email` varchar(100) DEFAULT NULL,
  `external_reference` varchar(255) DEFAULT NULL COMMENT 'Referencia externa del negocio',
  `metadata` json DEFAULT NULL COMMENT 'Información adicional del pago',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mp_payment`),
  UNIQUE KEY `payment_id` (`payment_id`),
  UNIQUE KEY `idx_mp_payment_id` (`payment_id`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_mp_preference_id` (`preference_id`),
  KEY `idx_mp_status` (`status`),
  KEY `idx_mp_user_gym` (`id_user_profile`,`id_gym`),
  CONSTRAINT `mercadopago_payment_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mercadopago_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mercadopago_payment`
--

LOCK TABLES `mercadopago_payment` WRITE;
/*!40000 ALTER TABLE `mercadopago_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `mercadopago_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id_notification` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `type` enum('REMINDER','ACHIEVEMENT','REWARD','GYM_UPDATE','PAYMENT','SOCIAL','SYSTEM','CHALLENGE') NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL COMMENT 'Datos adicionales (deep links, etc.)',
  `priority` enum('LOW','NORMAL','HIGH') NOT NULL DEFAULT 'NORMAL',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `scheduled_for` datetime DEFAULT NULL COMMENT 'Fecha programada de envío',
  `sent_at` datetime DEFAULT NULL COMMENT 'Fecha real de envío',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notification`),
  KEY `idx_notification_user_read` (`id_user_profile`,`is_read`,`created_at`),
  KEY `idx_notification_scheduled` (`scheduled_for`,`sent_at`),
  KEY `idx_notification_type` (`type`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presence`
--

DROP TABLE IF EXISTS `presence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presence` (
  `id_presence` bigint NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL COMMENT 'Usuario detectado en geofence',
  `id_gym` int NOT NULL COMMENT 'Gimnasio donde se detectó presencia',
  `first_seen_at` datetime NOT NULL COMMENT 'Primera detección en geofence',
  `last_seen_at` datetime NOT NULL COMMENT 'Última actualización de ubicación',
  `exited_at` datetime DEFAULT NULL COMMENT 'Cuándo salió del geofence',
  `status` enum('DETECTING','CONFIRMED','EXITED') NOT NULL DEFAULT 'DETECTING' COMMENT 'DETECTING: detectando presencia, CONFIRMED: check-in confirmado, EXITED: salió del gym',
  `converted_to_assistance` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si se convirtió en registro de asistencia',
  `id_assistance` int DEFAULT NULL COMMENT 'ID de la asistencia creada (si se confirmó)',
  `distance_meters` decimal(6,2) DEFAULT NULL COMMENT 'Distancia al centro del gimnasio en metros',
  `accuracy_meters` decimal(6,2) DEFAULT NULL COMMENT 'Precisión del GPS en metros',
  `location_updates_count` int NOT NULL DEFAULT '1' COMMENT 'Cantidad de actualizaciones de ubicación recibidas',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_presence`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_presence_user_gym` (`id_user_profile`,`id_gym`),
  KEY `idx_presence_status` (`status`),
  KEY `idx_presence_assistance` (`id_assistance`),
  CONSTRAINT `presence_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `presence_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `presence_ibfk_3` FOREIGN KEY (`id_assistance`) REFERENCES `assistance` (`id_assistance`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presence`
--

LOCK TABLES `presence` WRITE;
/*!40000 ALTER TABLE `presence` DISABLE KEYS */;
/*!40000 ALTER TABLE `presence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress` (
  `id_progress` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `date` date NOT NULL,
  `total_weight_lifted` decimal(12,2) DEFAULT NULL,
  `total_reps` int DEFAULT NULL,
  `total_sets` int DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_progress`),
  UNIQUE KEY `idx_progress_user_date` (`id_user_profile`,`date`),
  CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress`
--

LOCK TABLES `progress` WRITE;
/*!40000 ALTER TABLE `progress` DISABLE KEYS */;
INSERT INTO `progress` VALUES (4,3,'2025-09-15',2400.00,30,10,NULL,'2025-11-01 02:07:01'),(5,3,'2025-10-10',2600.00,32,11,NULL,'2025-11-01 02:07:01'),(6,3,'2025-10-28',2800.00,34,12,NULL,'2025-11-01 02:07:01'),(7,2,'2025-09-01',2100.00,28,9,NULL,'2025-11-01 02:25:32'),(8,2,'2025-10-01',2400.00,30,10,NULL,'2025-11-01 02:25:32'),(9,2,'2025-10-15',2600.00,32,11,NULL,'2025-11-01 02:25:32');
/*!40000 ALTER TABLE `progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress_exercise`
--

DROP TABLE IF EXISTS `progress_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress_exercise` (
  `id_progress_exercise` int NOT NULL AUTO_INCREMENT,
  `id_progress` int NOT NULL,
  `id_exercise` int NOT NULL,
  `max_weight` decimal(6,2) DEFAULT NULL COMMENT 'Peso máximo levantado (PR)',
  `max_reps` int DEFAULT NULL COMMENT 'Repeticiones máximas',
  `total_volume` decimal(10,2) DEFAULT NULL COMMENT 'Volumen total (peso × reps × series)',
  PRIMARY KEY (`id_progress_exercise`),
  KEY `idx_progress_exercise_progress` (`id_progress`),
  KEY `idx_progress_exercise_max` (`id_exercise`,`max_weight`),
  CONSTRAINT `progress_exercise_ibfk_1` FOREIGN KEY (`id_progress`) REFERENCES `progress` (`id_progress`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `progress_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress_exercise`
--

LOCK TABLES `progress_exercise` WRITE;
/*!40000 ALTER TABLE `progress_exercise` DISABLE KEYS */;
INSERT INTO `progress_exercise` VALUES (10,4,1,80.00,10,800.00),(11,4,10,100.00,8,800.00),(12,4,7,120.00,6,720.00),(13,5,1,85.00,10,850.00),(14,5,10,110.00,8,880.00),(15,5,7,130.00,6,780.00),(16,6,1,90.00,10,900.00),(17,6,10,120.00,8,960.00),(18,6,7,140.00,6,840.00),(19,7,1,70.00,10,2100.00),(20,7,10,90.00,8,2160.00),(21,7,7,110.00,6,1980.00),(22,8,1,75.00,10,2250.00),(23,8,10,100.00,8,3200.00),(24,8,7,120.00,6,2160.00),(25,9,1,80.00,10,3200.00),(26,9,10,110.00,8,3520.00),(27,9,7,130.00,6,2340.00);
/*!40000 ALTER TABLE `progress_exercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `id_refresh_token` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del refresh token',
  `id_account` int NOT NULL COMMENT 'Cuenta asociada',
  `token` varchar(500) NOT NULL COMMENT 'Refresh token JWT',
  `expires_at` datetime NOT NULL COMMENT 'Fecha de expiración',
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el token ha sido revocado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_refresh_token`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_refresh_token_account` (`id_account`),
  KEY `idx_refresh_token_expiration` (`expires_at`,`is_revoked`),
  CONSTRAINT `refresh_token_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES (1,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoyLCJpYXQiOjE3NjE5NjE1MDMsImV4cCI6MTc2NDU1MzUwM30.qnBjoy7jlzr-mxMEDyha3JzAkmEopiI0sb2w_tmw6Tg','2025-12-01 01:45:03',0,'2025-11-01 01:45:03'),(2,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjIxOTQsImV4cCI6MTc2NDU1NDE5NH0.WK4GjUZ7xLrbm5u_G7qCJJ8dU0gxzMCKzSv2ITX-e0U','2025-12-01 01:56:34',0,'2025-11-01 01:56:34'),(3,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjIyMDYsImV4cCI6MTc2NDU1NDIwNn0.JC5YHAdHpri93sJ-NceM7js7T60NCmKE4C-AlKUg8Q0','2025-12-01 01:56:46',0,'2025-11-01 01:56:46'),(4,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo0LCJpYXQiOjE3NjE5NjI2MDgsImV4cCI6MTc2NDU1NDYwOH0.2w44EaqkcmUkQF0F7yHGJyvVBzgPa9nJlNGwW8hhgng','2025-12-01 02:03:28',0,'2025-11-01 02:03:28'),(5,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjM3OTYsImV4cCI6MTc2NDU1NTc5Nn0.9PGz5jdiXdXDyeLpKFvGokT6I9uS-ulbzV8az47M0QI','2025-12-01 02:23:16',0,'2025-11-01 02:23:16'),(6,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjM4ODUsImV4cCI6MTc2NDU1NTg4NX0.eLwyGGAbCgclq2h8emLtfSmfg5cwM3COorVIoyeTP8c','2025-12-01 02:24:45',0,'2025-11-01 02:24:45'),(7,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjM5NjgsImV4cCI6MTc2NDU1NTk2OH0.reusLOtQkvSGJtHKTFixlNjGtoDOnjDaKoRToTKwhww','2025-12-01 02:26:08',0,'2025-11-01 02:26:08'),(8,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjQzMDksImV4cCI6MTc2NDU1NjMwOX0.KAC_ePTGEKsk6L3gOGU2OwEj4-CmAnBte5HQm2OY348','2025-12-01 02:31:49',0,'2025-11-01 02:31:49'),(9,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjUzNzcsImV4cCI6MTc2NDU1NzM3N30.xp6gy2pyh9opZAziHACQ2P33r63XH3AysBQjz8JNCSY','2025-12-01 02:49:37',0,'2025-11-01 02:49:37'),(10,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjU1MzcsImV4cCI6MTc2NDU1NzUzN30.ywR-mow575zcDFDw0MKptPHBukfIbVzupdwzHUxRXkU','2025-12-01 02:52:17',0,'2025-11-01 02:52:17'),(11,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjU2NjEsImV4cCI6MTc2NDU1NzY2MX0.HhTTXwXjXox4IKmnejO2WKhFdsx6u-fP8n8E2zYGdgU','2025-12-01 02:54:21',0,'2025-11-01 02:54:21'),(12,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjYxMTAsImV4cCI6MTc2NDU1ODExMH0.YPoZu2ptzLbBvg75n7PWOjCxMswjTynySeM6Jox2ECE','2025-12-01 03:01:50',0,'2025-11-01 03:01:50'),(13,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjYyMzYsImV4cCI6MTc2NDU1ODIzNn0._iRPYi8Co-C796WCRwVP2TKkeI70S42GnyuPHsokC40','2025-12-01 03:03:56',0,'2025-11-01 03:03:56'),(14,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjY2NTgsImV4cCI6MTc2NDU1ODY1OH0.X3bXpO6GRipfx2AKKqOTefEBuHdUnD3UHPvCmtstAn0','2025-12-01 03:10:58',0,'2025-11-01 03:10:58'),(15,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjY3ODAsImV4cCI6MTc2NDU1ODc4MH0.1oI-TxgLGJjx8aXNdfk99_xpYvL3u7L7CUBSmNMyRLo','2025-12-01 03:13:00',0,'2025-11-01 03:13:00'),(16,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjY5OTMsImV4cCI6MTc2NDU1ODk5M30.1YIPfvlAtRCNpaa31gbBUgAN2a5HbSBI0S0GRljBf38','2025-12-01 03:16:33',0,'2025-11-01 03:16:33'),(17,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjcxMzQsImV4cCI6MTc2NDU1OTEzNH0.jvzSYY-x5jw9L1cQfvDLesDRpsLmUofo9waICXqZsUk','2025-12-01 03:18:54',0,'2025-11-01 03:18:54'),(18,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjcyMDUsImV4cCI6MTc2NDU1OTIwNX0.gRLr5SJXuDd7RXf-mNGdfNV4ci9Ztq-raFIP0suxAJE','2025-12-01 03:20:05',0,'2025-11-01 03:20:05'),(19,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjcyNTAsImV4cCI6MTc2NDU1OTI1MH0.XSF7JKfl0BYJ35CfeS-SbWuPVk-PN0VZw9HTcyQ9Nqw','2025-12-01 03:20:50',0,'2025-11-01 03:20:50'),(20,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Njc0NTcsImV4cCI6MTc2NDU1OTQ1N30.pi6fx1HNLWP2YbGC7zFufQ1GWpojiBzWb4S0u-VIDbs','2025-12-01 03:24:17',0,'2025-11-01 03:24:17'),(21,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Njc1NTYsImV4cCI6MTc2NDU1OTU1Nn0.tQGfBcwGPhLnUXZs0assW79p4lh-ct7brTO1-CWOfcs','2025-12-01 03:25:56',0,'2025-11-01 03:25:56'),(22,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Njc5NTUsImV4cCI6MTc2NDU1OTk1NX0.ra2dltsl2-Jvr6fNAcmSfHAfgnKrUt_92aH5T35hclg','2025-12-01 03:32:35',0,'2025-11-01 03:32:35'),(23,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjgxOTMsImV4cCI6MTc2NDU2MDE5M30.8-umBHuvsSQZzovbRhzmpI9AKZgZed3JVsiobYtsc2o','2025-12-01 03:36:33',0,'2025-11-01 03:36:33'),(24,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjgyNTUsImV4cCI6MTc2NDU2MDI1NX0.Kgx2SE2SdbD7MIq-zvjgzL-YykfN38lQVRchIxvefwo','2025-12-01 03:37:35',0,'2025-11-01 03:37:35'),(25,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Njg3OTAsImV4cCI6MTc2NDU2MDc5MH0.oD1VvooeG6J4yktq763EsLJU33pKwtMt1g40rnw1NTA','2025-12-01 03:46:30',0,'2025-11-01 03:46:30'),(26,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Njg4NzgsImV4cCI6MTc2NDU2MDg3OH0.C3NIxSAobydF0icm2YSK0hlLH_8rwjKhWJhMlRgjknY','2025-12-01 03:47:58',0,'2025-11-01 03:47:58'),(27,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NjkxNjIsImV4cCI6MTc2NDU2MTE2Mn0.sb3vT-4MAXEqw1fvBM-oSd9924uWQ8u23wDFBPjozZs','2025-12-01 03:52:42',0,'2025-11-01 03:52:42'),(28,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Njk5MTQsImV4cCI6MTc2NDU2MTkxNH0.bs2WWUvm787T79ju2bDIjMzcJwFvZU7Mz7k21dpvXbU','2025-12-01 04:05:14',0,'2025-11-01 04:05:14'),(29,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzAyOTgsImV4cCI6MTc2NDU2MjI5OH0.5kNrFFeEH8-0E3BZsiJ9hLZIL-z-NXN9Jc4U8rieACQ','2025-12-01 04:11:38',0,'2025-11-01 04:11:38'),(30,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzA1NDgsImV4cCI6MTc2NDU2MjU0OH0.07VuwLbXS6tpIOSHsH63zHZ5SD3jLbCD3vhiHeofWV0','2025-12-01 04:15:48',0,'2025-11-01 04:15:48'),(31,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzA2NzgsImV4cCI6MTc2NDU2MjY3OH0.gEvv4rlWExr6GgSUpTzJWUmQr5ZuPh1swIKBBGNIOE0','2025-12-01 04:17:58',0,'2025-11-01 04:17:58'),(32,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzEzODAsImV4cCI6MTc2NDU2MzM4MH0.BWzvjVVWj1lBxpE1mT8wDwzhZ4YAstssTPWTAKJk-WA','2025-12-01 04:29:40',0,'2025-11-01 04:29:40'),(33,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzE4MzIsImV4cCI6MTc2NDU2MzgzMn0.cUpzCb7tbxpkOyjcyK9l0yvkyUGMjpOmnIzjg5kLsJs','2025-12-01 04:37:12',0,'2025-11-01 04:37:12'),(34,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzIxNzgsImV4cCI6MTc2NDU2NDE3OH0.S2nqiWRJVFwamUzul6FOoJBMBOXqu7woLIQXflOBWak','2025-12-01 04:42:58',0,'2025-11-01 04:42:58'),(35,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzI0MDksImV4cCI6MTc2NDU2NDQwOX0.vI4qwExiiOtajE8ZVActTEo9SCJHlHzUg7lX_ScGit8','2025-12-01 04:46:49',0,'2025-11-01 04:46:49'),(36,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzI0OTMsImV4cCI6MTc2NDU2NDQ5M30.C7DYJ1_WeYH2c_qXrNNtV4PoiRSdxlk0AR07YJJyq8Q','2025-12-01 04:48:13',0,'2025-11-01 04:48:13'),(37,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzI1MDMsImV4cCI6MTc2NDU2NDUwM30.5-vDONrog6lJETJ2DZ7wQCg07QXoG5tI5ZFCxoGymI8','2025-12-01 04:48:23',0,'2025-11-01 04:48:23'),(38,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzI3NjEsImV4cCI6MTc2NDU2NDc2MX0.IrzONIx3O0JhzLpfaOO5BB4mwoa72BG6qoVvTz9UY_M','2025-12-01 04:52:41',0,'2025-11-01 04:52:41'),(39,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzMwMTMsImV4cCI6MTc2NDU2NTAxM30.Nga-dJWe5MeQsSJ8tPqiIz8gYYccIhCDae-DR4712N8','2025-12-01 04:56:53',0,'2025-11-01 04:56:53'),(40,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzMxMzAsImV4cCI6MTc2NDU2NTEzMH0.eFcg85spNmazs7438xWMpldmP3QIVQDltvz_puayyH0','2025-12-01 04:58:50',0,'2025-11-01 04:58:50'),(41,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzMzNTAsImV4cCI6MTc2NDU2NTM1MH0.-Gz37EJkJkGnaqx7l2lmXsElgMJOti7yFL18NEfaVLk','2025-12-01 05:02:30',0,'2025-11-01 05:02:30'),(42,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzM1NzYsImV4cCI6MTc2NDU2NTU3Nn0.Fmbr6niezNM6TLPNJoOFGf_5ivfvgzEM4aH0p20v54k','2025-12-01 05:06:16',0,'2025-11-01 05:06:16'),(43,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzM2ODcsImV4cCI6MTc2NDU2NTY4N30.3Ywi65ytReIW_uBKJHcGVkk7PAjj1GsjiMMsJBn-qVA','2025-12-01 05:08:07',0,'2025-11-01 05:08:07'),(44,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzM4NDEsImV4cCI6MTc2NDU2NTg0MX0.RdjzmWJMgswl52r7EilNeFAaFQo9SZ9-ydDYhE2ggzE','2025-12-01 05:10:41',0,'2025-11-01 05:10:41'),(45,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo1LCJpYXQiOjE3NjE5NzM5MzcsImV4cCI6MTc2NDU2NTkzN30.TZwYc4H_GZtAk7S53wF5I68Fw4q7SN2NoF-Jm8aCxVI','2025-12-01 05:12:17',0,'2025-11-01 05:12:17'),(46,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo2LCJpYXQiOjE3NjE5NzM5NzQsImV4cCI6MTc2NDU2NTk3NH0.NKKgnH8d74k4adV-wpfZRGi6XUIQHbCOVtZ9xIecSeo','2025-12-01 05:12:54',0,'2025-11-01 05:12:54'),(47,7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo3LCJpYXQiOjE3NjE5NzQwNzQsImV4cCI6MTc2NDU2NjA3NH0.GySUo25lHYYfG7mW4MkxKqWwM4qBD6b9MF2g33X1kNQ','2025-12-01 05:14:34',0,'2025-11-01 05:14:34'),(48,8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo4LCJpYXQiOjE3NjE5NzQxNjYsImV4cCI6MTc2NDU2NjE2Nn0.Uty2T8UOy4TlyOUSPTUP1BZz5eHOmj7FPp8U3uEnFZQ','2025-12-01 05:16:06',0,'2025-11-01 05:16:06'),(49,9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50Ijo5LCJpYXQiOjE3NjE5NzQzMzIsImV4cCI6MTc2NDU2NjMzMn0.Ol6qTwwua4DjoX81K6SqS9-bc5LxKs1xmgUK8j-kPsY','2025-12-01 05:18:52',0,'2025-11-01 05:18:52'),(50,10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxMCwiaWF0IjoxNzYxOTc0OTM1LCJleHAiOjE3NjQ1NjY5MzV9.m6LT-QDdwuLh8W-TvPxvC8dXRMiTlP20c90VGm_cS64','2025-12-01 05:28:55',0,'2025-11-01 05:28:55'),(51,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5NzgyNjIsImV4cCI6MTc2NDU3MDI2Mn0.XX45rMCbjqpPMdN0cAfvAJUhnpeHqKZSVeSCgdXg92w','2025-12-01 06:24:22',0,'2025-11-01 06:24:22'),(52,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Nzg2NTgsImV4cCI6MTc2NDU3MDY1OH0.g7MQcuZ0eXjFRCVFLbvzuGmL7nmfEKRV9XDTki8lJc4','2025-12-01 06:30:58',0,'2025-11-01 06:30:58'),(53,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjE5Nzg3MjIsImV4cCI6MTc2NDU3MDcyMn0.nE3zM_j78I-4bM47bYXynVfmpZVR72uWPGcEo7RTPY8','2025-12-01 06:32:02',0,'2025-11-01 06:32:02'),(54,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxLCJpYXQiOjE3NjIwMzcyMjgsImV4cCI6MTc2NDYyOTIyOH0.QJTHYIqn3RqdOzlex0FXqsIDQjGOWOoMvNdjvuZDdl0','2025-12-01 22:47:08',0,'2025-11-01 22:47:08'),(55,11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxMSwiaWF0IjoxNzYyMDY3NDI3LCJleHAiOjE3NjQ2NTk0Mjd9.JPNy7nJyjYGGvbJEUKi_Szd7v0LGsZmOqxmgwDCnSgw','2025-12-02 07:10:27',0,'2025-11-02 07:10:27'),(56,12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxMiwiaWF0IjoxNzYyMDY3NzAwLCJleHAiOjE3NjQ2NTk3MDB9.aVhlXEpYq5l8pkAw6NuP4iobe2XiHTVIOlA9TRYc5oE','2025-12-02 07:15:00',0,'2025-11-02 07:15:00'),(57,13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxMywiaWF0IjoxNzYyMDY3ODY3LCJleHAiOjE3NjQ2NTk4Njd9.qLawD-FVrpHx9mxkQjG8E3nFGIC8pdWCPbD5KLoM1Jk','2025-12-02 07:17:47',0,'2025-11-02 07:17:47'),(58,14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxNCwiaWF0IjoxNzYyMDY4MTQ2LCJleHAiOjE3NjQ2NjAxNDZ9.gMgGnWaZAsnuwMWb6g2C0h1CmouMYyrpkIv1tP-8qZ4','2025-12-02 07:22:26',0,'2025-11-02 07:22:26'),(59,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMTM2MjEsImV4cCI6MTc2NDcwNTYyMX0.l1NeOj3TmS4d5EDr8ybLRiVrnfYPe9H5SBoBGizCs6Y','2025-12-02 20:00:21',0,'2025-11-02 20:00:21'),(60,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMTU4MjIsImV4cCI6MTc2NDcwNzgyMn0.-BeV5hS1_sAhRY3Sp6RtyIj2TWBqlSbKNg1JFjTXI9U','2025-12-02 20:37:02',0,'2025-11-02 20:37:02'),(61,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMTYwNzcsImV4cCI6MTc2NDcwODA3N30.TTeA2WBykEGSuPOj8jiiCoRb1pUOCoNKoQvA_Zblw4U','2025-12-02 20:41:17',0,'2025-11-02 20:41:17'),(62,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMjg1NjksImV4cCI6MTc2NDcyMDU2OX0.PsPQ9Fd9gGGmSScML4BRaRycZWuVoqF05EE7LyMxiQ4','2025-12-03 00:09:29',0,'2025-11-03 00:09:29'),(63,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzIxMTksImV4cCI6MTc2NDcyNDExOX0.VL-rCxxMV-dhNzezM9tlO3NT8As54nMxB7jUW8Ag2CU','2025-12-03 01:08:39',0,'2025-11-03 01:08:39'),(64,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzIyODMsImV4cCI6MTc2NDcyNDI4M30.O8O0lDAjvaZUSjWkqWZVo6qajkEjD36aoKK9_nvJQto','2025-12-03 01:11:23',0,'2025-11-03 01:11:23'),(65,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzI0ODcsImV4cCI6MTc2NDcyNDQ4N30.XpKih6siNKOOzGY3gaxtYxpA3umJMYnG-Gm1fXo8Dt0','2025-12-03 01:14:47',0,'2025-11-03 01:14:47'),(66,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzI1OTQsImV4cCI6MTc2NDcyNDU5NH0.SweFz23-jGZenDXMSUeCsKbk0xg1ocgBF-N6yTO8xto','2025-12-03 01:16:34',0,'2025-11-03 01:16:34'),(67,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzI3MTgsImV4cCI6MTc2NDcyNDcxOH0.7sCNNT9wF8PN3ry62DOSV-UH9Dbd8XXpw04N8kMRRgM','2025-12-03 01:18:38',0,'2025-11-03 01:18:38'),(68,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzI4MDEsImV4cCI6MTc2NDcyNDgwMX0.JzwL6A9BjlL7A7-8N4I_wwPGaF0DoRPHIPsyg7gJF8U','2025-12-03 01:20:01',0,'2025-11-03 01:20:01'),(69,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzQ4MTgsImV4cCI6MTc2NDcyNjgxOH0.tG08tKeBrxh1vHt4mFre78EUW-woAivPBu8tPKRIlNQ','2025-12-03 01:53:38',0,'2025-11-03 01:53:38'),(70,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzUxNzcsImV4cCI6MTc2NDcyNzE3N30.KNqQacnEEjPhobI2NIt6trIZTgU41Uy-3gY-OPw9zsg','2025-12-03 01:59:37',0,'2025-11-03 01:59:37'),(71,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzYwMDUsImV4cCI6MTc2NDcyODAwNX0.E5AnZrPPwzcpuncXmTVKfTd8pzk5dE33Y2LLgVUV5CI','2025-12-03 02:13:25',0,'2025-11-03 02:13:25'),(72,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzY5MTgsImV4cCI6MTc2NDcyODkxOH0.ZaM3Qsk8ykdealVktr4OmLfYAB63gADtbd01G9tOWI0','2025-12-03 02:28:38',0,'2025-11-03 02:28:38'),(73,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzc2NDAsImV4cCI6MTc2NDcyOTY0MH0.nXUvhnnegYGe6vl-cU8Hcc7wDHDA6w01fUI4-C5el6Q','2025-12-03 02:40:40',0,'2025-11-03 02:40:40'),(74,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzk4NDcsImV4cCI6MTc2NDczMTg0N30.lDEuYNoGLaoweka6DWVkOi_GjErBLYT1PKnf9FAY9SY','2025-12-03 03:17:27',0,'2025-11-03 03:17:27'),(75,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxMzk4NjMsImV4cCI6MTc2NDczMTg2M30.p0Hsk0NPBoLLdgeCXgmJR-w3LHg8-bJrSqnREZKM17s','2025-12-03 03:17:43',0,'2025-11-03 03:17:43'),(76,15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxNSwiaWF0IjoxNzYyMTQyNjMxLCJleHAiOjE3NjQ3MzQ2MzF9.iWPj5CBuKK3-JIzUQmT0BoG2T0OvxTrmW_2AQvWOMKs','2025-12-03 04:03:51',0,'2025-11-03 04:03:51'),(77,15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxNSwiaWF0IjoxNzYyMTQyNjQ5LCJleHAiOjE3NjQ3MzQ2NDl9.WOP31reMUYJhbojwodquFep7AG-V4ZJ8_-zCP_7FfU8','2025-12-03 04:04:09',0,'2025-11-03 04:04:09'),(78,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNDMxNDksImV4cCI6MTc2NDczNTE0OX0.jyvj9vAhaOCKPDLZyQR1fxN_Gd7h-Tnh5tAUA9PqJYY','2025-12-03 04:12:29',0,'2025-11-03 04:12:29'),(79,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNDMxNjUsImV4cCI6MTc2NDczNTE2NX0.RC9Xo4r3HkqgqKA1CTlVSwm8TVNpp3oXFEO_GVHVb4Q','2025-12-03 04:12:45',0,'2025-11-03 04:12:45'),(80,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNDMyNTUsImV4cCI6MTc2NDczNTI1NX0.G-bkVPy-Il1kdqybrMXFV-RiIfGHLIv6GhDiWM6N7zA','2025-12-03 04:14:15',0,'2025-11-03 04:14:15'),(81,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNjE1MjQsImV4cCI6MTc2NDc1MzUyNH0.ilIHSyVMlgsDi2FO3788ksPwOwy_81wfDKp_TB1xgOA','2025-12-03 09:18:44',0,'2025-11-03 09:18:44'),(82,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNjgyNTYsImV4cCI6MTc2NDc2MDI1Nn0.AjnIRhxJ2mpigwdWxbeFUgLovOsPBUruNHhbuZTF6L4','2025-12-03 11:10:56',0,'2025-11-03 11:10:56'),(83,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNjg0NDUsImV4cCI6MTc2NDc2MDQ0NX0.HRmb92eTaEiJBY0GJcmF--EsN1fxV2npW0mEfJwYNl8','2025-12-03 11:14:05',0,'2025-11-03 11:14:05'),(84,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNjg1NDUsImV4cCI6MTc2NDc2MDU0NX0.1s4xcu7tXVYRaAEod5Ub3HH9J45zGLxk9H-iBpwgCr8','2025-12-03 11:15:45',0,'2025-11-03 11:15:45'),(85,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNjg2NDYsImV4cCI6MTc2NDc2MDY0Nn0.mkOZbGcdy8PCvSGfbe4d94K9CBxl0Tb9cmF_7TPs_Xw','2025-12-03 11:17:26',0,'2025-11-03 11:17:26'),(86,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIxNjg2NjYsImV4cCI6MTc2NDc2MDY2Nn0.-KVzxARtJSz_hiOLEmpj6lKoOMBpOVSxeQZ_646x_BA','2025-12-03 11:17:46',0,'2025-11-03 11:17:46'),(87,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMjk3MTAsImV4cCI6MTc2NDgyMTcxMH0.gZ2RDXEQnTcxE1yKoCsp-i7ibCEUqQq7dcmcnz3xNH4','2025-12-04 04:15:10',0,'2025-11-04 04:15:10'),(88,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMjk4ODIsImV4cCI6MTc2NDgyMTg4Mn0.TnmOVc_io0Y_RtOpA25EaxPvv6ubudHhxyFhSg2Ii2Y','2025-12-04 04:18:02',0,'2025-11-04 04:18:02'),(89,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzAwOTgsImV4cCI6MTc2NDgyMjA5OH0.eRsJUCWO32ODCfQhpiS1Z3tYa84Q0ukjoA86dKyZGD8','2025-12-04 04:21:38',0,'2025-11-04 04:21:38'),(90,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzAxODIsImV4cCI6MTc2NDgyMjE4Mn0.BDgayPYQDuyejfPYdRGE5z5Mj60Zx3XgTHC0IwL06HU','2025-12-04 04:23:02',0,'2025-11-04 04:23:02'),(91,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzAyMjcsImV4cCI6MTc2NDgyMjIyN30.Bqu27PX-ifCKOnHPHsqIqSJ88zAC4Xi_7DYDEQcXrU4','2025-12-04 04:23:47',0,'2025-11-04 04:23:47'),(92,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzA0OTAsImV4cCI6MTc2NDgyMjQ5MH0.6jt49mox4cMD0WwsqRA8BOFF6Uu2jhh_eZvPwkYPcPU','2025-12-04 04:28:10',0,'2025-11-04 04:28:10'),(93,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzA1MjksImV4cCI6MTc2NDgyMjUyOX0.jJ42yK0pmU007T-JYfhe_hOqWhChYv1O7qzMpbUES3A','2025-12-04 04:28:49',0,'2025-11-04 04:28:49'),(94,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzA3OTAsImV4cCI6MTc2NDgyMjc5MH0.myyJXqyEUR51MSJIzVPvztdOMLCpFG54C2-bSdSCBsQ','2025-12-04 04:33:10',0,'2025-11-04 04:33:10'),(95,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzA4MTEsImV4cCI6MTc2NDgyMjgxMX0.NkCbFqsQF6io1Wra1TugFa6gzNd7QlEoXV_qg1X20qY','2025-12-04 04:33:31',0,'2025-11-04 04:33:31'),(96,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzA4MzEsImV4cCI6MTc2NDgyMjgzMX0.022ujBUGdK1N1S2wJyXuj5ug-4lz9VhR4nTFz4YZBeY','2025-12-04 04:33:51',0,'2025-11-04 04:33:51'),(97,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzA5NDgsImV4cCI6MTc2NDgyMjk0OH0.wDyVsh2oW5JdblzgsUOZ8Wj5CqDCDwhkAsy0PUbx9kM','2025-12-04 04:35:48',0,'2025-11-04 04:35:48'),(98,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzE4NTYsImV4cCI6MTc2NDgyMzg1Nn0.DpUB1UraGX0XF5n8vEI9SzTDHNR9rhAtknUdVAKg7Ro','2025-12-04 04:50:56',0,'2025-11-04 04:50:56'),(99,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzIxNDQsImV4cCI6MTc2NDgyNDE0NH0.uN4XoOhofviKF3ZZLMw73FhgGPRIr6JXznyXijjIiO4','2025-12-04 04:55:44',0,'2025-11-04 04:55:44'),(100,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyMzIzNTQsImV4cCI6MTc2NDgyNDM1NH0.nIrAdFDS2earJHHgTqN0I4Bn_ibM3_Re3Du8TG1zzk4','2025-12-04 04:59:14',0,'2025-11-04 04:59:14'),(101,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTQ2NzMsImV4cCI6MTc2NDg0NjY3M30.xw_qZ7j7LeqACy8uFb6cXJ3iWH9zOn_n8hsqfL7BS9E','2025-12-04 11:11:13',0,'2025-11-04 11:11:13'),(102,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTUwNjcsImV4cCI6MTc2NDg0NzA2N30.7fnx3a9ll3XrogHFAgWKUl_X139FmdQxhbzJ-lmygos','2025-12-04 11:17:47',0,'2025-11-04 11:17:47'),(103,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTU0MTksImV4cCI6MTc2NDg0NzQxOX0.bwXjce-LYlKCzQGd1-hMOdz8JMrBvz_3I783Ko1fnlo','2025-12-04 11:23:39',0,'2025-11-04 11:23:39'),(104,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTY1MTgsImV4cCI6MTc2NDg0ODUxOH0.dK1BI0oHUGS2M0AgXaccpespAdfvX2Zt2Be4iQaNTjM','2025-12-04 11:41:58',0,'2025-11-04 11:41:58'),(105,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTcxNzQsImV4cCI6MTc2NDg0OTE3NH0.T3EbyRc6MJspAZNmisRLTuUmGsAj3rMSVOC_wbfQfZg','2025-12-04 11:52:54',0,'2025-11-04 11:52:54'),(106,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTc0MTQsImV4cCI6MTc2NDg0OTQxNH0.Xej7JiX8Hzvf6X9GvgZNWOwWWJ9vBH0oHgnN4C4TANc','2025-12-04 11:56:54',0,'2025-11-04 11:56:54'),(107,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTc0NDksImV4cCI6MTc2NDg0OTQ0OX0.7UtOTjxnGwzcSTuTrp2Bt41PCChxr9trjX3Rsmak2-U','2025-12-04 11:57:29',0,'2025-11-04 11:57:29'),(108,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTc0NjksImV4cCI6MTc2NDg0OTQ2OX0.92GI_h-1tvZHpEuEhGGrh_NLxhX8G2yw7yl0EBtDqBg','2025-12-04 11:57:49',0,'2025-11-04 11:57:49'),(109,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTc2NDcsImV4cCI6MTc2NDg0OTY0N30.crsxixT3cgoi6vK1nnuivslwPa7WDzBKsGZNewawKmA','2025-12-04 12:00:47',0,'2025-11-04 12:00:47'),(110,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTc3NjIsImV4cCI6MTc2NDg0OTc2Mn0.ImFloAkzxh5H3J9_Hj6eVqoLr5l9CG9Y1ZCSCWH0agc','2025-12-04 12:02:42',0,'2025-11-04 12:02:42'),(111,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTc5MTEsImV4cCI6MTc2NDg0OTkxMX0.r8xZx-JrjYl14EoUFcZCBtHz1NVCGHals0Afu3j7KYw','2025-12-04 12:05:11',0,'2025-11-04 12:05:11'),(112,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNTg4NTgsImV4cCI6MTc2NDg1MDg1OH0.UCKPOp2bdUQ9WfV7CVE-J8DPTX4btovJEdcHNVbgFs8','2025-12-04 12:20:58',0,'2025-11-04 12:20:58'),(113,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNjE2MzAsImV4cCI6MTc2NDg1MzYzMH0.bfV_BOY__z09rCyMgs-RRsuOE4RmYtiB3wsyT0Jn1jQ','2025-12-04 13:07:10',0,'2025-11-04 13:07:10'),(114,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxLCJpYXQiOjE3NjIyNjM5MTIsImV4cCI6MTc2NDg1NTkxMn0.bmPqsR52-_KS0YzOZaWZiMntlZcf-y8rgXvTyJdA0Lk','2025-12-04 13:45:12',0,'2025-11-04 13:45:12'),(115,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNjQwODQsImV4cCI6MTc2NDg1NjA4NH0.74TaScpv03C7ewsGKN2tJbovveSb5Bz8G_iiSvU0Qso','2025-12-04 13:48:04',0,'2025-11-04 13:48:04'),(116,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNjQ0NTksImV4cCI6MTc2NDg1NjQ1OX0.zyoG4wqylC3oCbkmxz9Vm8R9gdBy1-ecS9YM6QkDjG8','2025-12-04 13:54:19',0,'2025-11-04 13:54:19'),(117,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxLCJpYXQiOjE3NjIyNjQ5MTUsImV4cCI6MTc2NDg1NjkxNX0.WJmIH4lM6NiVZzelH2LgCKCbPnHe8SYJmCBupBm8mhs','2025-12-04 14:01:55',0,'2025-11-04 14:01:55'),(118,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNjU1NTMsImV4cCI6MTc2NDg1NzU1M30.ZHNdBhmHcvis04BJnBZlI_LtywGJuKK_g7OvNYYyOUE','2025-12-04 14:12:33',0,'2025-11-04 14:12:33'),(119,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxLCJpYXQiOjE3NjIyNjU4NzQsImV4cCI6MTc2NDg1Nzg3NH0.sQe4PfgUxgVk48MjPpSoWfwB2Nt9KOOzAwmgV6a46i4','2025-12-04 14:17:54',0,'2025-11-04 14:17:54'),(120,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNjY0ODksImV4cCI6MTc2NDg1ODQ4OX0.N42UDgzZvFvXE99lCU9MW8bZltIER_6kEKeet3Bj-4Q','2025-12-04 14:28:09',0,'2025-11-04 14:28:09'),(121,1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjoxLCJpYXQiOjE3NjIyNzAyMDQsImV4cCI6MTc2NDg2MjIwNH0.TzquLDiP9i4QG-i4honYKqJ3czcDmjbgtnp32RD9zAY','2025-12-04 15:30:04',0,'2025-11-04 15:30:04'),(122,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNzI3NzcsImV4cCI6MTc2NDg2NDc3N30.ZmCk8vKhyPv-RGjrcwK392yD1LxGXuk5F1bRWDgqctA','2025-12-04 16:12:57',0,'2025-11-04 16:12:57'),(123,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNzM2NjQsImV4cCI6MTc2NDg2NTY2NH0.VFEMD6lZL4MrZNeQKYOVqk474TMakTMhq14PypLr8ZE','2025-12-04 16:27:44',0,'2025-11-04 16:27:44'),(124,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyNzQ3NzQsImV4cCI6MTc2NDg2Njc3NH0.wefpqrZ_B9x_u2QVeBOz-g1ny6M9j8bGNxdPC1wRfDE','2025-12-04 16:46:14',0,'2025-11-04 16:46:14'),(125,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTE0NzEsImV4cCI6MTc2NDg4MzQ3MX0.p_Bz6wcrlxhGWObN7ibY877NoZ8951f5DCiK7tlfoss','2025-12-04 21:24:31',0,'2025-11-04 21:24:31'),(126,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTE4MzcsImV4cCI6MTc2NDg4MzgzN30.of7N4_YWea-R_6McxM3lYPEnvOlGQMS_aRND7EynwpY','2025-12-04 21:30:37',0,'2025-11-04 21:30:37'),(127,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTIwMDYsImV4cCI6MTc2NDg4NDAwNn0.lVKH02iPMrgPFtVEl_WUh5cLvkwT7V0Z7gU3T0YgNQA','2025-12-04 21:33:26',0,'2025-11-04 21:33:26'),(128,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTIxNzksImV4cCI6MTc2NDg4NDE3OX0.9VAKByvOJF9uuDtIMbgHg7fIKWyOsU4EyLw9DWCQ-AI','2025-12-04 21:36:19',0,'2025-11-04 21:36:19'),(129,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTI0NjksImV4cCI6MTc2NDg4NDQ2OX0.LRIM2cee40Y5A-ViqGehkut7nJSf1TcOFCV5WJ8vQqY','2025-12-04 21:41:09',0,'2025-11-04 21:41:09'),(130,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTI4MzEsImV4cCI6MTc2NDg4NDgzMX0.pgBPEpjgLZMYkoypE1mpX1TTk-tSezf7U0CInms5qgU','2025-12-04 21:47:11',0,'2025-11-04 21:47:11'),(131,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTMzNDEsImV4cCI6MTc2NDg4NTM0MX0.xWIzIpubf3oYTXhOSJ72B0jXS5zXgWhh9pwA3ObjncQ','2025-12-04 21:55:41',0,'2025-11-04 21:55:41'),(132,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTM0NDcsImV4cCI6MTc2NDg4NTQ0N30.Hy1WiNhXVlO69HnRr4ZSUVzv60wJFA9paZD-r3lrLTE','2025-12-04 21:57:27',0,'2025-11-04 21:57:27'),(133,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTM5MTQsImV4cCI6MTc2NDg4NTkxNH0.a4kGWJDaFrgqkxshaUMbE-Lou5gtWwiYFHcCAZKeoWY','2025-12-04 22:05:14',0,'2025-11-04 22:05:14'),(134,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTM5MzIsImV4cCI6MTc2NDg4NTkzMn0.46lgw1-PuuJW1VR_j7owmNUZv4AWOH_ShPNY_T6hb7Q','2025-12-04 22:05:32',0,'2025-11-04 22:05:32'),(135,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTQyODksImV4cCI6MTc2NDg4NjI4OX0.0rJe00EnjtnoqdXaH6Tr9HFObXjgEkEAXuqR8TW9jQI','2025-12-04 22:11:29',0,'2025-11-04 22:11:29'),(136,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTQ1MzksImV4cCI6MTc2NDg4NjUzOX0.MRtfg5zX9-7ICXB0cop43jGpmbENm3La-5wjuE_p70E','2025-12-04 22:15:39',0,'2025-11-04 22:15:39'),(137,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIyOTUxMTAsImV4cCI6MTc2NDg4NzExMH0.-nENEX2Lyt5Y8RLX3U1VwK2gWjnHe21VDrEkK3Orycc','2025-12-04 22:25:10',0,'2025-11-04 22:25:10'),(138,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDYyODMsImV4cCI6MTc2NDg5ODI4M30.6AjbMT7XiogVRst1BstjA-nS26OgOrUafP6jGxt1ZJQ','2025-12-05 01:31:23',0,'2025-11-05 01:31:23'),(139,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDY0MTcsImV4cCI6MTc2NDg5ODQxN30.1QDwF_0Kh8R_Bo8kTwIbVy2ahSeiKbbIFRuELDVDnOY','2025-12-05 01:33:37',0,'2025-11-05 01:33:37'),(140,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDY1MDcsImV4cCI6MTc2NDg5ODUwN30.fJztIApColtl3Mvv5AJVXTjZj_ebPh5kZtngkMd9zIQ','2025-12-05 01:35:07',0,'2025-11-05 01:35:07'),(141,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDg0OTYsImV4cCI6MTc2NDkwMDQ5Nn0.6bxCCbQOvbjE2d2RECVe3lJus32EK1fD8Bo4Hwnjv_s','2025-12-05 02:08:16',0,'2025-11-05 02:08:16'),(142,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDkwMDEsImV4cCI6MTc2NDkwMTAwMX0._Zz_uzESGDBN2FcGKSxNo7Wpw72frNGt0fNJ5g84Y2c','2025-12-05 02:16:41',0,'2025-11-05 02:16:41'),(143,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDkyNTcsImV4cCI6MTc2NDkwMTI1N30.-z7E5iQJ_BVvn6XsbqjRivwpQHoWz94O1Hd3-meRE2A','2025-12-05 02:20:57',0,'2025-11-05 02:20:57'),(144,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMDk5MzksImV4cCI6MTc2NDkwMTkzOX0.4lpQO6dgor0OzDDgfyFkYl1LIkYNU5UXUFIP3dgnAvc','2025-12-05 02:32:19',0,'2025-11-05 02:32:19'),(145,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMTA0MjEsImV4cCI6MTc2NDkwMjQyMX0.UKCxkluvogPARlCcmZmAG8_6awR1uH--25S4DY3JwIo','2025-12-05 02:40:21',0,'2025-11-05 02:40:21'),(146,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMTE5ODMsImV4cCI6MTc2NDkwMzk4M30.ptVUUgA0dWOaRycZc8R7OXTmWZaFlnWORdwsAkbJZHA','2025-12-05 03:06:23',0,'2025-11-05 03:06:23'),(147,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMTI1MTQsImV4cCI6MTc2NDkwNDUxNH0.6mL7eOP7A7-aLBH8zDfvtMtoV6k-2UE_mQCi789fZso','2025-12-05 03:15:14',0,'2025-11-05 03:15:14'),(148,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9hY2NvdW50IjozLCJpYXQiOjE3NjIzMTI2OTcsImV4cCI6MTc2NDkwNDY5N30.55Zmug2M_yx72KaC56gskdpZF5caRk3jIdxA_pGZP8U','2025-12-05 03:18:17',0,'2025-11-05 03:18:17');
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_helpful`
--

DROP TABLE IF EXISTS `review_helpful`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_helpful` (
  `id_review` int NOT NULL,
  `id_user_profile` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_review`,`id_user_profile`),
  KEY `id_user_profile` (`id_user_profile`),
  CONSTRAINT `review_helpful_ibfk_1` FOREIGN KEY (`id_review`) REFERENCES `gym_review` (`id_review`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `review_helpful_ibfk_2` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_helpful`
--

LOCK TABLES `review_helpful` WRITE;
/*!40000 ALTER TABLE `review_helpful` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_helpful` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward`
--

DROP TABLE IF EXISTS `reward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward` (
  `id_reward` int NOT NULL AUTO_INCREMENT,
  `id_gym` int DEFAULT NULL COMMENT 'Gimnasio que ofrece la recompensa (NULL = recompensa global)',
  `name` varchar(100) NOT NULL,
  `description` text,
  `reward_type` enum('descuento','pase_gratis','producto','servicio','merchandising','otro') DEFAULT NULL COMMENT 'Tipo de recompensa: descuento, pase_gratis, producto, servicio, merchandising, otro',
  `token_cost` int NOT NULL COMMENT 'Costo en tokens',
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje de descuento si aplica',
  `discount_amount` decimal(10,2) DEFAULT NULL COMMENT 'Monto fijo de descuento',
  `stock` int DEFAULT NULL COMMENT 'Stock disponible (NULL = ilimitado)',
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL COMMENT 'URL de la imagen de la recompensa',
  `terms` text COMMENT 'Términos y condiciones de la recompensa',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_reward`),
  KEY `idx_reward_gym_active` (`id_gym`,`is_active`),
  KEY `idx_reward_cost` (`token_cost`),
  KEY `idx_reward_deleted` (`deleted_at`),
  CONSTRAINT `reward_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward`
--

LOCK TABLES `reward` WRITE;
/*!40000 ALTER TABLE `reward` DISABLE KEYS */;
/*!40000 ALTER TABLE `reward` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_code`
--

DROP TABLE IF EXISTS `reward_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_code` (
  `id_code` int NOT NULL AUTO_INCREMENT,
  `id_reward` int NOT NULL,
  `code` varchar(50) NOT NULL COMMENT 'Código único de la recompensa',
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_code`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `idx_reward_code_code` (`code`),
  KEY `idx_reward_code_reward_used` (`id_reward`,`is_used`),
  CONSTRAINT `reward_code_ibfk_1` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_code`
--

LOCK TABLES `reward_code` WRITE;
/*!40000 ALTER TABLE `reward_code` DISABLE KEYS */;
/*!40000 ALTER TABLE `reward_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_gym_stats_daily`
--

DROP TABLE IF EXISTS `reward_gym_stats_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_gym_stats_daily` (
  `id_stat` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `day` date NOT NULL,
  `total_rewards_claimed` int NOT NULL DEFAULT '0',
  `total_tokens_spent` int NOT NULL DEFAULT '0',
  `unique_users` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_stat`),
  UNIQUE KEY `uniq_reward_stats_gym_day` (`id_gym`,`day`),
  KEY `idx_reward_stats_day` (`day`),
  CONSTRAINT `reward_gym_stats_daily_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_gym_stats_daily`
--

LOCK TABLES `reward_gym_stats_daily` WRITE;
/*!40000 ALTER TABLE `reward_gym_stats_daily` DISABLE KEYS */;
/*!40000 ALTER TABLE `reward_gym_stats_daily` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_role` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del rol',
  `role_name` varchar(50) NOT NULL COMMENT 'Nombre del rol (USER, ADMIN, MODERATOR, etc.)',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descripción del rol',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'USER','Usuario normal de la aplicación móvil','2025-11-01 01:44:27'),(2,'ADMIN','Administrador del sistema con acceso total','2025-11-01 01:44:27'),(3,'GYM_OWNER','Propietario de gimnasio con permisos de gestión','2025-11-01 01:44:27');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routine`
--

DROP TABLE IF EXISTS `routine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routine` (
  `id_routine` int NOT NULL AUTO_INCREMENT,
  `routine_name` varchar(100) NOT NULL,
  `description` text,
  `created_by` int DEFAULT NULL COMMENT 'Usuario que creó la rutina (NULL = sistema/plantilla)',
  `is_template` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es una plantilla pre-diseñada',
  `recommended_for` enum('BEGINNER','INTERMEDIATE','ADVANCED') DEFAULT NULL COMMENT 'Nivel recomendado',
  `classification` varchar(50) DEFAULT NULL COMMENT 'Clasificación (STRENGTH, CARDIO, HYBRID, etc.)',
  `template_order` int NOT NULL DEFAULT '0' COMMENT 'Orden de visualización en plantillas',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_routine`),
  KEY `idx_routine_template` (`is_template`,`template_order`),
  KEY `idx_routine_created_by` (`created_by`),
  KEY `idx_routine_deleted` (`deleted_at`),
  CONSTRAINT `routine_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine`
--

LOCK TABLES `routine` WRITE;
/*!40000 ALTER TABLE `routine` DISABLE KEYS */;
INSERT INTO `routine` VALUES (1,'Rutina Fuerza A Modificada','Nueva descripci�n',4,0,NULL,NULL,0,'2025-11-01 04:59:30','2025-11-01 05:00:09','2025-11-01 05:00:09'),(2,'Rutina Test',NULL,4,0,NULL,NULL,0,'2025-11-01 05:02:49','2025-11-01 05:02:49',NULL),(3,'Rutina Full Body',NULL,4,0,NULL,NULL,0,'2025-11-01 05:06:38','2025-11-01 05:06:38',NULL),(4,'Rutina Test',NULL,4,0,NULL,NULL,0,'2025-11-01 05:08:29','2025-11-01 05:08:29',NULL),(5,'Rutina Final',NULL,4,0,NULL,NULL,0,'2025-11-01 05:11:04','2025-11-01 05:11:04',NULL),(6,'Rutina Final',NULL,4,0,NULL,NULL,0,'2025-11-01 05:12:39','2025-11-01 05:12:39',NULL),(7,'Rutina Test Final',NULL,5,0,NULL,NULL,0,'2025-11-01 05:13:19','2025-11-01 05:13:19',NULL),(8,'Rutina SUCCESS',NULL,5,0,NULL,NULL,0,'2025-11-01 05:14:23','2025-11-01 05:14:23',NULL),(9,'Mi Rutina',NULL,6,0,NULL,NULL,0,'2025-11-01 05:14:59','2025-11-01 05:14:59',NULL),(10,'Mi Rutina',NULL,7,0,NULL,NULL,0,'2025-11-01 05:16:34','2025-11-01 05:16:34',NULL),(11,'Rutina Completa',NULL,8,0,NULL,NULL,0,'2025-11-01 05:19:18','2025-11-01 05:19:18',NULL),(14,'Final Test','Test',5,0,NULL,NULL,0,'2025-11-01 05:26:39','2025-11-01 05:26:39',NULL),(15,'Final','Test',9,0,NULL,NULL,0,'2025-11-01 05:29:20','2025-11-01 05:29:20',NULL),(16,'Rutina Final','Prueba completa',10,0,NULL,NULL,0,'2025-11-02 07:10:40','2025-11-02 07:10:40',NULL),(17,'Test Final','Prueba',11,0,NULL,NULL,0,'2025-11-02 07:15:09','2025-11-02 07:15:09',NULL),(18,'Suite Test','Final',12,0,NULL,NULL,0,'2025-11-02 07:17:55','2025-11-02 07:17:55',NULL),(19,'Complete Final','Test',13,0,NULL,NULL,0,'2025-11-02 07:22:43','2025-11-02 07:22:43',NULL),(22,'Progreso','Fuerza',2,0,NULL,NULL,0,'2025-11-04 11:42:17','2025-11-04 11:42:17',NULL),(23,'Rutina de hipertrofia','Hipertrofia',2,0,NULL,NULL,0,'2025-11-04 12:22:05','2025-11-04 12:22:05',NULL),(24,'PRI','Hipertrofia',2,0,NULL,NULL,0,'2025-11-04 14:23:17','2025-11-04 14:23:17',NULL);
/*!40000 ALTER TABLE `routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routine_day`
--

DROP TABLE IF EXISTS `routine_day`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routine_day` (
  `id_routine_day` int NOT NULL AUTO_INCREMENT,
  `id_routine` int NOT NULL,
  `day_number` int NOT NULL COMMENT 'Número del día en la rutina (1, 2, 3...)',
  `day_name` varchar(100) DEFAULT NULL COMMENT 'Nombre del día (ej: "Pecho y Tríceps")',
  `description` text,
  `rest_day` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_routine_day`),
  UNIQUE KEY `uniq_routine_day_number` (`id_routine`,`day_number`),
  KEY `idx_routine_day_routine` (`id_routine`),
  CONSTRAINT `routine_day_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine_day`
--

LOCK TABLES `routine_day` WRITE;
/*!40000 ALTER TABLE `routine_day` DISABLE KEYS */;
/*!40000 ALTER TABLE `routine_day` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routine_exercise`
--

DROP TABLE IF EXISTS `routine_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routine_exercise` (
  `id_routine_exercise` int NOT NULL AUTO_INCREMENT,
  `id_routine` int NOT NULL COMMENT 'Rutina a la que pertenece el ejercicio',
  `id_routine_day` int DEFAULT NULL COMMENT 'Día de la rutina (NULL para rutinas sin días específicos)',
  `id_exercise` int NOT NULL,
  `exercise_order` int NOT NULL DEFAULT '0' COMMENT 'Orden del ejercicio en el día',
  `sets` int DEFAULT NULL,
  `reps` int DEFAULT NULL,
  `rest_seconds` int DEFAULT NULL COMMENT 'Descanso entre series en segundos',
  `notes` text,
  PRIMARY KEY (`id_routine_exercise`),
  KEY `idx_routine_exercise_routine` (`id_routine`),
  KEY `idx_routine_exercise_day_order` (`id_routine_day`,`exercise_order`),
  KEY `idx_routine_exercise_exercise` (`id_exercise`),
  CONSTRAINT `routine_exercise_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `routine_exercise_ibfk_2` FOREIGN KEY (`id_routine_day`) REFERENCES `routine_day` (`id_routine_day`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `routine_exercise_ibfk_3` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine_exercise`
--

LOCK TABLES `routine_exercise` WRITE;
/*!40000 ALTER TABLE `routine_exercise` DISABLE KEYS */;
INSERT INTO `routine_exercise` VALUES (1,1,NULL,1,0,NULL,8,NULL,NULL),(3,2,NULL,1,0,NULL,10,NULL,NULL),(4,2,NULL,2,0,NULL,12,NULL,NULL),(5,3,NULL,1,0,NULL,10,NULL,NULL),(6,3,NULL,2,0,NULL,12,NULL,NULL),(7,4,NULL,1,0,NULL,10,NULL,NULL),(8,4,NULL,2,0,NULL,12,NULL,NULL),(9,5,NULL,1,0,NULL,10,NULL,NULL),(10,5,NULL,2,0,NULL,12,NULL,NULL),(11,6,NULL,1,0,NULL,10,NULL,NULL),(12,6,NULL,2,0,NULL,12,NULL,NULL),(13,7,NULL,1,0,NULL,10,NULL,NULL),(14,7,NULL,2,0,NULL,12,NULL,NULL),(15,8,NULL,1,0,NULL,10,NULL,NULL),(16,8,NULL,2,0,NULL,12,NULL,NULL),(17,9,NULL,1,0,NULL,10,NULL,NULL),(18,9,NULL,2,0,NULL,12,NULL,NULL),(19,10,NULL,1,0,NULL,10,NULL,NULL),(20,10,NULL,2,0,NULL,12,NULL,NULL),(21,11,NULL,1,0,NULL,10,NULL,NULL),(22,11,NULL,2,0,NULL,12,NULL,NULL),(25,14,NULL,1,0,NULL,10,NULL,NULL),(26,14,NULL,2,0,NULL,12,NULL,NULL),(27,15,NULL,1,0,NULL,10,NULL,NULL),(28,15,NULL,2,0,NULL,12,NULL,NULL),(29,16,NULL,1,0,NULL,10,NULL,NULL),(30,16,NULL,2,0,NULL,12,NULL,NULL),(31,17,NULL,1,0,NULL,10,NULL,NULL),(32,17,NULL,2,0,NULL,12,NULL,NULL),(33,18,NULL,1,0,NULL,10,NULL,NULL),(34,18,NULL,2,0,NULL,12,NULL,NULL),(35,19,NULL,1,0,NULL,10,NULL,NULL),(36,19,NULL,2,0,NULL,12,NULL,NULL),(37,22,NULL,20,0,NULL,10,NULL,NULL),(38,22,NULL,21,0,NULL,10,NULL,NULL),(39,23,NULL,7,0,NULL,10,NULL,NULL),(40,23,NULL,14,0,NULL,10,NULL,NULL),(41,24,NULL,4,0,NULL,10,NULL,NULL),(42,24,NULL,20,0,NULL,10,NULL,NULL);
/*!40000 ALTER TABLE `routine_exercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streak`
--

DROP TABLE IF EXISTS `streak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `streak` (
  `id_streak` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL COMMENT 'Usuario al que pertenece la racha',
  `id_frequency` int NOT NULL COMMENT 'Frecuencia asociada',
  `value` int NOT NULL DEFAULT '0' COMMENT 'Racha actual (días consecutivos)',
  `last_value` int NOT NULL DEFAULT '0' COMMENT 'Última racha (antes de perderla)',
  `max_value` int NOT NULL DEFAULT '0' COMMENT 'Racha máxima histórica',
  `recovery_items` int NOT NULL DEFAULT '0' COMMENT 'Ítems de recuperación de racha disponibles',
  `last_assistance_date` date DEFAULT NULL COMMENT 'Fecha de la última asistencia',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_streak`),
  UNIQUE KEY `idx_streak_user_unique` (`id_user_profile`),
  KEY `idx_streak_frequency` (`id_frequency`),
  KEY `idx_streak_value` (`value`),
  CONSTRAINT `streak_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `streak_ibfk_2` FOREIGN KEY (`id_frequency`) REFERENCES `frequency` (`id_frequency`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streak`
--

LOCK TABLES `streak` WRITE;
/*!40000 ALTER TABLE `streak` DISABLE KEYS */;
INSERT INTO `streak` VALUES (1,1,1,0,0,0,0,NULL,'2025-11-01 01:45:03','2025-11-01 01:45:03'),(2,2,2,1,0,1,0,'2025-11-02','2025-11-01 01:56:34','2025-11-02 20:37:30'),(3,3,3,0,0,0,0,NULL,'2025-11-01 02:03:28','2025-11-01 02:03:28'),(4,4,4,0,0,0,0,NULL,'2025-11-01 04:48:23','2025-11-01 04:48:23'),(5,5,5,0,0,0,0,NULL,'2025-11-01 05:12:53','2025-11-01 05:12:53'),(6,6,6,0,0,0,0,NULL,'2025-11-01 05:14:34','2025-11-01 05:14:34'),(7,7,7,0,0,0,0,NULL,'2025-11-01 05:16:06','2025-11-01 05:16:06'),(8,8,8,0,0,0,0,NULL,'2025-11-01 05:18:52','2025-11-01 05:18:52'),(9,9,9,0,0,0,0,NULL,'2025-11-01 05:28:55','2025-11-01 05:28:55'),(10,10,10,0,0,0,0,NULL,'2025-11-02 07:10:27','2025-11-02 07:10:27'),(11,11,11,0,0,0,0,NULL,'2025-11-02 07:15:00','2025-11-02 07:15:00'),(12,12,12,0,0,0,0,NULL,'2025-11-02 07:17:47','2025-11-02 07:17:47'),(13,13,13,0,0,0,0,NULL,'2025-11-02 07:22:26','2025-11-02 07:22:26'),(14,14,14,0,0,0,0,NULL,'2025-11-03 04:03:51','2025-11-03 04:03:51');
/*!40000 ALTER TABLE `streak` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_ledger`
--

DROP TABLE IF EXISTS `token_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_ledger` (
  `id_ledger` bigint NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `delta` int NOT NULL COMMENT 'Cambio en tokens (positivo=ganancia, negativo=gasto)',
  `balance_after` int NOT NULL COMMENT 'Balance después de aplicar el delta',
  `reason` varchar(100) NOT NULL COMMENT 'ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, DAILY_CHALLENGE, etc.',
  `ref_type` varchar(50) DEFAULT NULL COMMENT 'Tipo de referencia (assistance, claimed_reward, user_daily_challenge, etc.)',
  `ref_id` bigint DEFAULT NULL COMMENT 'ID de la entidad referenciada',
  `metadata` json DEFAULT NULL COMMENT 'Información adicional',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ledger`),
  KEY `idx_token_ledger_user_date` (`id_user_profile`,`created_at`),
  KEY `idx_token_ledger_reason` (`reason`),
  KEY `idx_token_ledger_ref` (`ref_type`,`ref_id`),
  CONSTRAINT `token_ledger_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_ledger`
--

LOCK TABLES `token_ledger` WRITE;
/*!40000 ALTER TABLE `token_ledger` DISABLE KEYS */;
INSERT INTO `token_ledger` VALUES (1,2,5,5,'BODY_METRICS_ENTRY','user_body_metric',1,NULL,'2025-11-01 02:35:26'),(2,2,10,15,'ATTENDANCE','assistance',1,NULL,'2025-11-02 20:37:30'),(3,2,10,25,'REVIEW_SUBMITTED','gym_review',1,NULL,'2025-11-02 20:37:51'),(4,2,10,35,'WORKOUT_COMPLETED','workout_session',1,NULL,'2025-11-05 02:40:43'),(5,2,10,45,'WORKOUT_COMPLETED','workout_session',2,NULL,'2025-11-05 02:41:14'),(6,2,10,55,'WORKOUT_COMPLETED','workout_session',3,NULL,'2025-11-05 02:43:08'),(7,2,10,65,'WORKOUT_COMPLETED','workout_session',4,NULL,'2025-11-05 03:07:36'),(8,2,10,75,'WORKOUT_COMPLETED','workout_session',5,NULL,'2025-11-05 03:12:11'),(9,2,10,85,'WORKOUT_COMPLETED','workout_session',6,NULL,'2025-11-05 03:19:36'),(10,2,10,95,'WORKOUT_COMPLETED','workout_session',7,NULL,'2025-11-05 03:19:51'),(11,2,10,105,'WORKOUT_COMPLETED','workout_session',8,NULL,'2025-11-05 03:20:03');
/*!40000 ALTER TABLE `token_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievement`
--

DROP TABLE IF EXISTS `user_achievement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievement` (
  `id_user_achievement` bigint NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_achievement_definition` int NOT NULL,
  `progress_value` int NOT NULL DEFAULT '0' COMMENT 'Progreso actual',
  `progress_denominator` int DEFAULT NULL COMMENT 'Valor objetivo (copia del target_value)',
  `unlocked` tinyint(1) NOT NULL DEFAULT '0',
  `unlocked_at` datetime DEFAULT NULL,
  `last_source_type` varchar(50) DEFAULT NULL,
  `last_source_id` bigint DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_achievement`),
  UNIQUE KEY `uniq_user_achievement_definition` (`id_user_profile`,`id_achievement_definition`),
  KEY `id_achievement_definition` (`id_achievement_definition`),
  KEY `idx_user_achievement_user_status` (`id_user_profile`,`unlocked`,`updated_at`),
  CONSTRAINT `user_achievement_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_achievement_ibfk_2` FOREIGN KEY (`id_achievement_definition`) REFERENCES `achievement_definition` (`id_achievement_definition`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievement`
--

LOCK TABLES `user_achievement` WRITE;
/*!40000 ALTER TABLE `user_achievement` DISABLE KEYS */;
INSERT INTO `user_achievement` VALUES (1,2,2,1,3,0,NULL,'streak',2,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(2,2,3,1,7,0,NULL,'streak',2,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(3,2,4,1,30,0,NULL,'streak',2,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(4,2,9,0,1,0,NULL,'frequency_history',NULL,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(5,2,10,0,4,0,NULL,'frequency_history',NULL,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(6,2,5,1,1,1,'2025-11-02 20:37:30','assistance',NULL,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(7,2,6,1,10,0,NULL,'assistance',NULL,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(8,2,7,1,50,0,NULL,'assistance',NULL,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(9,2,8,1,100,0,NULL,'assistance',NULL,NULL,'2025-11-02 20:37:30','2025-11-02 20:37:30'),(10,2,13,105,100,1,'2025-11-05 03:20:03','user_profile',NULL,NULL,'2025-11-02 20:37:51','2025-11-05 03:20:03'),(11,2,14,105,500,0,NULL,'user_profile',NULL,NULL,'2025-11-02 20:37:51','2025-11-05 03:20:03');
/*!40000 ALTER TABLE `user_achievement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievement_event`
--

DROP TABLE IF EXISTS `user_achievement_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievement_event` (
  `id_user_achievement_event` bigint NOT NULL AUTO_INCREMENT,
  `id_user_achievement` bigint NOT NULL,
  `event_type` enum('PROGRESS','UNLOCKED','RESET') NOT NULL,
  `delta` int DEFAULT NULL COMMENT 'Cambio en el progreso',
  `snapshot_value` int NOT NULL COMMENT 'Valor del progreso después del evento',
  `source_type` varchar(50) DEFAULT NULL,
  `source_id` bigint DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_achievement_event`),
  KEY `idx_user_achievement_event_timeline` (`id_user_achievement`,`created_at`),
  CONSTRAINT `user_achievement_event_ibfk_1` FOREIGN KEY (`id_user_achievement`) REFERENCES `user_achievement` (`id_user_achievement`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievement_event`
--

LOCK TABLES `user_achievement_event` WRITE;
/*!40000 ALTER TABLE `user_achievement_event` DISABLE KEYS */;
INSERT INTO `user_achievement_event` VALUES (1,1,'PROGRESS',1,1,'streak',2,NULL,'2025-11-02 20:37:30'),(2,2,'PROGRESS',1,1,'streak',2,NULL,'2025-11-02 20:37:30'),(3,3,'PROGRESS',1,1,'streak',2,NULL,'2025-11-02 20:37:30'),(4,6,'PROGRESS',1,1,'assistance',NULL,NULL,'2025-11-02 20:37:30'),(5,6,'UNLOCKED',1,1,'assistance',NULL,NULL,'2025-11-02 20:37:30'),(6,7,'PROGRESS',1,1,'assistance',NULL,NULL,'2025-11-02 20:37:30'),(7,8,'PROGRESS',1,1,'assistance',NULL,NULL,'2025-11-02 20:37:30'),(8,9,'PROGRESS',1,1,'assistance',NULL,NULL,'2025-11-02 20:37:30'),(9,10,'PROGRESS',25,25,'user_profile',NULL,NULL,'2025-11-02 20:37:51'),(10,11,'PROGRESS',25,25,'user_profile',NULL,NULL,'2025-11-02 20:37:51'),(11,10,'PROGRESS',10,35,'user_profile',NULL,NULL,'2025-11-05 02:40:43'),(12,11,'PROGRESS',10,35,'user_profile',NULL,NULL,'2025-11-05 02:40:43'),(13,10,'PROGRESS',10,45,'user_profile',NULL,NULL,'2025-11-05 02:41:15'),(14,11,'PROGRESS',10,45,'user_profile',NULL,NULL,'2025-11-05 02:41:15'),(15,10,'PROGRESS',10,55,'user_profile',NULL,NULL,'2025-11-05 02:43:08'),(16,11,'PROGRESS',10,55,'user_profile',NULL,NULL,'2025-11-05 02:43:08'),(17,10,'PROGRESS',10,65,'user_profile',NULL,NULL,'2025-11-05 03:07:36'),(18,11,'PROGRESS',10,65,'user_profile',NULL,NULL,'2025-11-05 03:07:36'),(19,10,'PROGRESS',10,75,'user_profile',NULL,NULL,'2025-11-05 03:12:11'),(20,11,'PROGRESS',10,75,'user_profile',NULL,NULL,'2025-11-05 03:12:11'),(21,10,'PROGRESS',10,85,'user_profile',NULL,NULL,'2025-11-05 03:19:36'),(22,11,'PROGRESS',10,85,'user_profile',NULL,NULL,'2025-11-05 03:19:36'),(23,10,'PROGRESS',10,95,'user_profile',NULL,NULL,'2025-11-05 03:19:51'),(24,11,'PROGRESS',10,95,'user_profile',NULL,NULL,'2025-11-05 03:19:51'),(25,10,'PROGRESS',10,105,'user_profile',NULL,NULL,'2025-11-05 03:20:03'),(26,10,'UNLOCKED',10,105,'user_profile',NULL,NULL,'2025-11-05 03:20:03'),(27,11,'PROGRESS',10,105,'user_profile',NULL,NULL,'2025-11-05 03:20:03');
/*!40000 ALTER TABLE `user_achievement_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_body_metrics`
--

DROP TABLE IF EXISTS `user_body_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_body_metrics` (
  `id_metric` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `date` date NOT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `body_fat_percentage` decimal(4,2) DEFAULT NULL,
  `muscle_mass_kg` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(4,2) DEFAULT NULL COMMENT 'Índice de masa corporal',
  `waist_cm` decimal(5,2) DEFAULT NULL,
  `chest_cm` decimal(5,2) DEFAULT NULL,
  `arms_cm` decimal(5,2) DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_metric`),
  KEY `idx_body_metrics_user_date` (`id_user_profile`,`date`),
  CONSTRAINT `user_body_metrics_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_body_metrics`
--

LOCK TABLES `user_body_metrics` WRITE;
/*!40000 ALTER TABLE `user_body_metrics` DISABLE KEYS */;
INSERT INTO `user_body_metrics` VALUES (1,2,'2025-11-01',72.00,170.00,NULL,NULL,24.91,NULL,NULL,NULL,NULL,'2025-11-01 02:35:26'),(2,1,'2025-08-10',72.50,175.00,NULL,NULL,NULL,NULL,NULL,NULL,'Medición de prueba desde curl','2025-11-01 04:45:34'),(3,2,'2025-08-10',72.50,175.00,NULL,NULL,NULL,NULL,NULL,NULL,'Medición de prueba desde curl','2025-11-01 04:45:48'),(4,2,'2025-07-10',72.50,175.00,NULL,NULL,NULL,NULL,NULL,NULL,'Medición de prueba desde curl','2025-11-01 04:46:20'),(5,2,'2025-11-10',72.00,172.00,20.00,45.00,24.34,80.00,90.00,37.00,'Medición de prueba desde curl','2025-11-01 04:46:29'),(6,2,'2025-08-10',69.50,175.00,NULL,NULL,NULL,NULL,NULL,NULL,'Medición de prueba desde curl','2025-11-01 04:47:44'),(7,2,'2025-07-10',64.50,175.00,NULL,NULL,NULL,NULL,NULL,NULL,'Medición de prueba desde curl','2025-11-01 04:47:53'),(8,2,'2025-06-10',57.50,175.00,NULL,NULL,NULL,NULL,NULL,NULL,'Medición de prueba desde curl','2025-11-01 04:48:01');
/*!40000 ALTER TABLE `user_body_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_daily_challenge`
--

DROP TABLE IF EXISTS `user_daily_challenge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_daily_challenge` (
  `id_user_profile` int NOT NULL,
  `id_challenge` int NOT NULL,
  `progress` int NOT NULL DEFAULT '0' COMMENT 'Progreso actual del usuario',
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `tokens_earned` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_user_profile`,`id_challenge`),
  KEY `id_challenge` (`id_challenge`),
  KEY `idx_user_daily_challenge_completed` (`id_user_profile`,`completed`,`completed_at`),
  CONSTRAINT `user_daily_challenge_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_daily_challenge_ibfk_2` FOREIGN KEY (`id_challenge`) REFERENCES `daily_challenge` (`id_challenge`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_daily_challenge`
--

LOCK TABLES `user_daily_challenge` WRITE;
/*!40000 ALTER TABLE `user_daily_challenge` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_daily_challenge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_device_token`
--

DROP TABLE IF EXISTS `user_device_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_device_token` (
  `id_device_token` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `token` varchar(500) NOT NULL COMMENT 'Token del dispositivo (FCM, APNS)',
  `platform` enum('IOS','ANDROID','WEB') NOT NULL,
  `device_id` varchar(255) DEFAULT NULL COMMENT 'ID único del dispositivo',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_device_token`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `idx_device_token_token` (`token`),
  KEY `idx_device_token_user_active` (`id_user_profile`,`is_active`),
  CONSTRAINT `user_device_token_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_device_token`
--

LOCK TABLES `user_device_token` WRITE;
/*!40000 ALTER TABLE `user_device_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_device_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorite_gym`
--

DROP TABLE IF EXISTS `user_favorite_gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorite_gym` (
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_profile`,`id_gym`),
  KEY `idx_favorite_gym` (`id_gym`),
  CONSTRAINT `user_favorite_gym_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_favorite_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorite_gym`
--

LOCK TABLES `user_favorite_gym` WRITE;
/*!40000 ALTER TABLE `user_favorite_gym` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_favorite_gym` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_gym`
--

DROP TABLE IF EXISTS `user_gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_gym` (
  `id_user_gym` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `subscription_plan` enum('MONTHLY','WEEKLY','DAILY','ANNUAL') DEFAULT NULL COMMENT 'Tipo de plan contratado',
  `subscription_start` date DEFAULT NULL COMMENT 'Inicio de la suscripción',
  `subscription_end` date DEFAULT NULL COMMENT 'Fin de la suscripción',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si la suscripción está activa',
  `trial_used` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el usuario ya usó su visita de prueba en este gimnasio',
  `trial_date` date DEFAULT NULL COMMENT 'Fecha en que usó el trial (si aplica)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_gym`),
  UNIQUE KEY `idx_user_gym_user_gym` (`id_user_profile`,`id_gym`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_user_gym_active_end_trial` (`is_active`,`subscription_end`,`trial_used`),
  CONSTRAINT `user_gym_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_gym`
--

LOCK TABLES `user_gym` WRITE;
/*!40000 ALTER TABLE `user_gym` DISABLE KEYS */;
INSERT INTO `user_gym` VALUES (1,2,1,'MONTHLY','2025-11-04','2025-11-23',1,0,NULL,'2025-11-02 20:37:17','2025-11-04 13:48:55');
/*!40000 ALTER TABLE `user_gym` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_imported_routine`
--

DROP TABLE IF EXISTS `user_imported_routine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_imported_routine` (
  `id_import` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_template_routine` int NOT NULL,
  `id_user_routine` int NOT NULL COMMENT 'Copia de la rutina para el usuario',
  `imported_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_import`),
  KEY `id_template_routine` (`id_template_routine`),
  KEY `id_user_routine` (`id_user_routine`),
  KEY `idx_imported_routine_user` (`id_user_profile`),
  CONSTRAINT `user_imported_routine_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_imported_routine_ibfk_2` FOREIGN KEY (`id_template_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_imported_routine_ibfk_3` FOREIGN KEY (`id_user_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_imported_routine`
--

LOCK TABLES `user_imported_routine` WRITE;
/*!40000 ALTER TABLE `user_imported_routine` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_imported_routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notification_settings`
--

DROP TABLE IF EXISTS `user_notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_settings` (
  `id_setting` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `reminders_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `achievements_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `rewards_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `gym_updates_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `payment_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `social_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `system_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `challenge_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Push notifications globales',
  `email_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `quiet_hours_start` time DEFAULT NULL COMMENT 'Inicio de horario silencioso',
  `quiet_hours_end` time DEFAULT NULL COMMENT 'Fin de horario silencioso',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_setting`),
  UNIQUE KEY `id_user_profile` (`id_user_profile`),
  UNIQUE KEY `idx_notif_settings_user` (`id_user_profile`),
  CONSTRAINT `user_notification_settings_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification_settings`
--

LOCK TABLES `user_notification_settings` WRITE;
/*!40000 ALTER TABLE `user_notification_settings` DISABLE KEYS */;
INSERT INTO `user_notification_settings` VALUES (1,2,0,0,0,0,0,0,0,0,0,0,'22:00:00','08:00:00','2025-11-03 01:08:53','2025-11-04 13:50:01'),(4,14,1,1,1,1,1,1,1,1,1,1,NULL,NULL,'2025-11-03 04:12:21','2025-11-03 04:12:21');
/*!40000 ALTER TABLE `user_notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id_user_profile` int NOT NULL AUTO_INCREMENT COMMENT 'ID único del perfil de usuario',
  `id_account` int NOT NULL COMMENT 'Relación 1:1 con account',
  `name` varchar(50) NOT NULL COMMENT 'Nombre del usuario',
  `lastname` varchar(50) NOT NULL COMMENT 'Apellido del usuario',
  `gender` enum('M','F','O') NOT NULL DEFAULT 'O' COMMENT 'Género: M (Masculino), F (Femenino), O (Otro)',
  `birth_date` date DEFAULT NULL COMMENT 'Fecha de nacimiento (YYYY-MM-DD)',
  `locality` varchar(100) DEFAULT NULL COMMENT 'Localidad/Ciudad del usuario',
  `app_tier` enum('FREE','PREMIUM') NOT NULL DEFAULT 'FREE' COMMENT 'Tier de la aplicación (FREE o PREMIUM)',
  `premium_since` datetime DEFAULT NULL COMMENT 'Fecha desde que el usuario es premium',
  `premium_expires` datetime DEFAULT NULL COMMENT 'Fecha de expiración del premium',
  `tokens` int NOT NULL DEFAULT '0' COMMENT 'Tokens acumulados (balance actual)',
  `profile_picture_url` varchar(500) DEFAULT NULL COMMENT 'URL de la foto de perfil',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete: fecha de eliminación lógica',
  PRIMARY KEY (`id_user_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  UNIQUE KEY `idx_user_profiles_account` (`id_account`),
  KEY `idx_user_profiles_app_tier` (`app_tier`),
  KEY `idx_user_profiles_premium_expires` (`premium_expires`),
  KEY `idx_user_profiles_tokens` (`tokens`),
  KEY `idx_user_profiles_deleted` (`deleted_at`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,2,'Test','User','M','1990-01-15','Test City','FREE',NULL,NULL,0,NULL,'2025-11-01 01:45:03','2025-11-01 01:45:03',NULL),(2,3,'Gonzalo','Gomez','M','1999-12-02','Chaco','FREE',NULL,NULL,105,NULL,'2025-11-01 01:56:34','2025-11-05 03:20:03',NULL),(3,4,'Progress','Test','O',NULL,NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 02:03:28','2025-11-01 02:03:28',NULL),(4,5,'Routine','Tester','O',NULL,NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 04:48:23','2025-11-01 04:48:23',NULL),(5,6,'Final','Tester','O',NULL,NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 05:12:53','2025-11-01 05:12:53',NULL),(6,7,'Test','Final','O',NULL,NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 05:14:34','2025-11-01 05:14:34',NULL),(7,8,'UserRoutine','Test','O',NULL,NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 05:16:05','2025-11-01 05:16:05',NULL),(8,9,'Success','Test','O',NULL,NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 05:18:52','2025-11-01 05:18:52',NULL),(9,10,'Test','User','O','1990-01-01',NULL,'FREE',NULL,NULL,0,NULL,'2025-11-01 05:28:55','2025-11-01 05:28:55',NULL),(10,11,'Final','Test','O','1990-01-01',NULL,'FREE',NULL,NULL,0,NULL,'2025-11-02 07:10:27','2025-11-02 07:10:27',NULL),(11,12,'Test','Complete','O','1990-01-01',NULL,'FREE',NULL,NULL,0,NULL,'2025-11-02 07:15:00','2025-11-02 07:15:00',NULL),(12,13,'Suite','Final','O','1990-01-01',NULL,'FREE',NULL,NULL,0,NULL,'2025-11-02 07:17:47','2025-11-02 07:17:47',NULL),(13,14,'Final','Suite','O','1990-01-01',NULL,'FREE',NULL,NULL,0,NULL,'2025-11-02 07:22:26','2025-11-02 07:22:26',NULL),(14,15,'Nuria','Gonzalez','F','2005-06-28','Chaco','FREE',NULL,NULL,0,NULL,'2025-11-03 04:03:51','2025-11-03 04:03:51',NULL);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_routine`
--

DROP TABLE IF EXISTS `user_routine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_routine` (
  `id_user_routine` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_routine` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_user_routine`),
  KEY `id_routine` (`id_routine`),
  KEY `idx_user_routine_user_active` (`id_user_profile`,`is_active`),
  CONSTRAINT `user_routine_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_routine_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_routine`
--

LOCK TABLES `user_routine` WRITE;
/*!40000 ALTER TABLE `user_routine` DISABLE KEYS */;
INSERT INTO `user_routine` VALUES (6,8,11,0,'2025-01-01 00:00:00','2025-11-01 05:19:18'),(7,5,14,1,'2025-10-01 00:00:00',NULL),(8,9,15,1,'2025-10-01 00:00:00',NULL),(9,10,16,1,'2025-10-01 00:00:00',NULL),(10,11,17,1,'2025-10-01 00:00:00',NULL),(11,12,18,1,'2025-10-01 00:00:00',NULL),(12,13,19,0,'2025-10-01 00:00:00','2025-11-02 07:23:14'),(13,2,22,0,'2025-11-04 00:00:00','2025-11-04 16:14:18'),(14,2,22,1,'2025-11-04 00:00:00',NULL);
/*!40000 ALTER TABLE `user_routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_session`
--

DROP TABLE IF EXISTS `workout_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_session` (
  `id_workout_session` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_routine` int DEFAULT NULL,
  `id_routine_day` int DEFAULT NULL,
  `status` enum('IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `total_sets` int NOT NULL DEFAULT '0',
  `total_reps` int NOT NULL DEFAULT '0',
  `total_weight` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_workout_session`),
  KEY `id_routine` (`id_routine`),
  KEY `id_routine_day` (`id_routine_day`),
  KEY `idx_workout_session_user_status` (`id_user_profile`,`status`),
  KEY `idx_workout_session_started` (`started_at`),
  CONSTRAINT `workout_session_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workout_session_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workout_session_ibfk_3` FOREIGN KEY (`id_routine_day`) REFERENCES `routine_day` (`id_routine_day`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_session`
--

LOCK TABLES `workout_session` WRITE;
/*!40000 ALTER TABLE `workout_session` DISABLE KEYS */;
INSERT INTO `workout_session` VALUES (1,2,22,NULL,'COMPLETED','2025-11-04 16:46:24',NULL,35659,1,12,0.00,NULL,'2025-11-04 16:46:24','2025-11-05 02:40:43'),(2,2,22,NULL,'COMPLETED','2025-11-05 02:41:04',NULL,10,0,0,0.00,NULL,'2025-11-05 02:41:05','2025-11-05 02:41:14'),(3,2,22,NULL,'COMPLETED','2025-11-05 02:42:39',NULL,29,0,0,0.00,NULL,'2025-11-05 02:42:40','2025-11-05 02:43:08'),(4,2,22,NULL,'COMPLETED','2025-11-05 02:44:57',NULL,1359,3,30,1110.00,NULL,'2025-11-05 02:44:58','2025-11-05 03:07:36'),(5,2,22,NULL,'COMPLETED','2025-11-05 03:11:56',NULL,15,1,10,10000.00,NULL,'2025-11-05 03:11:57','2025-11-05 03:12:11'),(6,2,22,NULL,'COMPLETED','2025-11-05 03:14:38',NULL,298,0,0,0.00,NULL,'2025-11-05 03:14:39','2025-11-05 03:19:36'),(7,2,23,NULL,'COMPLETED','2025-11-05 03:19:46',NULL,5,0,0,0.00,NULL,'2025-11-05 03:19:46','2025-11-05 03:19:51'),(8,2,23,NULL,'COMPLETED','2025-11-05 03:19:58',NULL,5,0,0,0.00,NULL,'2025-11-05 03:19:59','2025-11-05 03:20:03');
/*!40000 ALTER TABLE `workout_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_set`
--

DROP TABLE IF EXISTS `workout_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_set` (
  `id_workout_set` int NOT NULL AUTO_INCREMENT,
  `id_workout_session` int NOT NULL,
  `id_exercise` int NOT NULL,
  `set_number` int NOT NULL COMMENT 'Número de serie del ejercicio',
  `reps` int DEFAULT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL COMMENT 'Para ejercicios de tiempo',
  `rest_seconds` int DEFAULT NULL,
  `is_pr` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es un récord personal',
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_workout_set`),
  KEY `idx_workout_set_session` (`id_workout_session`),
  KEY `idx_workout_set_exercise_pr` (`id_exercise`,`is_pr`),
  CONSTRAINT `workout_set_ibfk_1` FOREIGN KEY (`id_workout_session`) REFERENCES `workout_session` (`id_workout_session`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workout_set_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_set`
--

LOCK TABLES `workout_set` WRITE;
/*!40000 ALTER TABLE `workout_set` DISABLE KEYS */;
INSERT INTO `workout_set` VALUES (1,1,20,1,12,NULL,NULL,60,0,NULL,'2025-11-04 16:54:43'),(2,4,20,1,10,1.00,NULL,NULL,0,NULL,'2025-11-05 03:06:34'),(3,4,20,2,10,10.00,NULL,NULL,0,NULL,'2025-11-05 03:06:56'),(4,4,20,3,10,100.00,NULL,NULL,0,NULL,'2025-11-05 03:07:10'),(5,5,20,1,10,1000.00,NULL,NULL,0,NULL,'2025-11-05 03:12:06');
/*!40000 ALTER TABLE `workout_set` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-05  3:28:10
