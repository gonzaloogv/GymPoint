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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gympoint` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

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
INSERT INTO `SequelizeMeta` VALUES ('20260101-create-core-auth-tables.js'),('20260102-create-profile-tables.js'),('20260103-create-gym-ecosystem.js'),('20260104-create-fitness-tracking.js'),('20260105-create-exercise-routines.js'),('20260106-create-rewards-challenges.js'),('20260107-create-media-notifications.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_deletion_request`
--

DROP TABLE IF EXISTS `account_deletion_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_deletion_request` (
  `id_deletion_request` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico de la solicitud',
  `id_account` int NOT NULL COMMENT 'Cuenta que solicita eliminaci├│n',
  `reason` text COLLATE utf8mb4_unicode_ci COMMENT 'Raz├│n de la eliminaci├│n (opcional)',
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT 'Estado de la solicitud',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de solicitud',
  `processed_at` datetime DEFAULT NULL COMMENT 'Fecha de procesamiento',
  `processed_by` int DEFAULT NULL COMMENT 'Admin que proces├│ la solicitud',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notas del administrador',
  PRIMARY KEY (`id_deletion_request`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_deletion_request_account_status` (`id_account`,`status`),
  KEY `idx_deletion_request_status_date` (`status`,`requested_at`),
  CONSTRAINT `account_deletion_request_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_deletion_request_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `admin_profiles` (`id_admin_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_deletion_request`
--

LOCK TABLES `account_deletion_request` WRITE;
/*!40000 ALTER TABLE `account_deletion_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_deletion_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_roles`
--

DROP TABLE IF EXISTS `account_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_roles` (
  `id_account_role` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico de la asignaci├│n',
  `id_account` int NOT NULL COMMENT 'Cuenta asociada',
  `id_role` int NOT NULL COMMENT 'Rol asignado',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account_role`),
  UNIQUE KEY `unique_account_role` (`id_account`,`id_role`),
  KEY `id_role` (`id_role`),
  CONSTRAINT `account_roles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_roles_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_roles`
--

LOCK TABLES `account_roles` WRITE;
/*!40000 ALTER TABLE `account_roles` DISABLE KEYS */;
INSERT INTO `account_roles` VALUES (1,1,2,'2025-10-21 04:41:43');
/*!40000 ALTER TABLE `account_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id_account` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico de la cuenta',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email ├║nico para login',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hash de contrase├▒a (NULL si es login social)',
  `auth_provider` enum('local','google') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local' COMMENT 'Proveedor de autenticaci├│n',
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID de Google (si usa Google OAuth)',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el email est├í verificado',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si la cuenta est├í activa (no baneada)',
  `last_login` datetime DEFAULT NULL COMMENT '├Ültima fecha de login',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_accounts_email` (`email`),
  KEY `idx_accounts_google_id` (`google_id`),
  KEY `idx_accounts_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'admin@gympoint.com','$2b$10$gdnYpHQWjDATKM2uAqxF2urM8xNYlc1ps4khhVZqK0pvz550TWxui','local',NULL,1,1,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43');
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
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'C├│digo ├║nico del logro (ej: FIRST_WORKOUT, STREAK_7_DAYS)',
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('ONBOARDING','STREAK','FREQUENCY','ATTENDANCE','ROUTINE','CHALLENGE','PROGRESS','TOKEN','SOCIAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ONBOARDING',
  `metric_type` enum('STREAK_DAYS','STREAK_RECOVERY_USED','ASSISTANCE_TOTAL','FREQUENCY_WEEKS_MET','ROUTINE_COMPLETED_COUNT','WORKOUT_SESSION_COMPLETED','DAILY_CHALLENGE_COMPLETED_COUNT','PR_RECORD_COUNT','BODY_WEIGHT_PROGRESS','TOKEN_BALANCE_REACHED','TOKEN_SPENT_TOTAL','ONBOARDING_STEP_COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_value` int NOT NULL COMMENT 'Valor objetivo para desbloquear',
  `metadata` json DEFAULT NULL COMMENT 'Informaci├│n adicional',
  `icon_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_achievement_definition`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `idx_achievement_def_code` (`code`),
  KEY `idx_achievement_def_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_definition`
--

LOCK TABLES `achievement_definition` WRITE;
/*!40000 ALTER TABLE `achievement_definition` DISABLE KEYS */;
INSERT INTO `achievement_definition` VALUES (1,'FIRST_LOGIN','Bienvenido a GymPoint','Iniciaste sesi├│n por primera vez','ONBOARDING','ONBOARDING_STEP_COMPLETED',1,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(2,'STREAK_3_DAYS','Racha de 3 d├¡as','Mantuviste una racha de 3 d├¡as consecutivos','STREAK','STREAK_DAYS',3,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(3,'STREAK_7_DAYS','Racha de 7 d├¡as','Mantuviste una racha de una semana','STREAK','STREAK_DAYS',7,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(4,'STREAK_30_DAYS','Racha de 30 d├¡as','Un mes completo de consistencia','STREAK','STREAK_DAYS',30,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(5,'FIRST_WORKOUT','Primera Asistencia','Registraste tu primera asistencia al gym','ATTENDANCE','ASSISTANCE_TOTAL',1,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(6,'WORKOUT_10','10 Entrenamientos','Completaste 10 sesiones de entrenamiento','ATTENDANCE','ASSISTANCE_TOTAL',10,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(7,'WORKOUT_50','50 Entrenamientos','Completaste 50 sesiones de entrenamiento','ATTENDANCE','ASSISTANCE_TOTAL',50,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(8,'WORKOUT_100','Centenario','100 entrenamientos completados','ATTENDANCE','ASSISTANCE_TOTAL',100,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(9,'FREQUENCY_1_WEEK','Meta Semanal','Cumpliste tu meta de frecuencia semanal','FREQUENCY','FREQUENCY_WEEKS_MET',1,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(10,'FREQUENCY_4_WEEKS','Mes Completo','Cumpliste tu meta 4 semanas seguidas','FREQUENCY','FREQUENCY_WEEKS_MET',4,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(11,'CHALLENGE_1','Primer Desaf├¡o','Completaste tu primer desaf├¡o diario','CHALLENGE','DAILY_CHALLENGE_COMPLETED_COUNT',1,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(12,'CHALLENGE_7','Semana de Desaf├¡os','Completaste 7 desaf├¡os diarios','CHALLENGE','DAILY_CHALLENGE_COMPLETED_COUNT',7,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(13,'TOKENS_100','Ahorrador','Acumulaste 100 tokens','TOKEN','TOKEN_BALANCE_REACHED',100,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43'),(14,'TOKENS_500','Coleccionista','Acumulaste 500 tokens','TOKEN','TOKEN_BALANCE_REACHED',500,NULL,NULL,1,'2025-10-21 04:41:43','2025-10-21 04:41:43');
/*!40000 ALTER TABLE `achievement_definition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_profiles`
--

DROP TABLE IF EXISTS `admin_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_profiles` (
  `id_admin_profile` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico del perfil de administrador',
  `id_account` int NOT NULL COMMENT 'Relaci├│n 1:1 con account',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del administrador',
  `lastname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del administrador',
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Departamento (IT, Support, Management, etc.)',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notas internas sobre el administrador',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  UNIQUE KEY `idx_admin_profiles_account` (`id_account`),
  CONSTRAINT `admin_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_profiles`
--

LOCK TABLES `admin_profiles` WRITE;
/*!40000 ALTER TABLE `admin_profiles` DISABLE KEYS */;
INSERT INTO `admin_profiles` VALUES (1,1,'Admin','Sistema','IT',NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43');
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
  `id_streak` int NOT NULL,
  `date` date NOT NULL COMMENT 'Fecha de la asistencia',
  `check_in_time` time NOT NULL COMMENT 'Hora de entrada',
  `check_out_time` time DEFAULT NULL COMMENT 'Hora de salida',
  `duration_minutes` int DEFAULT NULL COMMENT 'Duraci├│n en minutos',
  `auto_checkin` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si fue auto check-in por geofence',
  `distance_meters` decimal(6,2) DEFAULT NULL COMMENT 'Distancia en metros al momento del check-in',
  `verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si la asistencia fue verificada',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_assistance`),
  KEY `id_streak` (`id_streak`),
  KEY `idx_assistance_user_date` (`id_user_profile`,`date`),
  KEY `idx_assistance_gym_date` (`id_gym`,`date`),
  KEY `idx_assistance_auto_date` (`auto_checkin`,`date`),
  KEY `idx_assistance_duration` (`duration_minutes`),
  CONSTRAINT `assistance_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assistance_ibfk_3` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_user_profile` int NOT NULL,
  `id_reward` int NOT NULL,
  `id_code` int DEFAULT NULL,
  `claimed_date` date NOT NULL,
  `status` enum('PENDING','ACTIVE','USED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `tokens_spent` int NOT NULL COMMENT 'Tokens gastados en esta recompensa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_claimed_reward`),
  KEY `id_reward` (`id_reward`),
  KEY `id_code` (`id_code`),
  KEY `idx_claimed_reward_user_date` (`id_user_profile`,`claimed_date`),
  KEY `idx_claimed_reward_status` (`status`),
  CONSTRAINT `claimed_reward_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `claimed_reward_ibfk_2` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `claimed_reward_ibfk_3` FOREIGN KEY (`id_code`) REFERENCES `reward_code` (`id_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `challenge_date` date NOT NULL COMMENT 'Fecha del desaf├¡o',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `challenge_type` enum('MINUTES','EXERCISES','FREQUENCY','SETS','REPS') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de desaf├¡o',
  `target_value` int NOT NULL COMMENT 'Valor objetivo del desaf├¡o',
  `target_unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unidad (minutos, ejercicios, etc.)',
  `tokens_reward` int NOT NULL DEFAULT '10' COMMENT 'Tokens otorgados al completar',
  `difficulty` enum('EASY','MEDIUM','HARD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `id_template` int DEFAULT NULL COMMENT 'Plantilla de donde se gener├│ (NULL si es manual)',
  `auto_generated` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si fue generado autom├íticamente por rotaci├│n',
  `created_by` int DEFAULT NULL COMMENT 'ID del admin que lo cre├│ (NULL si es auto-generado)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_challenge`),
  UNIQUE KEY `challenge_date` (`challenge_date`),
  KEY `id_template` (`id_template`),
  KEY `idx_daily_challenge_date_active` (`challenge_date`,`is_active`),
  CONSTRAINT `daily_challenge_ibfk_1` FOREIGN KEY (`id_template`) REFERENCES `daily_challenge_template` (`id_template`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `auto_rotation_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si la rotaci├│n autom├ítica est├í habilitada',
  `rotation_cron` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1 0 * * *' COMMENT 'Cron expression para rotaci├│n (default: 00:01 diario)',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge_settings`
--

LOCK TABLES `daily_challenge_settings` WRITE;
/*!40000 ALTER TABLE `daily_challenge_settings` DISABLE KEYS */;
INSERT INTO `daily_challenge_settings` VALUES (1,1,'1 0 * * *','2025-10-21 04:41:24');
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
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'T├¡tulo de la plantilla',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripci├│n del desaf├¡o',
  `challenge_type` enum('MINUTES','EXERCISES','FREQUENCY') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de desaf├¡o',
  `target_value` int NOT NULL COMMENT 'Valor objetivo (ej: 30 minutos, 5 ejercicios)',
  `target_unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unidad del objetivo (minutos, ejercicios, d├¡as)',
  `tokens_reward` int NOT NULL DEFAULT '10' COMMENT 'Tokens que se otorgan al completar',
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM' COMMENT 'Dificultad: EASY, MEDIUM, HARD',
  `rotation_weight` int NOT NULL DEFAULT '1' COMMENT 'Peso para selecci├│n aleatoria (mayor = m├ís probable)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si est├í activo para rotaci├│n',
  `created_by` int DEFAULT NULL COMMENT 'ID del admin que cre├│ la plantilla',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_template`),
  KEY `idx_template_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `exercise_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `muscular_group` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Grupo muscular principal',
  `secondary_muscles` json DEFAULT NULL COMMENT 'M├║sculos secundarios trabajados',
  `equipment_needed` json DEFAULT NULL COMMENT 'Equipamiento necesario',
  `difficulty_level` enum('BEGINNER','INTERMEDIATE','ADVANCED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL COMMENT 'Usuario que cre├│ el ejercicio (NULL = sistema)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_exercise`),
  KEY `created_by` (`created_by`),
  KEY `idx_exercise_muscle_group` (`muscular_group`),
  KEY `idx_exercise_difficulty` (`difficulty_level`),
  KEY `idx_exercise_deleted` (`deleted_at`),
  CONSTRAINT `exercise_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (1,'Press de Banca','PECHO',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(2,'Press Inclinado con Mancuernas','PECHO',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(3,'Fondos en Paralelas','PECHO',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(4,'Aperturas con Mancuernas','PECHO',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(5,'Dominadas','ESPALDA',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(6,'Remo con Barra','ESPALDA',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(7,'Peso Muerto','ESPALDA',NULL,NULL,'ADVANCED',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(8,'Jal├│n al Pecho','ESPALDA',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(9,'Remo con Mancuerna','ESPALDA',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(10,'Sentadilla con Barra','PIERNAS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(11,'Prensa de Piernas','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(12,'Zancadas','PIERNAS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(13,'Extensi├│n de Cu├ídriceps','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(14,'Curl Femoral','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(15,'Elevaci├│n de Pantorrillas','PIERNAS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(16,'Press Militar','HOMBROS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(17,'Elevaciones Laterales','HOMBROS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(18,'Elevaciones Frontales','HOMBROS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(19,'P├íjaros','HOMBROS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(20,'Curl de B├¡ceps con Barra','BRAZOS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(21,'Curl Martillo','BRAZOS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(22,'Extensiones de Tr├¡ceps','BRAZOS',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(23,'Fondos para Tr├¡ceps','BRAZOS',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(24,'Plancha','CORE',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(25,'Crunches','CORE',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(26,'Elevaci├│n de Piernas','CORE',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL),(27,'Mountain Climbers','CORE',NULL,NULL,'INTERMEDIATE',NULL,NULL,NULL,'2025-10-21 04:41:43','2025-10-21 04:41:43',NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequency`
--

LOCK TABLES `frequency` WRITE;
/*!40000 ALTER TABLE `frequency` DISABLE KEYS */;
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
  `goal_met` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si se cumpli├│ la meta',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_history`),
  UNIQUE KEY `idx_frequency_history_user_week` (`id_user_profile`,`week_start_date`),
  CONSTRAINT `frequency_history_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_type` int DEFAULT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_media` json DEFAULT NULL COMMENT 'Redes sociales: {facebook, instagram, twitter, etc.}',
  `equipment` json DEFAULT NULL COMMENT 'Lista de equipamiento disponible',
  `services` json DEFAULT NULL COMMENT 'Servicios adicionales (clases, entrenadores, etc.)',
  `month_price` double DEFAULT NULL,
  `week_price` double DEFAULT NULL,
  `max_capacity` int DEFAULT NULL COMMENT 'Capacidad m├íxima de personas',
  `area_sqm` decimal(10,2) DEFAULT NULL COMMENT '├ürea en metros cuadrados',
  `verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el gimnasio est├í verificado por el sistema',
  `featured` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es destacado en la app',
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL de foto principal',
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL del logo',
  `rules` text COLLATE utf8mb4_unicode_ci COMMENT 'Reglas y pol├¡ticas del gimnasio',
  `geofence_radius_meters` int NOT NULL DEFAULT '150' COMMENT 'Radio de geofence para auto check-in en metros',
  `auto_checkin_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si el auto check-in est├í habilitado',
  `min_stay_minutes` int NOT NULL DEFAULT '10' COMMENT 'Tiempo m├¡nimo de estad├¡a para confirmar check-in',
  `registration_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete',
  PRIMARY KEY (`id_gym`),
  KEY `id_type` (`id_type`),
  KEY `idx_gym_city` (`city`),
  KEY `idx_gym_verified_featured` (`verified`,`featured`),
  KEY `idx_gym_location` (`latitude`,`longitude`),
  KEY `idx_gym_deleted` (`deleted_at`),
  CONSTRAINT `gym_ibfk_1` FOREIGN KEY (`id_type`) REFERENCES `gym_type` (`id_type`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym`
--

LOCK TABLES `gym` WRITE;
/*!40000 ALTER TABLE `gym` DISABLE KEYS */;
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la amenidad (Ducha, Locker, WiFi, etc.)',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Categor├¡a (FACILITY, SERVICE, EQUIPMENT)',
  `icon_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre del ├¡cono para la UI',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_amenity`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_amenity`
--

LOCK TABLES `gym_amenity` WRITE;
/*!40000 ALTER TABLE `gym_amenity` DISABLE KEYS */;
INSERT INTO `gym_amenity` VALUES (1,'Duchas','FACILITY','shower','2025-10-21 04:41:43'),(2,'Lockers','FACILITY','locker','2025-10-21 04:41:43'),(3,'WiFi','FACILITY','wifi','2025-10-21 04:41:43'),(4,'Estacionamiento','FACILITY','parking','2025-10-21 04:41:43'),(5,'Aire Acondicionado','FACILITY','ac','2025-10-21 04:41:43'),(6,'Vestuarios','FACILITY','changing-room','2025-10-21 04:41:43'),(7,'Agua Potable','FACILITY','water','2025-10-21 04:41:43'),(8,'Entrenador Personal','SERVICE','trainer','2025-10-21 04:41:43'),(9,'Clases Grupales','SERVICE','group-class','2025-10-21 04:41:43'),(10,'Nutricionista','SERVICE','nutrition','2025-10-21 04:41:43'),(11,'Sauna','FACILITY','sauna','2025-10-21 04:41:43'),(12,'Piscina','FACILITY','pool','2025-10-21 04:41:43'),(13,'M├íquinas Cardio','EQUIPMENT','cardio','2025-10-21 04:41:43'),(14,'Pesas Libres','EQUIPMENT','weights','2025-10-21 04:41:43'),(15,'M├íquinas de Fuerza','EQUIPMENT','machines','2025-10-21 04:41:43'),(16,'├ürea Funcional','EQUIPMENT','functional','2025-10-21 04:41:43'),(17,'Barras y Discos','EQUIPMENT','barbell','2025-10-21 04:41:43'),(18,'Mancuernas','EQUIPMENT','dumbbell','2025-10-21 04:41:43');
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
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Notas adicionales sobre esta amenidad en este gym',
  PRIMARY KEY (`id_gym`,`id_amenity`),
  KEY `idx_gym_amenity_amenity` (`id_amenity`),
  CONSTRAINT `gym_gym_amenity_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_gym_amenity_ibfk_2` FOREIGN KEY (`id_amenity`) REFERENCES `gym_amenity` (`id_amenity`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_gym_amenity`
--

LOCK TABLES `gym_gym_amenity` WRITE;
/*!40000 ALTER TABLE `gym_gym_amenity` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_gym_amenity` ENABLE KEYS */;
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
  KEY `idx_gym_type` (`id_type`),
  CONSTRAINT `gym_gym_type_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_gym_type_ibfk_2` FOREIGN KEY (`id_type`) REFERENCES `gym_type` (`id_type`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_gym_type`
--

LOCK TABLES `gym_gym_type` WRITE;
/*!40000 ALTER TABLE `gym_gym_type` DISABLE KEYS */;
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
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `period_start` date DEFAULT NULL COMMENT 'Inicio del per├¡odo pagado',
  `period_end` date DEFAULT NULL COMMENT 'Fin del per├¡odo pagado',
  `status` enum('PENDING','COMPLETED','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id_payment`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_gym_payment_user_gym` (`id_user_profile`,`id_gym`),
  KEY `idx_gym_payment_date_status` (`payment_date`,`status`),
  CONSTRAINT `gym_payment_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_rating_stats`
--

LOCK TABLES `gym_rating_stats` WRITE;
/*!40000 ALTER TABLE `gym_rating_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_rating_stats` ENABLE KEYS */;
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
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `cleanliness_rating` tinyint DEFAULT NULL COMMENT 'Rating de limpieza (1-5)',
  `equipment_rating` tinyint DEFAULT NULL COMMENT 'Rating de equipamiento (1-5)',
  `staff_rating` tinyint DEFAULT NULL COMMENT 'Rating de personal (1-5)',
  `value_rating` tinyint DEFAULT NULL COMMENT 'Rating de relaci├│n calidad-precio (1-5)',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si la review est├í verificada (usuario asisti├│ al gym)',
  `helpful_count` int NOT NULL DEFAULT '0' COMMENT 'Cantidad de usuarios que marcaron como ├║til',
  `reported` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `uniq_user_gym_review` (`id_user_profile`,`id_gym`),
  KEY `idx_gym_rating` (`id_gym`,`rating`),
  KEY `idx_review_created_at` (`created_at`),
  CONSTRAINT `gym_review_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_review_ibfk_2` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_review`
--

LOCK TABLES `gym_review` WRITE;
/*!40000 ALTER TABLE `gym_review` DISABLE KEYS */;
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
  `day_of_week` tinyint NOT NULL COMMENT '0=Domingo, 1=Lunes, ..., 6=S├íbado',
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si est├í cerrado ese d├¡a',
  PRIMARY KEY (`id_schedule`),
  KEY `idx_gym_schedule_gym_day` (`id_gym`,`day_of_week`),
  CONSTRAINT `gym_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `date` date NOT NULL COMMENT 'Fecha espec├¡fica (feriados, eventos especiales)',
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Raz├│n del horario especial',
  PRIMARY KEY (`id_special_schedule`),
  UNIQUE KEY `idx_gym_special_schedule_gym_date` (`id_gym`,`date`),
  CONSTRAINT `gym_special_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_type`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_type`
--

LOCK TABLES `gym_type` WRITE;
/*!40000 ALTER TABLE `gym_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id_media` int NOT NULL AUTO_INCREMENT,
  `entity_type` enum('USER_PROFILE','GYM','EXERCISE','PROGRESS','REVIEW') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de entidad a la que pertenece',
  `entity_id` int NOT NULL COMMENT 'ID de la entidad',
  `media_type` enum('IMAGE','VIDEO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IMAGE',
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL COMMENT 'Tama├▒o en bytes',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es la imagen principal',
  `display_order` int NOT NULL DEFAULT '0',
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_media`),
  KEY `idx_media_entity` (`entity_type`,`entity_id`),
  KEY `idx_media_primary` (`entity_type`,`entity_id`,`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_gym` int DEFAULT NULL COMMENT 'Gimnasio si el pago es por suscripci├│n',
  `payment_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID del pago en MercadoPago',
  `preference_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID de la preferencia de pago',
  `status` enum('PENDING','APPROVED','AUTHORIZED','IN_PROCESS','IN_MEDIATION','REJECTED','CANCELLED','REFUNDED','CHARGED_BACK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `status_detail` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ARS' COMMENT 'C├│digo de moneda (ISO 4217)',
  `description` text COLLATE utf8mb4_unicode_ci,
  `subscription_type` enum('MONTHLY','WEEKLY','DAILY','ANNUAL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payer_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Referencia externa del negocio',
  `metadata` json DEFAULT NULL COMMENT 'Informaci├│n adicional del pago',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `type` enum('REMINDER','ACHIEVEMENT','REWARD','GYM_UPDATE','PAYMENT','SOCIAL','SYSTEM','CHALLENGE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL COMMENT 'Datos adicionales (deep links, etc.)',
  `priority` enum('LOW','NORMAL','HIGH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `scheduled_for` datetime DEFAULT NULL COMMENT 'Fecha programada de env├¡o',
  `sent_at` datetime DEFAULT NULL COMMENT 'Fecha real de env├¡o',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notification`),
  KEY `idx_notification_user_read` (`id_user_profile`,`is_read`,`created_at`),
  KEY `idx_notification_scheduled` (`scheduled_for`,`sent_at`),
  KEY `idx_notification_type` (`type`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_gym` int NOT NULL COMMENT 'Gimnasio donde se detect├│ presencia',
  `first_seen_at` datetime NOT NULL COMMENT 'Primera detecci├│n en geofence',
  `last_seen_at` datetime NOT NULL COMMENT '├Ültima actualizaci├│n de ubicaci├│n',
  `exited_at` datetime DEFAULT NULL COMMENT 'Cu├índo sali├│ del geofence',
  `status` enum('DETECTING','CONFIRMED','EXITED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DETECTING' COMMENT 'DETECTING: detectando presencia, CONFIRMED: check-in confirmado, EXITED: sali├│ del gym',
  `converted_to_assistance` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si se convirti├│ en registro de asistencia',
  `id_assistance` int DEFAULT NULL COMMENT 'ID de la asistencia creada (si se confirm├│)',
  `distance_meters` decimal(6,2) DEFAULT NULL COMMENT 'Distancia al centro del gimnasio en metros',
  `accuracy_meters` decimal(6,2) DEFAULT NULL COMMENT 'Precisi├│n del GPS en metros',
  `location_updates_count` int NOT NULL DEFAULT '1' COMMENT 'Cantidad de actualizaciones de ubicaci├│n recibidas',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_progress`),
  UNIQUE KEY `idx_progress_user_date` (`id_user_profile`,`date`),
  CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_progress_exercise` int NOT NULL AUTO_INCREMENT,
  `id_progress` int NOT NULL,
  `id_exercise` int NOT NULL,
  `max_weight` decimal(6,2) DEFAULT NULL COMMENT 'Peso m├íximo levantado (PR)',
  `max_reps` int DEFAULT NULL COMMENT 'Repeticiones m├íximas',
  `total_volume` decimal(10,2) DEFAULT NULL COMMENT 'Volumen total (peso ├ù reps ├ù series)',
  PRIMARY KEY (`id_progress_exercise`),
  KEY `idx_progress_exercise_progress` (`id_progress`),
  KEY `idx_progress_exercise_max` (`id_exercise`,`max_weight`),
  CONSTRAINT `progress_exercise_ibfk_1` FOREIGN KEY (`id_progress`) REFERENCES `progress` (`id_progress`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `progress_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_refresh_token` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico del refresh token',
  `id_account` int NOT NULL COMMENT 'Cuenta asociada',
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Refresh token JWT',
  `expires_at` datetime NOT NULL COMMENT 'Fecha de expiraci├│n',
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si el token ha sido revocado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_refresh_token`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_refresh_token_account` (`id_account`),
  KEY `idx_refresh_token_token` (`token`),
  KEY `idx_refresh_token_expiration` (`expires_at`,`is_revoked`),
  CONSTRAINT `refresh_token_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `token_cost` int NOT NULL COMMENT 'Costo en tokens',
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje de descuento si aplica',
  `discount_amount` decimal(10,2) DEFAULT NULL COMMENT 'Monto fijo de descuento',
  `stock` int DEFAULT NULL COMMENT 'Stock disponible (NULL = ilimitado)',
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_reward`),
  KEY `idx_reward_gym_active` (`id_gym`,`is_active`),
  KEY `idx_reward_cost` (`token_cost`),
  KEY `idx_reward_deleted` (`deleted_at`),
  CONSTRAINT `reward_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'C├│digo ├║nico de la recompensa',
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_code`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `idx_reward_code_code` (`code`),
  KEY `idx_reward_code_reward_used` (`id_reward`,`is_used`),
  CONSTRAINT `reward_code_ibfk_1` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_role` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico del rol',
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del rol (USER, ADMIN, MODERATOR, etc.)',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Descripci├│n del rol',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'USER','Usuario normal de la aplicaci├│n m├│vil','2025-10-21 04:41:18'),(2,'ADMIN','Administrador del sistema con acceso total','2025-10-21 04:41:18'),(3,'GYM_OWNER','Propietario de gimnasio con permisos de gesti├│n','2025-10-21 04:41:18');
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL COMMENT 'Usuario que cre├│ la rutina (NULL = sistema/plantilla)',
  `is_template` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es una plantilla pre-dise├▒ada',
  `recommended_for` enum('BEGINNER','INTERMEDIATE','ADVANCED') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nivel recomendado',
  `classification` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Clasificaci├│n (STRENGTH, CARDIO, HYBRID, etc.)',
  `template_order` int NOT NULL DEFAULT '0' COMMENT 'Orden de visualizaci├│n en plantillas',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_routine`),
  KEY `idx_routine_template` (`is_template`,`template_order`),
  KEY `idx_routine_created_by` (`created_by`),
  KEY `idx_routine_deleted` (`deleted_at`),
  CONSTRAINT `routine_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine`
--

LOCK TABLES `routine` WRITE;
/*!40000 ALTER TABLE `routine` DISABLE KEYS */;
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
  `day_number` int NOT NULL COMMENT 'N├║mero del d├¡a en la rutina (1, 2, 3...)',
  `day_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre del d├¡a (ej: "Pecho y Tr├¡ceps")',
  `description` text COLLATE utf8mb4_unicode_ci,
  `rest_day` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_routine_day`),
  UNIQUE KEY `uniq_routine_day_number` (`id_routine`,`day_number`),
  KEY `idx_routine_day_routine` (`id_routine`),
  CONSTRAINT `routine_day_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `id_routine_day` int NOT NULL,
  `id_exercise` int NOT NULL,
  `exercise_order` int NOT NULL DEFAULT '0' COMMENT 'Orden del ejercicio en el d├¡a',
  `sets` int DEFAULT NULL,
  `reps` int DEFAULT NULL,
  `rest_seconds` int DEFAULT NULL COMMENT 'Descanso entre series en segundos',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_routine_exercise`),
  KEY `idx_routine_exercise_day_order` (`id_routine_day`,`exercise_order`),
  KEY `idx_routine_exercise_exercise` (`id_exercise`),
  CONSTRAINT `routine_exercise_ibfk_1` FOREIGN KEY (`id_routine_day`) REFERENCES `routine_day` (`id_routine_day`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `routine_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine_exercise`
--

LOCK TABLES `routine_exercise` WRITE;
/*!40000 ALTER TABLE `routine_exercise` DISABLE KEYS */;
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
  `value` int NOT NULL DEFAULT '0' COMMENT 'Racha actual (d├¡as consecutivos)',
  `last_value` int NOT NULL DEFAULT '0' COMMENT '├Ültima racha (antes de perderla)',
  `max_value` int NOT NULL DEFAULT '0' COMMENT 'Racha m├íxima hist├│rica',
  `recovery_items` int NOT NULL DEFAULT '0' COMMENT '├ìtems de recuperaci├│n de racha disponibles',
  `last_assistance_date` date DEFAULT NULL COMMENT 'Fecha de la ├║ltima asistencia',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_streak`),
  KEY `idx_streak_user` (`id_user_profile`),
  KEY `idx_streak_frequency` (`id_frequency`),
  KEY `idx_streak_value` (`value`),
  CONSTRAINT `streak_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `streak_ibfk_2` FOREIGN KEY (`id_frequency`) REFERENCES `frequency` (`id_frequency`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streak`
--

LOCK TABLES `streak` WRITE;
/*!40000 ALTER TABLE `streak` DISABLE KEYS */;
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
  `balance_after` int NOT NULL COMMENT 'Balance despu├®s de aplicar el delta',
  `reason` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, DAILY_CHALLENGE, etc.',
  `ref_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de referencia (assistance, claimed_reward, user_daily_challenge, etc.)',
  `ref_id` bigint DEFAULT NULL COMMENT 'ID de la entidad referenciada',
  `metadata` json DEFAULT NULL COMMENT 'Informaci├│n adicional',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ledger`),
  KEY `idx_token_ledger_user_date` (`id_user_profile`,`created_at`),
  KEY `idx_token_ledger_reason` (`reason`),
  KEY `idx_token_ledger_ref` (`ref_type`,`ref_id`),
  CONSTRAINT `token_ledger_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_ledger`
--

LOCK TABLES `token_ledger` WRITE;
/*!40000 ALTER TABLE `token_ledger` DISABLE KEYS */;
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
  `last_source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievement`
--

LOCK TABLES `user_achievement` WRITE;
/*!40000 ALTER TABLE `user_achievement` DISABLE KEYS */;
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
  `event_type` enum('PROGRESS','UNLOCKED','RESET') COLLATE utf8mb4_unicode_ci NOT NULL,
  `delta` int DEFAULT NULL COMMENT 'Cambio en el progreso',
  `snapshot_value` int NOT NULL COMMENT 'Valor del progreso despu├®s del evento',
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_id` bigint DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_achievement_event`),
  KEY `idx_user_achievement_event_timeline` (`id_user_achievement`,`created_at`),
  CONSTRAINT `user_achievement_event_ibfk_1` FOREIGN KEY (`id_user_achievement`) REFERENCES `user_achievement` (`id_user_achievement`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievement_event`
--

LOCK TABLES `user_achievement_event` WRITE;
/*!40000 ALTER TABLE `user_achievement_event` DISABLE KEYS */;
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
  `bmi` decimal(4,2) DEFAULT NULL COMMENT '├ìndice de masa corporal',
  `waist_cm` decimal(5,2) DEFAULT NULL,
  `chest_cm` decimal(5,2) DEFAULT NULL,
  `arms_cm` decimal(5,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_metric`),
  KEY `idx_body_metrics_user_date` (`id_user_profile`,`date`),
  CONSTRAINT `user_body_metrics_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_body_metrics`
--

LOCK TABLES `user_body_metrics` WRITE;
/*!40000 ALTER TABLE `user_body_metrics` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Token del dispositivo (FCM, APNS)',
  `platform` enum('IOS','ANDROID','WEB') COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID ├║nico del dispositivo',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_device_token`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `idx_device_token_token` (`token`),
  KEY `idx_device_token_user_active` (`id_user_profile`,`is_active`),
  CONSTRAINT `user_device_token_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `subscription_plan` enum('MONTHLY','WEEKLY','DAILY','ANNUAL') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tipo de plan contratado',
  `subscription_start` date DEFAULT NULL COMMENT 'Inicio de la suscripci├│n',
  `subscription_end` date DEFAULT NULL COMMENT 'Fin de la suscripci├│n',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si la suscripci├│n est├í activa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user_gym`),
  UNIQUE KEY `idx_user_gym_user_gym` (`id_user_profile`,`id_gym`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_user_gym_active_end` (`is_active`,`subscription_end`),
  CONSTRAINT `user_gym_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_gym`
--

LOCK TABLES `user_gym` WRITE;
/*!40000 ALTER TABLE `user_gym` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notification_settings`
--

LOCK TABLES `user_notification_settings` WRITE;
/*!40000 ALTER TABLE `user_notification_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id_user_profile` int NOT NULL AUTO_INCREMENT COMMENT 'ID ├║nico del perfil de usuario',
  `id_account` int NOT NULL COMMENT 'Relaci├│n 1:1 con account',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del usuario',
  `lastname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Apellido del usuario',
  `gender` enum('M','F','O') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'O' COMMENT 'G├®nero: M (Masculino), F (Femenino), O (Otro)',
  `birth_date` date DEFAULT NULL COMMENT 'Fecha de nacimiento (YYYY-MM-DD)',
  `locality` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Localidad/Ciudad del usuario',
  `subscription` enum('FREE','PREMIUM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FREE' COMMENT 'Nivel de suscripci├│n del usuario',
  `tokens` int NOT NULL DEFAULT '0' COMMENT 'Tokens acumulados (balance actual)',
  `id_streak` int DEFAULT NULL COMMENT 'Racha actual del usuario (FK a streak, se agrega en migraci├│n 4)',
  `profile_picture_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL de la foto de perfil',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete: fecha de eliminaci├│n l├│gica',
  PRIMARY KEY (`id_user_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  UNIQUE KEY `idx_user_profiles_account` (`id_account`),
  KEY `idx_user_profiles_subscription` (`subscription`),
  KEY `idx_user_profiles_tokens` (`tokens`),
  KEY `idx_user_profiles_deleted` (`deleted_at`),
  KEY `fk_user_profile_streak` (`id_streak`),
  CONSTRAINT `fk_user_profile_streak` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_routine`
--

LOCK TABLES `user_routine` WRITE;
/*!40000 ALTER TABLE `user_routine` DISABLE KEYS */;
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
  `status` enum('IN_PROGRESS','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_PROGRESS',
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `total_sets` int NOT NULL DEFAULT '0',
  `total_reps` int NOT NULL DEFAULT '0',
  `total_weight` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_session`
--

LOCK TABLES `workout_session` WRITE;
/*!40000 ALTER TABLE `workout_session` DISABLE KEYS */;
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
  `set_number` int NOT NULL COMMENT 'N├║mero de serie del ejercicio',
  `reps` int DEFAULT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL COMMENT 'Para ejercicios de tiempo',
  `rest_seconds` int DEFAULT NULL,
  `is_pr` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si es un r├®cord personal',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_workout_set`),
  KEY `idx_workout_set_session` (`id_workout_session`),
  KEY `idx_workout_set_exercise_pr` (`id_exercise`,`is_pr`),
  CONSTRAINT `workout_set_ibfk_1` FOREIGN KEY (`id_workout_session`) REFERENCES `workout_session` (`id_workout_session`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workout_set_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_set`
--

LOCK TABLES `workout_set` WRITE;
/*!40000 ALTER TABLE `workout_set` DISABLE KEYS */;
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

-- Dump completed on 2025-10-21  5:13:08
