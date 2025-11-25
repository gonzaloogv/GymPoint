mysqldump: [Warning] Using a password on the command line interface can be insecure.
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
-- Current Database: `gympoint`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gympoint` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `gympoint`;

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
INSERT INTO `SequelizeMeta` VALUES ('20250925-add-logo-url-to-gyms.js'),('20251004-create-accounts-and-profiles.js'),('20251005-migrate-existing-users.js'),('20251006-redirect-fks-to-user-profiles.js'),('20251007-complete-fk-migration.js'),('20251008-rewards-snapshot-and-indexes.js'),('20251009-reward-gym-stats-daily.js'),('20251010-add-created-by-to-exercise.js'),('20251011-fix-missing-fks.js'),('20251012-cleanup-and-add-fks.js'),('20251014-transaction-to-ledger.js'),('20251015-add-critical-indexes.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_roles`
--

DROP TABLE IF EXISTS `account_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_roles` (
  `id_account_role` int NOT NULL AUTO_INCREMENT,
  `id_account` int NOT NULL,
  `id_role` int NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account_role`),
  UNIQUE KEY `unique_account_role` (`id_account`,`id_role`),
  KEY `id_role` (`id_role`),
  CONSTRAINT `account_roles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_roles_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_roles`
--

LOCK TABLES `account_roles` WRITE;
/*!40000 ALTER TABLE `account_roles` DISABLE KEYS */;
INSERT INTO `account_roles` VALUES (3,3,1,'2025-10-06 02:07:30'),(4,4,2,'2025-10-06 02:07:30');
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
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_accounts_email` (`email`),
  KEY `idx_accounts_google_id` (`google_id`),
  KEY `idx_accounts_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (3,'gonzalo@example.com','$2b$10$kjWfjftU9RkPVyM3pl7jhehDcJO00/2HrVP7cEe1wdVsiPRReo.kW','local',NULL,1,1,NULL,'2025-10-06 02:07:30','2025-10-06 02:07:30'),(4,'admin@gympoint.com','$2b$10$7IUQtRTXQF3xg1/evFC9JeEobV1Ew781vkaddTrYY7uBowcmUYHYi','local',NULL,1,1,NULL,'2025-10-06 02:07:30','2025-10-06 02:07:30');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_profiles`
--

DROP TABLE IF EXISTS `admin_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_profiles` (
  `id_admin_profile` int NOT NULL AUTO_INCREMENT,
  `id_account` int NOT NULL COMMENT 'Relación 1:1 con account',
  `name` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `department` varchar(100) DEFAULT NULL COMMENT 'Departamento (IT, Support, Management, etc.)',
  `notes` text COMMENT 'Notas internas sobre el admin',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  CONSTRAINT `admin_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_profiles`
--

LOCK TABLES `admin_profiles` WRITE;
/*!40000 ALTER TABLE `admin_profiles` DISABLE KEYS */;
INSERT INTO `admin_profiles` VALUES (2,4,'Admin','Principal','System','Migrado desde user #2','2025-10-06 02:07:30','2025-10-06 02:07:30');
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
  `date` date NOT NULL,
  `id_gym` int NOT NULL,
  `id_streak` int NOT NULL,
  `hour` time NOT NULL,
  `id_user` int DEFAULT NULL,
  `id_user_profile` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_assistance`),
  KEY `id_gym` (`id_gym`),
  KEY `id_streak` (`id_streak`),
  KEY `idx_assistance_user_date` (`id_user`,`date`),
  KEY `idx_assistance_gym_date` (`id_gym`,`date`),
  CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`),
  CONSTRAINT `assistance_ibfk_3` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`),
  CONSTRAINT `fk_assistance_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assistance`
--

LOCK TABLES `assistance` WRITE;
/*!40000 ALTER TABLE `assistance` DISABLE KEYS */;
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
  `id_reward` int NOT NULL,
  `id_code` int DEFAULT NULL,
  `claimed_date` date NOT NULL,
  `provider_snapshot` enum('system','gym') DEFAULT NULL,
  `gym_id_snapshot` bigint DEFAULT NULL,
  `status` enum('pending','redeemed','revoked') NOT NULL,
  `id_user` int DEFAULT NULL,
  PRIMARY KEY (`id_claimed_reward`),
  KEY `id_reward` (`id_reward`),
  KEY `fk_claimed_reward_code` (`id_code`),
  KEY `idx_claimed_reward_gym_date` (`gym_id_snapshot`,`claimed_date`),
  KEY `idx_claimed_reward_stats` (`id_reward`,`status`,`claimed_date`),
  KEY `fk_claimed_reward_user_profile` (`id_user`),
  CONSTRAINT `claimed_reward_ibfk_2` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`),
  CONSTRAINT `fk_claimed_reward_code` FOREIGN KEY (`id_code`) REFERENCES `reward_code` (`id_code`) ON DELETE SET NULL,
  CONSTRAINT `fk_claimed_reward_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `claimed_reward`
--

LOCK TABLES `claimed_reward` WRITE;
/*!40000 ALTER TABLE `claimed_reward` DISABLE KEYS */;
/*!40000 ALTER TABLE `claimed_reward` ENABLE KEYS */;
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
  `muscular_group` varchar(100) NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id_exercise`),
  KEY `exercise_created_by_foreign_idx` (`created_by`),
  CONSTRAINT `exercise_created_by_foreign_idx` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (1,'Press de banca','Pecho',NULL),(2,'Press de banca inclinado','Pecho',NULL),(3,'Mariposa','Pecho',NULL);
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
  `achieved_goal` tinyint(1) NOT NULL,
  `id_user` int NOT NULL,
  `goal` tinyint NOT NULL,
  `assist` tinyint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_frequency`),
  KEY `id_user` (`id_user`),
  KEY `idx_frequency_user` (`id_user`),
  CONSTRAINT `fk_frequency_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequency`
--

LOCK TABLES `frequency` WRITE;
/*!40000 ALTER TABLE `frequency` DISABLE KEYS */;
INSERT INTO `frequency` VALUES (2,0,2,3,0,'2025-10-06 04:01:38');
/*!40000 ALTER TABLE `frequency` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym`
--

DROP TABLE IF EXISTS `gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym` (
  `id_gym` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `social_media` text,
  `registration_date` date NOT NULL,
  `equipment` text NOT NULL,
  `month_price` double NOT NULL,
  `week_price` double NOT NULL,
  `logo_url` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id_gym`),
  KEY `idx_gym_location` (`latitude`,`longitude`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym`
--

LOCK TABLES `gym` WRITE;
/*!40000 ALTER TABLE `gym` DISABLE KEYS */;
INSERT INTO `gym` VALUES (1,'Iron Temple','Gimnasio premium con entrenamiento personalizado y crossfit','Resistencia','Av. Córdoba 1234',-34.603684,-58.381559,'+54 9 11 1234 5678','contacto@irontemple.com','https://www.irontemple.com','@irontemplegym','2025-05-30','Mancuernas, barras olímpicas, bicicletas, cintas de correr, zona de pesas libres, sala funcional',25000,8000,NULL),(2,'Iron Gym Reloaded','Muy completo','Resistencia','San Martín 456',-27.479532,-59.009432,NULL,NULL,NULL,NULL,'2025-05-31','Pesas, cardio, boxeo',13000,4000,NULL),(3,'Bulldog Academy','Muy completo','Resistencia','San Martín 456',-27.491000,-58.811000,NULL,NULL,NULL,NULL,'2025-05-31','Pesas, cardio, boxeo',13000,4000,NULL),(4,'Gimnasio Centro','Muy completo','Corrientes','San Martín 456',-27.481000,-58.811000,NULL,NULL,NULL,NULL,'2025-05-31','Pesas, cardio, boxeo',13000,4000,NULL),(5,'Gimnasio Centro','Muy completo','Corrientes','San Martín 456',-27.481000,-58.811000,NULL,NULL,NULL,NULL,'2025-05-31','Pesas, cardio, boxeo',13000,4000,NULL);
/*!40000 ALTER TABLE `gym` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_gym_type`
--

DROP TABLE IF EXISTS `gym_gym_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_gym_type` (
  `id_gym` int NOT NULL,
  `id_type` int NOT NULL,
  PRIMARY KEY (`id_gym`,`id_type`),
  KEY `id_type` (`id_type`),
  CONSTRAINT `gym_gym_type_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE,
  CONSTRAINT `gym_gym_type_ibfk_2` FOREIGN KEY (`id_type`) REFERENCES `gym_type` (`id_type`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_gym_type`
--

LOCK TABLES `gym_gym_type` WRITE;
/*!40000 ALTER TABLE `gym_gym_type` DISABLE KEYS */;
INSERT INTO `gym_gym_type` VALUES (1,1),(2,1),(3,1),(5,1),(1,2),(2,2),(3,2),(5,2);
/*!40000 ALTER TABLE `gym_gym_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_payment`
--

DROP TABLE IF EXISTS `gym_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_payment` (
  `id_payment` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_gym` int NOT NULL,
  `mount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `status` varchar(20) NOT NULL,
  PRIMARY KEY (`id_payment`),
  KEY `id_user` (`id_user`),
  KEY `id_gym` (`id_gym`),
  CONSTRAINT `fk_gym_payment_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_payment`
--

LOCK TABLES `gym_payment` WRITE;
/*!40000 ALTER TABLE `gym_payment` DISABLE KEYS */;
INSERT INTO `gym_payment` VALUES (1,2,1,3000.00,'mercadopago','2025-05-01','PAGADO');
/*!40000 ALTER TABLE `gym_payment` ENABLE KEYS */;
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
  `day_of_week` varchar(10) NOT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `closed` tinyint(1) NOT NULL,
  PRIMARY KEY (`id_schedule`),
  KEY `id_gym` (`id_gym`),
  CONSTRAINT `gym_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
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
  `id_special` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `date` date NOT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `closed` tinyint(1) NOT NULL,
  `motive` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_special`),
  KEY `fk_special_schedule_gym` (`id_gym`),
  CONSTRAINT `fk_special_schedule_gym` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE
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
-- Table structure for table `gym_type`
--

DROP TABLE IF EXISTS `gym_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_type` (
  `id_type` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id_type`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_type`
--

LOCK TABLES `gym_type` WRITE;
/*!40000 ALTER TABLE `gym_type` DISABLE KEYS */;
INSERT INTO `gym_type` VALUES (4,'Cardio'),(2,'Crossfit'),(3,'Funcional'),(5,'HIIT'),(1,'Musculación'),(6,'Yoga');
/*!40000 ALTER TABLE `gym_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress`
--

DROP TABLE IF EXISTS `progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress` (
  `id_progress` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `date` date NOT NULL,
  `body_weight` int DEFAULT NULL,
  `body_fat` tinyint DEFAULT NULL,
  PRIMARY KEY (`id_progress`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `fk_progress_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress`
--

LOCK TABLES `progress` WRITE;
/*!40000 ALTER TABLE `progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progress_exercise`
--

DROP TABLE IF EXISTS `progress_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progress_exercise` (
  `id_progress` int NOT NULL,
  `id_exercise` int NOT NULL,
  `used_weight` int NOT NULL,
  `reps` int NOT NULL,
  PRIMARY KEY (`id_progress`,`id_exercise`),
  KEY `id_exercise` (`id_exercise`),
  CONSTRAINT `progress_exercise_ibfk_1` FOREIGN KEY (`id_progress`) REFERENCES `progress` (`id_progress`),
  CONSTRAINT `progress_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress_exercise`
--

LOCK TABLES `progress_exercise` WRITE;
/*!40000 ALTER TABLE `progress_exercise` DISABLE KEYS */;
/*!40000 ALTER TABLE `progress_exercise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_token`),
  KEY `fk_refresh_token_user_profile` (`id_user`),
  CONSTRAINT `fk_refresh_token_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3Mzc5NTIsImV4cCI6MTc0OTM0Mjc1Mn0.QGeSvZk49x9LI-L7axK8xFWDvymTkeKstvpkaxjMT-Y','PostmanRuntime/7.44.0','::1','2025-06-08 00:32:32',0,'2025-06-01 00:32:32',2),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NDM4OTQsImV4cCI6MTc0OTM0ODY5NH0.13jaJoWn56xG55Dd6UX5N6h13Ca2dbLK9nsFRqh9MJk','PostmanRuntime/7.44.0','::1','2025-06-08 02:11:34',0,'2025-06-01 02:11:34',2),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NDQwMzUsImV4cCI6MTc0OTM0ODgzNX0.2DJPd7Zxtat09Pr8aZmhmlSvuaxC2hUz0YSUP7N-Hjs','PostmanRuntime/7.44.0','::1','2025-06-08 02:13:55',0,'2025-06-01 02:13:55',2),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NDQxMDksImV4cCI6MTc0OTM0ODkwOX0.R4rkxeUIILMcehSTH9MsT8C45z6vrgUefuGQS9yTBO4','PostmanRuntime/7.44.0','::1','2025-06-08 02:15:09',0,'2025-06-01 02:15:09',2),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NDQyMTcsImV4cCI6MTc0OTM0OTAxN30.QGBixVqDxkRmf1cwDuGvSjyYG_DKAWmRxV8yzrAn8qA','PostmanRuntime/7.44.0','::1','2025-06-08 02:16:57',0,'2025-06-01 02:16:57',2),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NDQyODgsImV4cCI6MTc0OTM0OTA4OH0.Yxb9qc-zFfMlXGMddHXzNrNMijn6n4XRQj3L1gzA86U','PostmanRuntime/7.44.0','::1','2025-06-08 02:18:08',1,'2025-06-01 02:18:08',2),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NDQ0NDIsImV4cCI6MTc0OTM0OTI0Mn0.jSx75ZewGul9ujKit8Q5tAQvwByFJ4OYfI_L3laSYgk','PostmanRuntime/7.44.0','::1','2025-06-08 02:20:42',1,'2025-06-01 02:20:42',2),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJpYXQiOjE3NDg3NTAzMTcsImV4cCI6MTc1MTM0MjMxN30.Xo-LbTxc9iYihYT_uVo7Vr1er7xuN7mp8peK53o2VBE','PostmanRuntime/7.44.0','::1','2025-07-01 03:58:37',0,'2025-06-01 03:58:37',2);
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward`
--

DROP TABLE IF EXISTS `reward`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward` (
  `id_reward` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(250) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `cost_tokens` int NOT NULL,
  `available` tinyint(1) NOT NULL,
  `stock` int NOT NULL,
  `start_date` date NOT NULL,
  `finish_date` date NOT NULL,
  `creation_date` date NOT NULL,
  `provider` enum('system','gym') NOT NULL DEFAULT 'system',
  `id_gym` bigint DEFAULT NULL,
  `fulfillment_type` enum('auto','manual') NOT NULL DEFAULT 'auto',
  PRIMARY KEY (`id_reward`),
  KEY `idx_reward_gym_provider` (`id_gym`,`provider`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward`
--

LOCK TABLES `reward` WRITE;
/*!40000 ALTER TABLE `reward` DISABLE KEYS */;
INSERT INTO `reward` VALUES (1,'Descuento del 20%','Canjeable por un 20% de descuento en la próxima mensualidad','descuento',100,1,49,'2025-05-01','2025-12-31','2025-05-31','system',NULL,'auto');
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
  `id_gym` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `used` tinyint(1) NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`id_code`),
  KEY `id_reward` (`id_reward`),
  KEY `id_gym` (`id_gym`),
  CONSTRAINT `reward_code_ibfk_1` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`),
  CONSTRAINT `reward_code_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_code`
--

LOCK TABLES `reward_code` WRITE;
/*!40000 ALTER TABLE `reward_code` DISABLE KEYS */;
INSERT INTO `reward_code` VALUES (1,1,1,'GP-7QZPYULO','2025-08-29 07:05:55',1,'2025-05-31 07:05:55');
/*!40000 ALTER TABLE `reward_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_gym_stats_daily`
--

DROP TABLE IF EXISTS `reward_gym_stats_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_gym_stats_daily` (
  `day` date NOT NULL,
  `gym_id` int NOT NULL,
  `claims` int NOT NULL DEFAULT '0',
  `redeemed` int NOT NULL DEFAULT '0',
  `revoked` int NOT NULL DEFAULT '0',
  `tokens_spent` int NOT NULL DEFAULT '0',
  `tokens_refunded` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`day`,`gym_id`),
  KEY `idx_reward_gym_stats_day` (`day`),
  KEY `idx_reward_gym_stats_gym_day` (`gym_id`,`day`),
  CONSTRAINT `reward_gym_stats_daily_ibfk_1` FOREIGN KEY (`gym_id`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
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
  `id_role` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL COMMENT 'Nombre del rol (USER, ADMIN, MODERATOR, etc.)',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descripción del rol',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'USER','Usuario normal de la aplicación móvil','2025-10-06 02:02:08'),(2,'ADMIN','Administrador del sistema con acceso total','2025-10-06 02:02:08');
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
  `description` varchar(250) DEFAULT NULL,
  `created_by` int NOT NULL,
  PRIMARY KEY (`id_routine`),
  KEY `fk_routine_user_profile` (`created_by`),
  CONSTRAINT `fk_routine_user_profile` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine`
--

LOCK TABLES `routine` WRITE;
/*!40000 ALTER TABLE `routine` DISABLE KEYS */;
INSERT INTO `routine` VALUES (1,'Fuerza Semanal','Rutina enfocada en fuerza para tren superior',2);
/*!40000 ALTER TABLE `routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routine_exercise`
--

DROP TABLE IF EXISTS `routine_exercise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routine_exercise` (
  `id_routine` int NOT NULL,
  `id_exercise` int NOT NULL,
  `series` tinyint NOT NULL,
  `reps` tinyint NOT NULL,
  `order` tinyint NOT NULL,
  PRIMARY KEY (`id_routine`,`id_exercise`),
  KEY `id_exercise` (`id_exercise`),
  CONSTRAINT `routine_exercise_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`),
  CONSTRAINT `routine_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine_exercise`
--

LOCK TABLES `routine_exercise` WRITE;
/*!40000 ALTER TABLE `routine_exercise` DISABLE KEYS */;
INSERT INTO `routine_exercise` VALUES (1,1,4,10,1),(1,2,3,12,2);
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
  `id_user` int DEFAULT NULL,
  `value` int NOT NULL,
  `id_frequency` int NOT NULL,
  `last_value` int DEFAULT NULL,
  `recovery_items` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_streak`),
  KEY `id_user` (`id_user`),
  KEY `fk_streak_frequency` (`id_frequency`),
  KEY `idx_streak_user` (`id_user`),
  CONSTRAINT `fk_streak_frequency` FOREIGN KEY (`id_frequency`) REFERENCES `frequency` (`id_frequency`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_streak_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streak`
--

LOCK TABLES `streak` WRITE;
/*!40000 ALTER TABLE `streak` DISABLE KEYS */;
INSERT INTO `streak` VALUES (2,2,0,2,NULL,0,'2025-10-06 04:01:38','2025-10-06 04:01:38');
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
  `delta` int NOT NULL COMMENT 'Positivo=ganancia, negativo=gasto',
  `reason` varchar(100) NOT NULL COMMENT 'ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, WEEKLY_BONUS, etc.',
  `ref_type` varchar(50) DEFAULT NULL COMMENT 'assistance, claimed_reward, routine, etc.',
  `ref_id` bigint DEFAULT NULL COMMENT 'ID del registro relacionado',
  `balance_after` int NOT NULL COMMENT 'Balance después de aplicar delta',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ledger`),
  KEY `idx_ledger_user_date` (`id_user_profile`,`created_at`),
  KEY `idx_ledger_ref` (`ref_type`,`ref_id`),
  KEY `idx_ledger_reason` (`reason`),
  CONSTRAINT `token_ledger_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_ledger`
--

LOCK TABLES `token_ledger` WRITE;
/*!40000 ALTER TABLE `token_ledger` DISABLE KEYS */;
/*!40000 ALTER TABLE `token_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `id_transaction` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `movement_type` varchar(20) NOT NULL,
  `amount` int NOT NULL,
  `date` date NOT NULL,
  `id_reward` int DEFAULT NULL,
  `result_balance` int NOT NULL,
  `motive` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_transaction`),
  KEY `fk_transaction_user` (`id_user`),
  KEY `fk_transaction_reward` (`id_reward`),
  KEY `idx_transaction_reward_date` (`id_reward`,`date`),
  CONSTRAINT `fk_transaction_reward` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (1,1,'GANANCIA',10,'2025-05-30',NULL,10,NULL),(2,2,'GANANCIA',200,'2025-05-31',NULL,200,NULL),(3,1,'GANANCIA',200,'2025-05-31',NULL,210,NULL),(4,1,'GANANCIA',200,'2025-05-31',NULL,410,NULL),(5,1,'GANANCIA',200,'2025-05-31',NULL,610,'codigo'),(6,2,'GASTO',100,'2025-05-31',1,100,NULL);
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_gym`
--

DROP TABLE IF EXISTS `user_gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_gym` (
  `id_user_gym` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `start_date` date NOT NULL,
  `finish_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `plan` varchar(250) DEFAULT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_user_gym`),
  UNIQUE KEY `unique_active_gym` (`id_user`,`id_gym`,`active`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_user_gym_user` (`id_user`),
  CONSTRAINT `fk_user_gym_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_gym`
--

LOCK TABLES `user_gym` WRITE;
/*!40000 ALTER TABLE `user_gym` DISABLE KEYS */;
INSERT INTO `user_gym` VALUES (1,1,'2025-05-31','2025-05-31',0,'completo',2),(2,2,'2025-05-31',NULL,1,'musculacion',2);
/*!40000 ALTER TABLE `user_gym` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id_user_profile` int NOT NULL AUTO_INCREMENT,
  `id_account` int NOT NULL COMMENT 'Relación 1:1 con account',
  `name` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `gender` enum('M','F','O') NOT NULL DEFAULT 'O',
  `age` tinyint DEFAULT NULL,
  `locality` varchar(100) DEFAULT NULL,
  `subscription` enum('FREE','PREMIUM') NOT NULL DEFAULT 'FREE' COMMENT 'Nivel de suscripción del usuario',
  `tokens` int NOT NULL DEFAULT '0' COMMENT 'Tokens acumulados',
  `id_streak` int DEFAULT NULL COMMENT 'Racha actual del usuario',
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  KEY `idx_user_profiles_subscription` (`subscription`),
  KEY `idx_user_profiles_tokens` (`tokens`),
  KEY `fk_user_profile_streak` (`id_streak`),
  CONSTRAINT `fk_user_profile_streak` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (2,3,'Gonzalo','Gomez','M',23,'Buenos Aires','PREMIUM',610,2,NULL,'2025-10-06 02:07:30','2025-10-06 02:07:30');
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
  `id_routine` int NOT NULL,
  `start_date` date NOT NULL,
  `finish_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_user_routine`),
  UNIQUE KEY `unique_active_routine` (`id_user`,`id_routine`,`active`),
  KEY `id_routine` (`id_routine`),
  KEY `idx_user_routine_user` (`id_user`),
  CONSTRAINT `fk_user_routine_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_routine_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_routine`
--

LOCK TABLES `user_routine` WRITE;
/*!40000 ALTER TABLE `user_routine` DISABLE KEYS */;
INSERT INTO `user_routine` VALUES (1,1,'2025-06-01',NULL,1,2);
/*!40000 ALTER TABLE `user_routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'gympoint'
--

--
-- Dumping routines for database 'gympoint'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-06 22:41:11
