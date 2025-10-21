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
INSERT INTO `SequelizeMeta` VALUES ('20250209-add-daily-challenge-admin-support.js'),('20250209-add-exercise-metadata-columns.js'),('20250925-add-logo-url-to-gyms.js'),('20251004-create-accounts-and-profiles.js'),('20251005-migrate-existing-users.js'),('20251006-redirect-fks-to-user-profiles.js'),('20251007-complete-fk-migration.js'),('20251008-rewards-snapshot-and-indexes.js'),('20251009-reward-gym-stats-daily.js'),('20251010-add-created-by-to-exercise.js'),('20251011-fix-missing-fks.js'),('20251012-cleanup-and-add-fks.js'),('20251014-transaction-to-ledger.js'),('20251015-add-critical-indexes.js'),('20251020-complete-transaction-migration.js'),('20251021-sync-user-gym-plan-enum.js'),('20251022-add-validation-constraints.js'),('20251023-cleanup-legacy-data.js'),('20251024-gym-json-fields.js'),('20251025-add-timestamps.js'),('20251026-add-soft-deletes.js'),('20251027-performance-indexes.js'),('20251028-add-photo-to-gym.js'),('20251029-add-timestamps-to-gym.js'),('20251030-create-reviews-media-favorites.js'),('20251031-add-timestamps-to-exercise.js'),('20251031-create-workout-sessions.js'),('20251032-create-user-body-metrics.js'),('20251033-create-notifications.js'),('20251034-create-mercadopago-payment.js'),('20251035-create-gym-amenities.js'),('20251036-alter-core-tables-phase5.js'),('20251037-create-frequency-history.js'),('20251038-create-account-deletion-request.js'),('20251039-fix-column-sync.js'),('20251040-create-views-phase7.js'),('20251041-fix-fks-and-drop-legacy-user.js'),('20251042-add-critical-indexes.js'),('20251043-geofencing-and-auto-checkin.js'),('20251044-ensure-assistance-duration-minutes.js'),('20251045-create-daily-challenges.js'),('20251046-routine-templates-and-imports.js'),('20251047-add-timestamps-to-routine.js'),('20251048-allow-null-created-by-in-routine.js'),('20251049-expand-routine-description.js'),('20251050-add-routine-classification.js'),('20251051-add-birth-date-to-user-profiles.js'),('20251052-drop-age-from-user-profiles.js'),('20251053-final-mvp-polish.js'),('20251054-add-duration-index-only.js'),('20251055-migrate-geofence-to-gym.js'),('20251056-create-achievements.js'),('20251057-add-gym-rules.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_deletion_request`
--

DROP TABLE IF EXISTS `account_deletion_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_deletion_request` (
  `id_request` int NOT NULL AUTO_INCREMENT,
  `id_account` int NOT NULL,
  `reason` text,
  `scheduled_deletion_date` date NOT NULL,
  `status` enum('PENDING','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `requested_at` datetime NOT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id_request`),
  KEY `id_account` (`id_account`),
  KEY `idx_account_deletion_status_date` (`status`,`scheduled_deletion_date`),
  CONSTRAINT `account_deletion_request_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id_account_role` int NOT NULL AUTO_INCREMENT,
  `id_account` int NOT NULL,
  `id_role` int NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_account_role`),
  UNIQUE KEY `unique_account_role` (`id_account`,`id_role`),
  KEY `id_role` (`id_role`),
  CONSTRAINT `account_roles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_roles_ibfk_2` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_roles`
--

LOCK TABLES `account_roles` WRITE;
/*!40000 ALTER TABLE `account_roles` DISABLE KEYS */;
INSERT INTO `account_roles` VALUES (1,1,1,'2025-10-15 06:11:27'),(2,2,2,'2025-10-15 06:11:27'),(3,3,1,'2025-10-16 04:35:33'),(4,4,1,'2025-10-16 07:50:20'),(7,7,1,'2025-10-19 23:32:57'),(8,8,1,'2025-10-19 23:33:54'),(9,9,1,'2025-10-19 23:33:54'),(18,18,1,'2025-10-19 23:34:06'),(19,19,1,'2025-10-19 23:34:06'),(20,20,1,'2025-10-19 23:34:07'),(24,24,1,'2025-10-19 23:52:04'),(25,25,1,'2025-10-19 23:52:04'),(26,26,1,'2025-10-19 23:52:04'),(31,31,1,'2025-10-19 23:53:54'),(39,39,1,'2025-10-20 00:00:16'),(43,43,1,'2025-10-20 00:01:49'),(93,93,1,'2025-10-20 00:46:42');
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
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,'gonzalo@example.com','$2b$10$kjWfjftU9RkPVyM3pl7jhehDcJO00/2HrVP7cEe1wdVsiPRReo.kW','local',NULL,1,1,NULL,'2025-10-15 06:11:27','2025-10-19 20:51:05'),(2,'admin@gympoint.com','$2b$10$7IUQtRTXQF3xg1/evFC9JeEobV1Ew781vkaddTrYY7uBowcmUYHYi','local',NULL,1,1,'2025-10-21 03:03:41','2025-10-15 06:11:27','2025-10-21 03:03:41'),(3,'gonza@test.com','$2b$12$mipC3XrLmAi6YS0Q8CTLZuyjoBbv9v6zK8FBQx/TvTRRSBDCYjZzG','local',NULL,0,1,'2025-10-16 04:36:38','2025-10-16 04:35:33','2025-10-16 04:36:38'),(4,'test@test.com','$2b$12$uKKzTViDY7eE6vD7r.MoyO52y6KBqd8hCh8IexPAAiQ1DWXbrYyEG','local',NULL,0,1,'2025-10-20 01:00:32','2025-10-16 07:50:20','2025-10-20 01:00:32'),(7,'geo-user-1760916777463_17834@example.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:32:57','2025-10-19 23:32:57'),(8,'tpl-1760916834850_6616@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:33:54','2025-10-19 23:33:54'),(9,'geo-user-1760916834905_35433@example.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:33:54','2025-10-19 23:33:54'),(18,'utpl-1760916846474_51186@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:34:06','2025-10-19 23:34:06'),(19,'utpl-FREE-1760916846807_8885@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:34:06','2025-10-19 23:34:06'),(20,'utpl-FREE-1760916847160_82290@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:34:07','2025-10-19 23:34:07'),(24,'utpl-1760917924704_21385@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:52:04','2025-10-19 23:52:04'),(25,'utpl-FREE-1760917924860_3749@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:52:04','2025-10-19 23:52:04'),(26,'utpl-FREE-1760917924951_84607@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:52:04','2025-10-19 23:52:04'),(31,'uas-1760918034540_72746@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-19 23:53:54','2025-10-19 23:53:54'),(39,'ae-1760918416002_76828@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-20 00:00:16','2025-10-20 00:00:16'),(43,'tpl-1760918509597_50318@ex.com',NULL,'local',NULL,1,1,NULL,'2025-10-20 00:01:49','2025-10-20 00:01:49'),(93,'t@t.com','$2b$12$jdvqS8d8sd0FFWZvvtXyqe762nZT6FfnCa.xXbUqNrGnCcn9C50si','local',NULL,0,1,'2025-10-20 02:24:15','2025-10-20 00:46:42','2025-10-20 02:24:15');
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
  `code` varchar(50) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text,
  `category` enum('ONBOARDING','STREAK','FREQUENCY','ATTENDANCE','ROUTINE','CHALLENGE','PROGRESS','TOKEN','SOCIAL') NOT NULL DEFAULT 'ONBOARDING',
  `metric_type` enum('STREAK_DAYS','STREAK_RECOVERY_USED','ASSISTANCE_TOTAL','FREQUENCY_WEEKS_MET','ROUTINE_COMPLETED_COUNT','WORKOUT_SESSION_COMPLETED','DAILY_CHALLENGE_COMPLETED_COUNT','PR_RECORD_COUNT','BODY_WEIGHT_PROGRESS','TOKEN_BALANCE_REACHED','TOKEN_SPENT_TOTAL','ONBOARDING_STEP_COMPLETED') NOT NULL,
  `target_value` int NOT NULL,
  `metadata` json DEFAULT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_achievement_definition`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_definition`
--

LOCK TABLES `achievement_definition` WRITE;
/*!40000 ALTER TABLE `achievement_definition` DISABLE KEYS */;
/*!40000 ALTER TABLE `achievement_definition` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_profiles`
--

LOCK TABLES `admin_profiles` WRITE;
/*!40000 ALTER TABLE `admin_profiles` DISABLE KEYS */;
INSERT INTO `admin_profiles` VALUES (1,2,'Admin','Principal','System','Migrado desde user #2','2025-10-15 06:11:27','2025-10-15 06:11:27');
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
  `id_user` int NOT NULL,
  `date` date NOT NULL,
  `id_gym` int NOT NULL,
  `id_streak` int NOT NULL,
  `hour` time NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `distance_meters` decimal(6,2) DEFAULT NULL COMMENT 'Distancia al gimnasio (m)',
  `auto_checkin` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indica si fue auto check-in',
  `duration_minutes` int GENERATED ALWAYS AS ((case when ((`check_out_time` is not null) and (`check_in_time` is not null)) then timestampdiff(MINUTE,`check_in_time`,`check_out_time`) else NULL end)) STORED,
  PRIMARY KEY (`id_assistance`),
  UNIQUE KEY `unique_assistance_user_gym_date` (`id_user`,`id_gym`,`date`),
  KEY `id_user` (`id_user`),
  KEY `id_gym` (`id_gym`),
  KEY `id_streak` (`id_streak`),
  KEY `idx_assistance_user_date` (`id_user`,`date`),
  KEY `idx_assistance_gym_date` (`id_gym`,`date`),
  KEY `idx_assistance_auto_date` (`auto_checkin`,`date`),
  KEY `idx_assistance_duration` (`duration_minutes`),
  CONSTRAINT `assistance_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`),
  CONSTRAINT `assistance_ibfk_3` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`),
  CONSTRAINT `fk_assistance_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assistance`
--

LOCK TABLES `assistance` WRITE;
/*!40000 ALTER TABLE `assistance` DISABLE KEYS */;
INSERT INTO `assistance` (`id_assistance`, `id_user`, `date`, `id_gym`, `id_streak`, `hour`, `check_in_time`, `check_out_time`, `created_at`, `verified`, `distance_meters`, `auto_checkin`) VALUES (1,1,'2025-05-30',1,1,'17:20:57',NULL,NULL,'2025-10-15 06:11:40',0,NULL,0),(2,29,'2025-10-19',22,8,'20:53:54','20:53:54',NULL,'2025-10-19 23:53:54',1,0.00,1),(15,37,'2025-10-20',39,14,'21:00:16','21:00:16',NULL,'2025-10-20 00:00:16',1,0.00,1);
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
  `id_user` int NOT NULL,
  `id_reward` int NOT NULL,
  `id_code` int DEFAULT NULL,
  `claimed_date` date NOT NULL,
  `provider_snapshot` enum('system','gym') DEFAULT NULL,
  `gym_id_snapshot` bigint DEFAULT NULL,
  `status` enum('pending','redeemed','revoked') NOT NULL,
  PRIMARY KEY (`id_claimed_reward`),
  KEY `id_user` (`id_user`),
  KEY `id_reward` (`id_reward`),
  KEY `fk_claimed_reward_code` (`id_code`),
  KEY `idx_claimed_reward_gym_date` (`gym_id_snapshot`,`claimed_date`),
  KEY `idx_claimed_reward_stats` (`id_reward`,`status`,`claimed_date`),
  KEY `idx_claimed_status_date` (`id_user`,`status`,`claimed_date`),
  CONSTRAINT `claimed_reward_ibfk_2` FOREIGN KEY (`id_reward`) REFERENCES `reward` (`id_reward`),
  CONSTRAINT `fk_claimed_reward_code` FOREIGN KEY (`id_code`) REFERENCES `reward_code` (`id_code`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `claimed_reward`
--

LOCK TABLES `claimed_reward` WRITE;
/*!40000 ALTER TABLE `claimed_reward` DISABLE KEYS */;
INSERT INTO `claimed_reward` VALUES (1,2,1,1,'2025-05-31','system',NULL,'redeemed');
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
  `challenge_date` date NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `challenge_type` enum('MINUTES','EXERCISES','FREQUENCY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_value` int NOT NULL,
  `target_unit` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokens_reward` int DEFAULT '10',
  `difficulty` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `id_template` int DEFAULT NULL,
  `auto_generated` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_challenge`),
  UNIQUE KEY `challenge_date` (`challenge_date`),
  KEY `idx_active_date` (`challenge_date`,`is_active`),
  KEY `daily_challenge_id_template_foreign_idx` (`id_template`),
  KEY `daily_challenge_created_by_foreign_idx` (`created_by`),
  CONSTRAINT `daily_challenge_created_by_foreign_idx` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `daily_challenge_id_template_foreign_idx` FOREIGN KEY (`id_template`) REFERENCES `daily_challenge_template` (`id_template`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge`
--

LOCK TABLES `daily_challenge` WRITE;
/*!40000 ALTER TABLE `daily_challenge` DISABLE KEYS */;
INSERT INTO `daily_challenge` VALUES (10,'2025-10-19','Hacer 30 minutos',NULL,'MINUTES',30,'min',10,'MEDIUM',NULL,0,NULL,1,'2025-10-20 00:58:26','2025-10-20 00:58:54'),(11,'2025-10-20','Hacer 30 minutos',NULL,'MINUTES',30,'min',10,'BEGINNER',2,1,NULL,1,'2025-10-20 00:59:59','2025-10-20 00:59:59'),(12,'2025-10-21','Hacer 30 minutos',NULL,'MINUTES',30,'min',10,'BEGINNER',2,1,NULL,1,'2025-10-21 00:01:00','2025-10-21 00:01:00');
/*!40000 ALTER TABLE `daily_challenge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_challenge_settings`
--

DROP TABLE IF EXISTS `daily_challenge_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_challenge_settings` (
  `id_config` int NOT NULL DEFAULT '1',
  `auto_rotation_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `rotation_cron` varchar(50) NOT NULL DEFAULT '1 0 * * *',
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_config`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge_settings`
--

LOCK TABLES `daily_challenge_settings` WRITE;
/*!40000 ALTER TABLE `daily_challenge_settings` DISABLE KEYS */;
INSERT INTO `daily_challenge_settings` VALUES (1,1,'1 0 * * *','2025-10-20 00:59:57');
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
  `title` varchar(100) NOT NULL,
  `description` text,
  `challenge_type` enum('MINUTES','EXERCISES','FREQUENCY') NOT NULL,
  `target_value` int NOT NULL,
  `target_unit` varchar(20) DEFAULT NULL,
  `tokens_reward` int NOT NULL DEFAULT '10',
  `difficulty` varchar(20) NOT NULL DEFAULT 'MEDIUM',
  `rotation_weight` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_template`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `daily_challenge_template_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_challenge_template`
--

LOCK TABLES `daily_challenge_template` WRITE;
/*!40000 ALTER TABLE `daily_challenge_template` DISABLE KEYS */;
INSERT INTO `daily_challenge_template` VALUES (2,'Hacer 30 minutos',NULL,'MINUTES',30,'min',10,'BEGINNER',1,1,NULL,'2025-10-20 00:59:35','2025-10-20 00:59:35');
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
  `muscular_group` varchar(100) NOT NULL,
  `description` text,
  `equipment_needed` varchar(255) DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT NULL,
  `instructions` text,
  `video_url` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_exercise`),
  KEY `exercise_created_by_foreign_idx` (`created_by`),
  KEY `idx_exercise_deleted_at` (`deleted_at`),
  CONSTRAINT `exercise_created_by_foreign_idx` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise`
--

LOCK TABLES `exercise` WRITE;
/*!40000 ALTER TABLE `exercise` DISABLE KEYS */;
INSERT INTO `exercise` VALUES (1,'Press de banca','Pecho','Ejercicio multiarticular','Barra, Mancuernas','Avanzado','Movimiento de empuje paralelo','',NULL,NULL,'2025-10-15 06:11:44','2025-10-19 17:29:55'),(2,'Press de banca inclinado','Pecho',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-15 06:11:44','2025-10-15 06:11:44'),(3,'Mariposa','Pecho',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-15 06:11:44','2025-10-15 06:11:44'),(7,'Prensa 45','Piernas','','Prensa','Principiante','','',NULL,NULL,'2025-10-19 17:30:28','2025-10-19 17:30:28'),(8,'Sentadilla','Piernas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19 23:34:03','2025-10-19 23:34:03'),(9,'Press Banca','Pecho',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19 23:34:04','2025-10-19 23:34:04'),(10,'Remo','Espalda',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19 23:34:04','2025-10-19 23:34:04'),(11,'Sentadilla','Piernas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:02:00','2025-10-20 00:02:00'),(12,'Press Banca','Pecho',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:02:00','2025-10-20 00:02:00'),(13,'Remo','Espalda',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:02:00','2025-10-20 00:02:00'),(14,'Sentadilla','Piernas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:05:40','2025-10-20 00:05:40'),(15,'Press Banca','Pecho',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:05:41','2025-10-20 00:05:41'),(16,'Remo','Espalda',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:05:41','2025-10-20 00:05:41'),(17,'Sentadilla','Piernas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:19:45','2025-10-20 00:19:45'),(18,'Press Banca','Pecho',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:19:45','2025-10-20 00:19:45'),(19,'Remo','Espalda',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20 00:19:45','2025-10-20 00:19:45');
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
  `goal` tinyint NOT NULL,
  `assist` tinyint NOT NULL,
  `id_user` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `week_start_date` date NOT NULL,
  `week_number` tinyint NOT NULL,
  `year` smallint NOT NULL,
  PRIMARY KEY (`id_frequency`),
  UNIQUE KEY `unique_frequency_user_week` (`id_user`,`year`,`week_number`),
  KEY `idx_frequency_user` (`id_user`),
  CONSTRAINT `fk_frequency_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_goal_positive` CHECK ((`goal` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequency`
--

LOCK TABLES `frequency` WRITE;
/*!40000 ALTER TABLE `frequency` DISABLE KEYS */;
INSERT INTO `frequency` VALUES (1,0,3,0,1,'2025-10-15 06:11:40','2025-10-20 03:00:00','2025-10-20',43,2025),(3,0,5,0,2,'2025-10-16 04:35:33','2025-10-20 03:00:00','2025-10-20',43,2025),(4,0,6,0,3,'2025-10-16 07:50:20','2025-10-20 03:00:00','2025-10-20',43,2025),(8,0,3,0,29,'2025-10-19 23:53:54','2025-10-20 03:00:00','2025-10-20',43,2025),(14,0,3,0,37,'2025-10-20 00:00:16','2025-10-20 03:00:00','2025-10-20',43,2025),(29,0,5,0,86,'2025-10-20 00:46:42','2025-10-20 00:46:42','2025-10-20',43,2025);
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
  `week_start_date` date NOT NULL,
  `week_end_date` date NOT NULL,
  `goal` tinyint NOT NULL,
  `achieved` tinyint NOT NULL,
  `goal_met` tinyint(1) NOT NULL,
  `tokens_earned` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id_history`),
  KEY `idx_frequency_history_user_date` (`id_user_profile`,`week_start_date`),
  CONSTRAINT `frequency_history_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequency_history`
--

LOCK TABLES `frequency_history` WRITE;
/*!40000 ALTER TABLE `frequency_history` DISABLE KEYS */;
INSERT INTO `frequency_history` VALUES (1,1,'2025-10-13','2025-10-19',3,1,0,0,'2025-10-20 03:00:00'),(2,2,'2025-10-13','2025-10-19',5,0,0,0,'2025-10-20 03:00:00'),(3,3,'2025-10-13','2025-10-19',6,0,0,0,'2025-10-20 03:00:00'),(4,29,'2025-10-13','2025-10-19',3,1,0,0,'2025-10-20 03:00:00'),(5,37,'2025-10-13','2025-10-19',3,1,0,0,'2025-10-20 03:00:00'),(6,86,'2025-10-20','2025-10-26',5,0,0,0,'2025-10-20 03:00:00');
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
  `name` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `google_maps_url` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `social_media` json DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `facebook` varchar(100) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `equipment` json NOT NULL,
  `month_price` double NOT NULL,
  `week_price` double NOT NULL,
  `logo_url` varchar(512) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL COMMENT 'URL de la foto principal del gimnasio',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `max_capacity` int DEFAULT NULL,
  `area_sqm` decimal(10,2) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `auto_checkin_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `geofence_radius_meters` int NOT NULL DEFAULT '150',
  `min_stay_minutes` int NOT NULL DEFAULT '10',
  `rules` json NOT NULL COMMENT 'Listado de reglas de convivencia (array de strings)',
  PRIMARY KEY (`id_gym`),
  KEY `idx_gym_location` (`latitude`,`longitude`),
  KEY `idx_gym_deleted_at` (`deleted_at`),
  KEY `idx_gym_created_at` (`created_at`),
  KEY `idx_gym_geofence_config` (`auto_checkin_enabled`,`geofence_radius_meters`,`latitude`,`longitude`),
  CONSTRAINT `chk_latitude` CHECK ((`latitude` between -(90) and 90)),
  CONSTRAINT `chk_longitude` CHECK ((`longitude` between -(180) and 180))
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym`
--

LOCK TABLES `gym` WRITE;
/*!40000 ALTER TABLE `gym` DISABLE KEYS */;
INSERT INTO `gym` VALUES (1,'Iron Temple','Gimnasio premium con entrenamiento personalizado y crossfit','Resistencia','Av. Córdoba 1234',-34.603684,-58.381559,'','+54 9 11 1234 5678','','contacto@irontemple.com','https://www.irontemple.com','{\"instagram\": \"@irontemplegym\"}','','','2025-05-30','[\"Mancuernas\", \"barras olímpicas\", \"bicicletas\", \"cintas de correr\", \"zona de pesas libres\", \"sala funcional\"]',25000,8000,NULL,NULL,'','2025-10-15 06:11:43','2025-10-21 03:07:37',NULL,NULL,0,0,1,150,10,'[\"Guardar discos\", \"Llevar toalla\"]'),(2,'Iron Gym Reloaded','Muy completo','Resistencia','San Martín 456',-27.479532,-59.009432,NULL,NULL,NULL,NULL,NULL,'{}',NULL,NULL,'2025-05-31','[\"Pesas\", \"cardio\", \"boxeo\"]',13000,4000,NULL,NULL,NULL,'2025-10-15 06:11:43','2025-10-16 08:08:34',NULL,NULL,0,0,1,150,10,'null'),(3,'Bulldog Academy','Muy completo','Resistencia','San Martín 456',-27.491000,-58.811000,NULL,NULL,NULL,NULL,NULL,'{}',NULL,NULL,'2025-05-31','[\"Pesas\", \"cardio\", \"boxeo\"]',13000,4000,NULL,NULL,NULL,'2025-10-15 06:11:43','2025-10-16 08:08:34',NULL,NULL,0,0,1,150,10,'null'),(4,'Gimnasio Centro','Muy completo','Corrientes','San Martín 456',-27.481000,-58.811000,'','','','','','{}','','','2025-05-31','[\"Pesas\", \"cardio\", \"boxeo\"]',13000,4000,NULL,NULL,'','2025-10-15 06:11:43','2025-10-21 03:09:30',NULL,NULL,0,0,1,150,10,'[]'),(5,'Gimnasio Centro','Muy completo','Corrientes','San Martín 456',-27.481000,-58.811000,NULL,NULL,NULL,NULL,NULL,'{}',NULL,NULL,'2025-05-31','[\"Pesas\", \"cardio\", \"boxeo\"]',13000,4000,NULL,'2025-10-18 22:18:49',NULL,'2025-10-15 06:11:43','2025-10-18 22:18:49',NULL,NULL,0,0,1,150,10,'null'),(6,'VIVA FIT HOUSE SEDE LOPEZ Y PLANES','Gimnasio VIVA','Resistencia','Vicente Lopez y Planes 491',-27.449577,-58.982319,'https://www.google.com/maps/place/VIVA+FIT+HOUSE+SEDE+LOPEZ+Y+PLANES/@-27.4495771,-58.982319,17z/data=!3m1!4b1!4m6!3m5!1s0x94450dcb8bb9f32b:0x847cd86310e9abb9!8m2!3d-27.4495819!4d-58.9797441!16s%2Fg%2F11pz13gs8v?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','03624135798','03624135798','','https://vivafithouse.com/',NULL,'@vivafithouse','','2025-10-16','[\"Pesas\", \"Maquinas\", \"Cardio\"]',60000,24999.99,NULL,NULL,'https://tmp-images.partners.gympass.com/image/filename/4825480/lg_y5bJsaT79pkRGlNfDC7iRkYEvUGgrKPN.png','2025-10-16 11:15:06','2025-10-21 03:05:03',100,199.98,1,0,1,150,10,'[\"Llevar toalla\"]'),(7,'Exen Gym - Arturo Illia','gimnasio para discapacitados','Resistencia','Arturo Illia 457',-27.456097,-58.986721,'https://www.google.com/maps/place/Exen+Gym+-+Arturo+Illia/@-27.4560971,-58.9867207,17z/data=!3m1!4b1!4m6!3m5!1s0x94450db4bd15396f:0x545322bb315f6876!8m2!3d-27.4561019!4d-58.9841458!16s%2Fg%2F11y94xzk7v?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','03625159414','03625159414','','https://exen.com.ar/',NULL,'@exen.ar','','2025-10-16','[\"PESA\"]',50000,20000.02,NULL,'2025-10-17 06:37:18','https://mercadofitness.com/wp-content/uploads/2023/12/WhatsApp-Image-2023-12-14-at-11.59.22-1-e1702570695393.jpeg','2025-10-16 11:59:28','2025-10-17 06:37:18',50,100.01,1,1,1,148,10,'null'),(8,'Instituto Educativo Económico Nacional','Instituto de buenos programadores medio pelo','Resistencia','Av Mitre 280',-27.448283,-58.987539,'https://www.google.com/maps/place/Instituto+Educativo+Econ%C3%B3mico+Nacional/@-27.4482833,-58.9875387,17z/data=!3m1!4b1!4m6!3m5!1s0x94450cf5c69cacfd:0x29f83ad13975641!8m2!3d-27.4482881!4d-58.9849638!16s%2Fg%2F12lkfcj98?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','','','','',NULL,'','','2025-10-17','[\"Notebooks\"]',65000,9.94,NULL,NULL,'','2025-10-17 06:43:30','2025-10-19 20:56:47',NULL,NULL,1,1,1,150,10,'null'),(9,'Gym Arena','Lokura','Resistencia','Av San Lorenzo 1224',-27.460604,-58.987601,'https://www.google.com/maps/place/Gym+Arena/@-27.4606036,-58.9876005,17z/data=!3m1!4b1!4m6!3m5!1s0x94450cec38ff17e7:0xc0036b15c82b162!8m2!3d-27.4606084!4d-58.9850256!16s%2Fg%2F11b808fsb6?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','','','','',NULL,'','','2025-10-18','[\"Pesas\"]',20000,6999.97,NULL,'2025-10-18 23:35:45','','2025-10-18 22:17:45','2025-10-18 23:35:45',30,49.98,0,0,1,150,10,'null'),(10,'Gym Arena','aaa','aaa','aaa',-27.460604,-58.987601,'https://www.google.com/maps/place/Gym+Arena/@-27.4606036,-58.9876005,17z/data=!3m1!4b1!4m6!3m5!1s0x94450cec38ff17e7:0xc0036b15c82b162!8m2!3d-27.4606084!4d-58.9850256!16s%2Fg%2F11b808fsb6?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','','','','',NULL,'','','2025-10-18','[\"aaa\"]',222,22,NULL,'2025-10-20 00:52:36','','2025-10-18 23:36:25','2025-10-20 00:52:36',NULL,NULL,0,0,1,150,10,'null'),(11,'BULLDOG CENTER','ASDASD','ASDASD','ASDASD',-27.454499,-58.991211,'https://www.google.com/maps/place/BULLDOG+CENTER/@-27.4544987,-58.991211,17.12z/data=!4m6!3m5!1s0x94450da1079c05e9:0xcaae04726ea8d084!8m2!3d-27.4546501!4d-58.9887635!16s%2Fg%2F11p0vz1cmb?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','','','','',NULL,'','','2025-10-19','[\"ASDASD\"]',0.02,0.01,NULL,'2025-10-19 20:57:53','','2025-10-19 20:57:48','2025-10-19 20:57:53',NULL,NULL,0,0,1,150,10,'null'),(12,'E2E Gym','Gym for e2e geofence tests','TestCity','123 Test St',-34.603722,-58.381590,NULL,'000',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',1000,400,NULL,NULL,NULL,'2025-10-19 23:32:57','2025-10-19 23:32:57',NULL,NULL,0,0,1,150,10,'null'),(13,'E2E Gym','Gym for e2e geofence tests','TestCity','123 Test St',-34.603722,-58.381590,NULL,'000',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',1000,400,NULL,NULL,NULL,'2025-10-19 23:33:55','2025-10-19 23:33:55',NULL,NULL,0,0,1,150,10,'null'),(17,'GNoGeo','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',10,5,NULL,NULL,NULL,'2025-10-19 23:34:04','2025-10-19 23:34:04',NULL,NULL,0,0,1,150,10,'null'),(21,'AutoS3','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',10,5,NULL,NULL,NULL,'2025-10-19 23:53:12','2025-10-19 23:53:12',NULL,NULL,0,0,1,150,1,'null'),(22,'AutoS','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',10,5,NULL,NULL,NULL,'2025-10-19 23:53:54','2025-10-19 23:53:54',NULL,NULL,0,0,1,100,1,'null'),(23,'AutoS2','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',10,5,NULL,NULL,NULL,'2025-10-19 23:53:54','2025-10-19 23:53:54',NULL,NULL,0,0,0,150,1,'null'),(24,'AutoS3','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',10,5,NULL,NULL,NULL,'2025-10-19 23:53:54','2025-10-19 23:53:54',NULL,NULL,0,0,1,150,1,'null'),(27,'AutoS3','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-19','[]',10,5,NULL,NULL,NULL,'2025-10-19 23:54:51','2025-10-19 23:54:51',NULL,NULL,0,0,1,150,1,'null'),(30,'AutoS3','d','c','a',0.000000,0.000000,'','','','','',NULL,'','','2025-10-19','[\"Pesas\"]',10,5,NULL,NULL,'','2025-10-19 23:55:54','2025-10-20 00:53:01',NULL,NULL,0,0,1,150,1,'null'),(39,'GAcc','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20','[]',10,5,NULL,NULL,NULL,'2025-10-20 00:00:16','2025-10-20 00:00:16',NULL,NULL,0,0,1,150,1,'null'),(40,'GNoGeo','d','c','a',0.000000,0.000000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-20','[]',10,5,NULL,NULL,NULL,'2025-10-20 00:00:16','2025-10-20 00:00:16',NULL,NULL,0,0,0,150,1,'null'),(68,'Universidad Nacional del Nordeste','Universidad Nacional del Nordeste Chaco Resistencia','Resistencia','Av. Las Heras 727',-27.466027,-58.989918,'https://www.google.com/maps/place/Universidad+Nacional+del+Nordeste/@-27.466027,-58.9899177,16.16z/data=!4m14!1m7!3m6!1s0x94450d000242a125:0xfb063949df728fc!2sunne!8m2!3d-27.4774127!4d-58.988032!16s%2Fg%2F11y2v4lt1q!3m5!1s0x94450cebbfd122e1:0xa99f6654d07dbfef!8m2!3d-27.4634275!4d-58.9836224!16s%2Fg%2F1tfnv2np?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D','3624446958','','','https://www.unne.edu.ar/',NULL,'','','2025-10-20','[\"Libros\", \"Butacas\"]',100000,49999.96,NULL,NULL,'https://www.unne.edu.ar/wp-content/uploads/unne2023.png','2025-10-20 21:49:02','2025-10-20 21:49:02',1000,299.99,1,1,1,150,10,'null');
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
  `name` varchar(100) NOT NULL,
  `category` enum('FACILITY','SERVICE','SAFETY','EXTRA') NOT NULL DEFAULT 'FACILITY',
  `icon` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_amenity`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_amenity`
--

LOCK TABLES `gym_amenity` WRITE;
/*!40000 ALTER TABLE `gym_amenity` DISABLE KEYS */;
INSERT INTO `gym_amenity` VALUES (1,'Estacionamiento','FACILITY','car','2025-10-15 06:11:46','2025-10-15 06:11:46'),(2,'Vestuarios','FACILITY','shirt','2025-10-15 06:11:46','2025-10-15 06:11:46'),(3,'Duchas','FACILITY','water','2025-10-15 06:11:46','2025-10-15 06:11:46'),(4,'WiFi Gratuito','FACILITY','wifi','2025-10-15 06:11:46','2025-10-15 06:11:46'),(5,'Clases Grupales','SERVICE','people','2025-10-15 06:11:46','2025-10-15 06:11:46'),(6,'Entrenador Personal','SERVICE','person','2025-10-15 06:11:46','2025-10-15 06:11:46'),(7,'Área de Crossfit','EXTRA','fitness','2025-10-15 06:11:46','2025-10-15 06:11:46'),(8,'Circuito Funcional','EXTRA','repeat','2025-10-15 06:11:46','2025-10-15 06:11:46'),(9,'Lockers','SAFETY','lock-closed','2025-10-15 06:11:46','2025-10-15 06:11:46'),(10,'Seguridad las 24hs','SAFETY','shield-checkmark','2025-10-15 06:11:46','2025-10-15 06:11:46');
/*!40000 ALTER TABLE `gym_amenity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_gym_amenity`
--

DROP TABLE IF EXISTS `gym_gym_amenity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_gym_amenity` (
  `id_gym_amenity` int NOT NULL AUTO_INCREMENT,
  `id_gym` int NOT NULL,
  `id_amenity` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id_gym_amenity`),
  UNIQUE KEY `unique_gym_amenity` (`id_gym`,`id_amenity`),
  KEY `id_amenity` (`id_amenity`),
  CONSTRAINT `gym_gym_amenity_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_gym_amenity_ibfk_2` FOREIGN KEY (`id_amenity`) REFERENCES `gym_amenity` (`id_amenity`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_gym_amenity`
--

LOCK TABLES `gym_gym_amenity` WRITE;
/*!40000 ALTER TABLE `gym_gym_amenity` DISABLE KEYS */;
INSERT INTO `gym_gym_amenity` VALUES (1,10,3,'2025-10-19 16:54:16'),(2,10,1,'2025-10-19 16:54:16'),(3,30,8,'2025-10-20 00:53:01'),(4,30,7,'2025-10-20 00:53:01'),(5,30,9,'2025-10-20 00:53:01'),(6,68,4,'2025-10-20 21:49:02'),(7,68,1,'2025-10-20 21:49:02');
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
  KEY `idx_payment_user_date` (`id_user`,`payment_date`),
  CONSTRAINT `fk_gym_payment_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `updated_at` datetime NOT NULL,
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
  `rating` decimal(2,1) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `comment` text,
  `cleanliness_rating` tinyint DEFAULT NULL,
  `equipment_rating` tinyint DEFAULT NULL,
  `staff_rating` tinyint DEFAULT NULL,
  `value_rating` tinyint DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `helpful_count` int NOT NULL DEFAULT '0',
  `reported` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_review`),
  UNIQUE KEY `uniq_user_gym_review` (`id_user_profile`,`id_gym`),
  KEY `idx_gym_rating` (`id_gym`,`rating`),
  KEY `idx_review_created_at` (`created_at`),
  CONSTRAINT `gym_review_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gym_review_ibfk_2` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `day_of_week` varchar(10) NOT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `closed` tinyint(1) NOT NULL,
  PRIMARY KEY (`id_schedule`),
  KEY `id_gym` (`id_gym`),
  CONSTRAINT `gym_schedule_ibfk_1` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_schedule`
--

LOCK TABLES `gym_schedule` WRITE;
/*!40000 ALTER TABLE `gym_schedule` DISABLE KEYS */;
INSERT INTO `gym_schedule` VALUES (1,5,'Lunes','08:00:00','22:00:00',0),(2,7,'Lunes','08:00:00','23:00:00',0);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_special_schedule`
--

LOCK TABLES `gym_special_schedule` WRITE;
/*!40000 ALTER TABLE `gym_special_schedule` DISABLE KEYS */;
INSERT INTO `gym_special_schedule` VALUES (1,1,'2025-12-25','08:00:00','22:00:00',1,'Día Festivo'),(2,7,'2025-10-22','08:00:00','16:00:00',0,'Otro'),(3,7,'2025-12-25','08:00:00','14:00:00',0,'Navidad'),(4,6,'2025-12-25','08:00:00','22:00:00',0,'Navidad'),(5,2,'2025-10-17','08:00:00','22:00:00',1,'Otro');
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
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id_media` int NOT NULL AUTO_INCREMENT,
  `entity_type` enum('USER_PROFILE','GYM','EXERCISE','PROGRESS') NOT NULL,
  `entity_id` int NOT NULL,
  `media_type` enum('IMAGE','VIDEO') NOT NULL DEFAULT 'IMAGE',
  `url` varchar(500) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `file_size` int DEFAULT NULL COMMENT 'Tamaño del archivo en bytes',
  `mime_type` varchar(100) DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '0',
  `uploaded_at` datetime NOT NULL,
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
  `id_mp_payment` bigint NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `subscription_type` enum('MONTHLY','WEEKLY','DAILY','ANNUAL') NOT NULL DEFAULT 'MONTHLY',
  `auto_renew` tinyint(1) NOT NULL DEFAULT '0',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'ARS',
  `description` varchar(255) DEFAULT NULL,
  `preference_id` varchar(100) DEFAULT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  `merchant_order_id` varchar(100) DEFAULT NULL,
  `external_reference` varchar(150) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','AUTHORIZED','IN_PROCESS','IN_MEDIATION','REJECTED','CANCELLED','REFUNDED','CHARGED_BACK') NOT NULL DEFAULT 'PENDING',
  `status_detail` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `webhook_received_at` datetime DEFAULT NULL,
  `payer_email` varchar(120) DEFAULT NULL,
  `raw_response` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_mp_payment`),
  UNIQUE KEY `external_reference` (`external_reference`),
  KEY `id_gym` (`id_gym`),
  KEY `idx_mp_payment_id` (`payment_id`),
  KEY `idx_mp_preference_id` (`preference_id`),
  KEY `idx_mp_status` (`status`),
  KEY `idx_mp_user_gym` (`id_user_profile`,`id_gym`),
  CONSTRAINT `mercadopago_payment_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mercadopago_payment_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE
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
  `id_notification` bigint NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `type` enum('REMINDER','ACHIEVEMENT','REWARD','GYM_UPDATE','PAYMENT','SOCIAL','SYSTEM') NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `priority` enum('LOW','NORMAL','HIGH') NOT NULL DEFAULT 'NORMAL',
  `scheduled_for` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_notification`),
  KEY `idx_notification_user_unread` (`id_user_profile`,`is_read`,`created_at`),
  KEY `idx_notification_scheduled` (`scheduled_for`,`sent_at`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id_presence` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID ??nico de la presencia',
  `id_user_profile` int NOT NULL COMMENT 'ID del perfil de usuario (user_profiles)',
  `id_gym` int NOT NULL COMMENT 'ID del gimnasio',
  `first_seen_at` datetime NOT NULL COMMENT 'Primera detecci??n en geofence',
  `last_seen_at` datetime NOT NULL COMMENT '??ltima actualizaci??n de ubicaci??n',
  `exited_at` datetime DEFAULT NULL COMMENT 'Cu??ndo sali?? del geofence',
  `status` enum('DETECTING','CONFIRMED','EXITED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DETECTING' COMMENT 'DETECTING: detectando permanencia, CONFIRMED: check-in confirmado, EXITED: sali?? del ??rea',
  `converted_to_assistance` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Si ya se convirti?? en asistencia (evita duplicados)',
  `id_assistance` int DEFAULT NULL COMMENT 'ID de la asistencia creada (si existe)',
  `distance_meters` decimal(6,2) DEFAULT NULL COMMENT 'Distancia al gimnasio en metros',
  `accuracy_meters` decimal(6,2) DEFAULT NULL COMMENT 'Precisi??n GPS en metros',
  `location_updates_count` int NOT NULL DEFAULT '1' COMMENT 'Cantidad de actualizaciones de ubicaci??n recibidas',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Cu??ndo se cre?? el registro',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '??ltima actualizaci??n del registro',
  PRIMARY KEY (`id_presence`),
  KEY `idx_user_gym_status` (`id_user_profile`,`id_gym`,`status`) COMMENT 'Buscar presencias activas de un usuario en un gym',
  KEY `idx_status_last_seen` (`status`,`last_seen_at`) COMMENT 'Buscar presencias antiguas para marcar como EXITED',
  KEY `idx_converted` (`converted_to_assistance`) COMMENT 'Filtrar presencias ya convertidas',
  KEY `fk_presence_gym` (`id_gym`),
  KEY `fk_presence_assistance` (`id_assistance`),
  CONSTRAINT `fk_presence_assistance` FOREIGN KEY (`id_assistance`) REFERENCES `assistance` (`id_assistance`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_presence_gym` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_presence_user_profile` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de presencias en geofence para auto check-in';
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
  `date` date NOT NULL,
  `body_weight` int DEFAULT NULL,
  `body_fat` tinyint DEFAULT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id_progress`),
  KEY `fk_progress_user_profile` (`id_user`),
  CONSTRAINT `fk_progress_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progress`
--

LOCK TABLES `progress` WRITE;
/*!40000 ALTER TABLE `progress` DISABLE KEYS */;
INSERT INTO `progress` VALUES (1,'2025-06-01',72,15,1),(2,'2025-06-01',72,15,1);
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
INSERT INTO `progress_exercise` VALUES (1,1,100,10),(1,2,70,12),(1,3,80,8),(2,1,120,10),(2,2,70,12),(2,3,80,8);
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
  KEY `idx_token_expiration` (`expires_at`,`revoked`),
  CONSTRAINT `fk_refresh_token_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES (9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjIsImlhdCI6MTc2MDU4OTM5OCwiZXhwIjoxNzYzMTgxMzk4fQ.6fs_JCWX4vJ-pSSbwg4a9M_H9vWwVw6eKGXnEQaQGSE','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 04:36:38',0,'2025-10-16 04:36:38',2),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYwMTAzNiwiZXhwIjoxNzYzMTkzMDM2fQ.QS3995egQz9yThA7N2XjrcrsoxrHgcUhr81oW-bWa4k','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 07:50:36',0,'2025-10-16 07:50:36',3),(11,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYwMTEwMSwiZXhwIjoxNzYzMTkzMTAxfQ.pHjiUmLcI2aJrSzomr_VRjJ9hLPrIxB2WsqfWrmnTqI','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 07:51:41',0,'2025-10-16 07:51:41',3),(12,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYwMTYzNCwiZXhwIjoxNzYzMTkzNjM0fQ.jG1AqX7MsCcaZ-P6bec5rlDa2tAKJjH7ciTSJgIBaQM','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 08:00:34',0,'2025-10-16 08:00:34',3),(13,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYwMjI5MCwiZXhwIjoxNzYzMTk0MjkwfQ.gNzgJtmTDgJ9qJaEIkIEAt9HYHQgJcPhS5iwS_GBSA4','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 08:11:30',0,'2025-10-16 08:11:30',3),(14,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYxNTE1OCwiZXhwIjoxNzYzMjA3MTU4fQ.cvFiJC6fuVV39NlxLs9RoDkBnngowPEH3YoKF0X6K8s','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 11:45:58',0,'2025-10-16 11:45:58',3),(15,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYxODY5NCwiZXhwIjoxNzYzMjEwNjk0fQ.ZFPc2q1QCBKCuFv5symSpxwqybgiNLGME4kk5bQexrI','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 12:44:54',0,'2025-10-16 12:44:54',3),(16,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYxODc1NCwiZXhwIjoxNzYzMjEwNzU0fQ.PvKvUT1hs7-WJJOEKK2g5JcOAsNLRV9Ti6uVPri_LKQ','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 12:45:54',0,'2025-10-16 12:45:54',3),(17,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDYxODgwMSwiZXhwIjoxNzYzMjEwODAxfQ.psLnJh2QyMGIFpK90IqVrSnz7P9DXTTqwdb4POY-crQ','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-15 12:46:41',0,'2025-10-16 12:46:41',3),(18,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDkyMTA1MiwiZXhwIjoxNzYzNTEzMDUyfQ.AmoomvNAe5cMGqAm-o1jU8KwPakhW_avVq8HPCOdRtg','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-19 00:44:12',0,'2025-10-20 00:44:12',3),(19,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjMsImlhdCI6MTc2MDkyMjAzMiwiZXhwIjoxNzYzNTE0MDMyfQ.bviGyCyYY1fAa5jI0hQa5q8QOPWgU2-8mrvKs-8HfzA','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-19 01:00:32',0,'2025-10-20 01:00:32',3),(20,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjg2LCJpYXQiOjE3NjA5MjIxNjcsImV4cCI6MTc2MzUxNDE2N30.KdyMZBNpITPDSzsr7_tC26jZWyvLyThfgV6U3TxAR8w','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-19 01:02:47',0,'2025-10-20 01:02:47',86),(21,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyX3Byb2ZpbGUiOjg2LCJpYXQiOjE3NjA5MjcwNTYsImV4cCI6MTc2MzUxOTA1Nn0.Z0laIN1YuWm6boFLDo_tRIMpiXK4vlEk0q44bSMsnE0','Expo/1017756 CFNetwork/3860.100.1 Darwin/25.0.0','172.18.0.1','2025-11-19 02:24:16',0,'2025-10-20 02:24:16',86);
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
  `created_at` datetime NOT NULL,
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
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_reward`),
  KEY `idx_reward_gym_provider` (`id_gym`,`provider`),
  KEY `idx_reward_deleted_at` (`deleted_at`),
  KEY `idx_reward_availability` (`available`,`start_date`,`finish_date`),
  CONSTRAINT `chk_cost_positive` CHECK ((`cost_tokens` > 0)),
  CONSTRAINT `chk_reward_dates` CHECK ((`finish_date` >= `start_date`)),
  CONSTRAINT `chk_stock_positive` CHECK ((`stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward`
--

LOCK TABLES `reward` WRITE;
/*!40000 ALTER TABLE `reward` DISABLE KEYS */;
INSERT INTO `reward` VALUES (1,'Descuento del 20%','Canjeable por un 20% de descuento en la próxima mensualidad','descuento',100,1,49,'2025-05-01','2025-12-31','2025-05-31','system',NULL,'auto','2025-10-16 23:17:43'),(2,'PREMIUM 7 DIAS','BENEFICIO NUEVOS USUARIOS','descuento',50,1,100,'2025-10-16','2025-11-16','2025-10-16','system',NULL,'auto','2025-10-19 16:43:17');
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
INSERT INTO `roles` VALUES (1,'USER','Usuario normal de la aplicación móvil','2025-10-15 06:11:27'),(2,'ADMIN','Administrador del sistema con acceso total','2025-10-15 06:11:27');
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
  `description` varchar(500) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `is_template` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `recommended_for` enum('BEGINNER','INTERMEDIATE','ADVANCED') DEFAULT NULL,
  `template_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` enum('STRENGTH','CARDIO','FLEXIBILITY','HIIT','FUNCTIONAL','MIXED') DEFAULT NULL,
  `target_goal` enum('MUSCLE_GAIN','WEIGHT_LOSS','ENDURANCE','DEFINITION','GENERAL_FITNESS') DEFAULT NULL,
  `equipment_level` enum('NO_EQUIPMENT','BASIC','FULL_GYM') DEFAULT NULL,
  PRIMARY KEY (`id_routine`),
  KEY `fk_routine_user_profile` (`created_by`),
  KEY `idx_routine_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_routine_user_profile` FOREIGN KEY (`created_by`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routine`
--

LOCK TABLES `routine` WRITE;
/*!40000 ALTER TABLE `routine` DISABLE KEYS */;
INSERT INTO `routine` VALUES (1,'Fuerza Semanal','Rutina enfocada en fuerza para tren superior',1,0,NULL,NULL,0,'2025-10-15 06:11:57','2025-10-15 06:11:57',NULL,NULL,NULL),(2,'RUTINA','PRO',NULL,1,'2025-10-17 03:03:40','BEGINNER',1,'2025-10-17 02:41:46','2025-10-17 03:03:40',NULL,NULL,NULL),(3,'asdasd','asdasd',NULL,1,'2025-10-17 06:44:22','BEGINNER',2,'2025-10-17 06:44:06','2025-10-17 06:44:22',NULL,NULL,NULL),(4,'asd','asd',NULL,1,'2025-10-18 23:37:14','BEGINNER',1,'2025-10-17 07:32:10','2025-10-18 23:37:14',NULL,NULL,NULL),(5,'PRINCIPIANTE','RUTINA PARA PRINCIPIANTE',NULL,1,NULL,'BEGINNER',1,'2025-10-19 20:54:08','2025-10-19 20:54:08',NULL,NULL,NULL),(6,'Plantilla FUERZA','Rutina base',NULL,1,NULL,'BEGINNER',1,'2025-10-19 23:33:54','2025-10-19 23:33:54',NULL,NULL,NULL),(7,'Plantilla FUERZA','Rutina base',7,0,NULL,NULL,0,'2025-10-19 23:33:55','2025-10-19 23:33:55',NULL,NULL,NULL),(10,'Plantilla Admin','Creada por admin',NULL,1,NULL,'BEGINNER',2,'2025-10-19 23:34:04','2025-10-19 23:34:04',NULL,NULL,NULL),(11,'UNITTPL','d',NULL,1,NULL,'BEGINNER',1,'2025-10-19 23:34:06','2025-10-19 23:34:06',NULL,NULL,NULL),(12,'UNITTPL','d',16,0,NULL,NULL,0,'2025-10-19 23:34:06','2025-10-19 23:34:06',NULL,NULL,NULL),(13,'C1','d',17,0,NULL,NULL,0,'2025-10-19 23:34:06','2025-10-19 23:34:06',NULL,NULL,NULL),(14,'C2','d',17,0,NULL,NULL,0,'2025-10-19 23:34:06','2025-10-19 23:34:06',NULL,NULL,NULL),(15,'UNITTPL','d',17,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(16,'OWN0','d',18,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(17,'OWN1','d',18,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(18,'OWN2','d',18,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(19,'OWN3','d',18,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(20,'OWN4','d',18,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(21,'NOTPL','d',NULL,0,NULL,NULL,0,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,NULL),(22,'UNITTPL','d',NULL,1,NULL,'BEGINNER',1,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(23,'UNITTPL','d',22,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(24,'FREE-0','d',23,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(25,'FREE-1','d',23,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(26,'FREE-2','d',23,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(27,'FREE-3','d',23,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(28,'FREE-4','d',23,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(29,'OWN0','d',24,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(30,'OWN1','d',24,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(31,'OWN2','d',24,0,NULL,NULL,0,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,NULL),(32,'OWN3','d',24,0,NULL,NULL,0,'2025-10-19 23:52:05','2025-10-19 23:52:05',NULL,NULL,NULL),(33,'OWN4','d',24,0,NULL,NULL,0,'2025-10-19 23:52:05','2025-10-19 23:52:05',NULL,NULL,NULL),(34,'NOTPL','d',NULL,0,NULL,NULL,0,'2025-10-19 23:52:05','2025-10-19 23:52:05',NULL,NULL,NULL),(47,'NOTPL','d',NULL,0,NULL,NULL,0,'2025-10-19 23:52:47','2025-10-19 23:52:47',NULL,NULL,NULL),(48,'Plantilla FUERZA','Rutina base',NULL,1,NULL,'BEGINNER',1,'2025-10-20 00:01:49','2025-10-20 00:01:49',NULL,NULL,NULL),(49,'Plantilla FUERZA','Rutina base',41,0,NULL,NULL,0,'2025-10-20 00:01:50','2025-10-20 00:01:50',NULL,NULL,NULL),(50,'Plantilla Admin','Creada por admin',NULL,1,NULL,'BEGINNER',2,'2025-10-20 00:02:00','2025-10-20 00:02:00',NULL,NULL,NULL),(65,'NOTPL','d',NULL,0,NULL,NULL,0,'2025-10-20 00:02:09','2025-10-20 00:02:09',NULL,NULL,NULL),(72,'Plantilla Admin','Creada por admin',NULL,1,NULL,'BEGINNER',2,'2025-10-20 00:05:41','2025-10-20 00:05:41',NULL,NULL,NULL),(85,'NOTPL','d',NULL,0,NULL,NULL,0,'2025-10-20 00:05:45','2025-10-20 00:05:45',NULL,NULL,NULL),(90,'Plantilla Admin','Creada por admin',NULL,1,NULL,'BEGINNER',2,'2025-10-20 00:19:45','2025-10-20 00:19:45',NULL,NULL,NULL),(103,'NOTPL','d',NULL,0,NULL,NULL,0,'2025-10-20 00:19:51','2025-10-20 00:19:51',NULL,NULL,NULL);
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
  `day_number` tinyint NOT NULL COMMENT 'Número del día dentro de la rutina (1..7)',
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_routine_day`),
  UNIQUE KEY `uq_routine_day_number` (`id_routine`,`day_number`),
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
  `id_routine` int NOT NULL,
  `id_exercise` int NOT NULL,
  `series` tinyint NOT NULL,
  `reps` tinyint NOT NULL,
  `order` tinyint NOT NULL,
  `id_routine_day` int DEFAULT NULL,
  PRIMARY KEY (`id_routine`,`id_exercise`),
  KEY `id_exercise` (`id_exercise`),
  KEY `idx_routine_exercise_day` (`id_routine_day`),
  CONSTRAINT `fk_routine_exercise_day` FOREIGN KEY (`id_routine_day`) REFERENCES `routine_day` (`id_routine_day`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `routine_exercise_ibfk_1` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`),
  CONSTRAINT `routine_exercise_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `value` int NOT NULL,
  `id_frequency` int NOT NULL,
  `last_value` int DEFAULT NULL,
  `recovery_items` int NOT NULL DEFAULT '0',
  `id_user` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_streak`),
  KEY `fk_streak_frequency` (`id_frequency`),
  KEY `idx_streak_user` (`id_user`),
  CONSTRAINT `fk_streak_frequency` FOREIGN KEY (`id_frequency`) REFERENCES `frequency` (`id_frequency`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_streak_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streak`
--

LOCK TABLES `streak` WRITE;
/*!40000 ALTER TABLE `streak` DISABLE KEYS */;
INSERT INTO `streak` VALUES (1,1,1,0,0,1,'2025-10-15 06:11:40','2025-10-15 06:11:40'),(3,0,3,NULL,0,2,'2025-10-16 04:35:33','2025-10-16 04:35:33'),(4,0,4,NULL,0,3,'2025-10-16 07:50:20','2025-10-16 07:50:20'),(8,1,8,0,0,29,'2025-10-19 23:53:54','2025-10-19 23:53:54'),(14,1,14,0,0,37,'2025-10-20 00:00:16','2025-10-20 00:00:16'),(29,0,29,NULL,0,86,'2025-10-20 00:46:42','2025-10-20 00:46:42');
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
  `metadata` json DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_ledger`),
  KEY `idx_ledger_user_date` (`id_user_profile`,`created_at`),
  KEY `idx_ledger_ref` (`ref_type`,`ref_id`),
  KEY `idx_ledger_reason` (`reason`),
  CONSTRAINT `token_ledger_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_balance_positive` CHECK ((`balance_after` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_ledger`
--

LOCK TABLES `token_ledger` WRITE;
/*!40000 ALTER TABLE `token_ledger` DISABLE KEYS */;
INSERT INTO `token_ledger` VALUES (1,1,10,'LEGACY_GAIN',NULL,NULL,10,'2025-05-30 00:00:00',NULL,NULL),(2,1,200,'LEGACY_GAIN',NULL,NULL,210,'2025-05-31 00:00:00',NULL,NULL),(3,1,200,'LEGACY_GAIN',NULL,NULL,410,'2025-05-31 00:00:00',NULL,NULL),(4,1,200,'codigo',NULL,NULL,610,'2025-05-31 00:00:00',NULL,NULL),(8,3,100,'SOS CAPO',NULL,NULL,100,'2025-10-16 12:44:34',NULL,NULL),(9,3,500,'PRO',NULL,NULL,600,'2025-10-16 12:46:19',NULL,NULL),(10,3,10,'crack',NULL,NULL,610,'2025-10-17 06:36:07',NULL,NULL),(11,3,40,'pro',NULL,NULL,650,'2025-10-17 07:07:50',NULL,NULL),(13,29,5,'ATTENDANCE','assistance',2,5,'2025-10-19 23:53:54',NULL,NULL),(26,37,5,'ATTENDANCE','assistance',15,5,'2025-10-20 00:00:16',NULL,NULL);
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
  `progress_value` int NOT NULL DEFAULT '0',
  `progress_denominator` int DEFAULT NULL,
  `unlocked` tinyint(1) NOT NULL DEFAULT '0',
  `unlocked_at` datetime DEFAULT NULL,
  `last_source_type` varchar(50) DEFAULT NULL,
  `last_source_id` bigint DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_user_achievement`),
  UNIQUE KEY `uniq_user_achievement_definition` (`id_user_profile`,`id_achievement_definition`),
  KEY `id_achievement_definition` (`id_achievement_definition`),
  KEY `idx_user_achievement_user_status` (`id_user_profile`,`unlocked`,`updated_at`),
  CONSTRAINT `user_achievement_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_achievement_ibfk_2` FOREIGN KEY (`id_achievement_definition`) REFERENCES `achievement_definition` (`id_achievement_definition`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `event_type` enum('PROGRESS','UNLOCKED','RESET') NOT NULL,
  `delta` int DEFAULT NULL,
  `snapshot_value` int NOT NULL,
  `source_type` varchar(50) DEFAULT NULL,
  `source_id` bigint DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id_user_achievement_event`),
  KEY `idx_user_achievement_event_timeline` (`id_user_achievement`,`created_at`),
  CONSTRAINT `user_achievement_event_ibfk_1` FOREIGN KEY (`id_user_achievement`) REFERENCES `user_achievement` (`id_user_achievement`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id_body_metric` int NOT NULL AUTO_INCREMENT,
  `id_user_profile` int NOT NULL,
  `measured_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `height_cm` decimal(6,2) DEFAULT NULL,
  `bmi` decimal(6,2) DEFAULT NULL,
  `body_fat_percent` decimal(5,2) DEFAULT NULL,
  `muscle_mass_kg` decimal(6,2) DEFAULT NULL,
  `waist_cm` decimal(6,2) DEFAULT NULL,
  `hip_cm` decimal(6,2) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `source` enum('MANUAL','SMART_SCALE','TRAINER') NOT NULL DEFAULT 'MANUAL',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_body_metric`),
  KEY `idx_body_metrics_user` (`id_user_profile`),
  KEY `idx_body_metrics_measured_at` (`measured_at`),
  KEY `idx_user_body_metrics_user_date` (`id_user_profile`,`measured_at`) USING BTREE,
  CONSTRAINT `user_body_metrics_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `progress` int DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `tokens_earned` int DEFAULT '0',
  PRIMARY KEY (`id_user_profile`,`id_challenge`),
  KEY `fk_udc_ch` (`id_challenge`),
  KEY `idx_completed` (`id_user_profile`,`completed`,`completed_at`),
  CONSTRAINT `fk_udc_ch` FOREIGN KEY (`id_challenge`) REFERENCES `daily_challenge` (`id_challenge`) ON DELETE CASCADE,
  CONSTRAINT `fk_udc_user` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE
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
-- Table structure for table `user_favorite_gym`
--

DROP TABLE IF EXISTS `user_favorite_gym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorite_gym` (
  `id_user_profile` int NOT NULL,
  `id_gym` int NOT NULL,
  `created_at` datetime NOT NULL,
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
  `id_gym` int NOT NULL,
  `start_date` date NOT NULL,
  `finish_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `plan` enum('MENSUAL','SEMANAL','ANUAL') NOT NULL DEFAULT 'MENSUAL',
  `id_user` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_payment` bigint DEFAULT NULL,
  `subscription_type` enum('MONTHLY','WEEKLY','DAILY','ANNUAL') NOT NULL DEFAULT 'MONTHLY',
  `auto_renew` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_gym`),
  KEY `id_gym` (`id_gym`),
  KEY `user_gym_id_payment_foreign_idx` (`id_payment`),
  KEY `idx_user_gym_user_active` (`id_user`,`active`) USING BTREE,
  CONSTRAINT `fk_user_gym_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_gym_ibfk_2` FOREIGN KEY (`id_gym`) REFERENCES `gym` (`id_gym`),
  CONSTRAINT `user_gym_id_payment_foreign_idx` FOREIGN KEY (`id_payment`) REFERENCES `mercadopago_payment` (`id_mp_payment`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `chk_gym_dates` CHECK (((`finish_date` is null) or (`finish_date` >= `start_date`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_gym`
--

LOCK TABLES `user_gym` WRITE;
/*!40000 ALTER TABLE `user_gym` DISABLE KEYS */;
INSERT INTO `user_gym` VALUES (1,'2025-05-31','2025-05-31',0,'MENSUAL',1,'2025-10-15 06:11:42','2025-10-15 06:11:42',NULL,'MONTHLY',0),(2,'2025-05-31',NULL,1,'MENSUAL',1,'2025-10-15 06:11:42','2025-10-15 06:11:42',NULL,'MONTHLY',0);
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
  `id_routine_original` int NOT NULL,
  `id_routine_copy` int NOT NULL,
  `imported_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_import`),
  KEY `fk_uir_routine_orig` (`id_routine_original`),
  KEY `fk_uir_routine_copy` (`id_routine_copy`),
  KEY `idx_user_imports` (`id_user_profile`),
  CONSTRAINT `fk_uir_routine_copy` FOREIGN KEY (`id_routine_copy`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE,
  CONSTRAINT `fk_uir_routine_orig` FOREIGN KEY (`id_routine_original`) REFERENCES `routine` (`id_routine`) ON DELETE CASCADE,
  CONSTRAINT `fk_uir_user` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_imported_routine`
--

LOCK TABLES `user_imported_routine` WRITE;
/*!40000 ALTER TABLE `user_imported_routine` DISABLE KEYS */;
INSERT INTO `user_imported_routine` VALUES (1,7,6,7,'2025-10-19 23:33:55'),(3,16,11,12,'2025-10-19 23:34:06'),(4,17,11,13,'2025-10-19 23:34:06'),(5,17,11,14,'2025-10-19 23:34:06'),(6,17,11,15,'2025-10-19 23:34:07'),(7,22,22,23,'2025-10-19 23:52:04'),(8,23,22,24,'2025-10-19 23:52:04'),(9,23,22,25,'2025-10-19 23:52:04'),(13,41,48,49,'2025-10-20 00:01:50');
/*!40000 ALTER TABLE `user_imported_routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notification_settings`
--

DROP TABLE IF EXISTS `user_notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification_settings` (
  `id_user_profile` int NOT NULL,
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `email_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `reminder_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `achievement_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `reward_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `gym_news_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `quiet_hours_start` time DEFAULT NULL,
  `quiet_hours_end` time DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_user_profile`),
  CONSTRAINT `user_notification_settings_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id_user_profile` int NOT NULL AUTO_INCREMENT,
  `id_account` int NOT NULL COMMENT 'Relación 1:1 con account',
  `name` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `gender` enum('M','F','O') NOT NULL DEFAULT 'O',
  `locality` varchar(100) DEFAULT NULL,
  `subscription` enum('FREE','PREMIUM') NOT NULL DEFAULT 'FREE' COMMENT 'Nivel de suscripción del usuario',
  `tokens` int NOT NULL DEFAULT '0' COMMENT 'Tokens acumulados',
  `id_streak` int DEFAULT NULL COMMENT 'Racha actual del usuario',
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `premium_since` date DEFAULT NULL,
  `premium_expires` date DEFAULT NULL,
  `onboarding_completed` tinyint(1) NOT NULL DEFAULT '0',
  `app_tier` enum('FREE','PREMIUM') NOT NULL DEFAULT 'FREE',
  `preferred_language` varchar(5) NOT NULL DEFAULT 'es',
  `timezone` varchar(50) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  `birth_date` date DEFAULT NULL,
  PRIMARY KEY (`id_user_profile`),
  UNIQUE KEY `id_account` (`id_account`),
  KEY `idx_user_profiles_subscription` (`subscription`),
  KEY `idx_user_profiles_tokens` (`tokens`),
  KEY `fk_user_profile_streak` (`id_streak`),
  CONSTRAINT `fk_user_profile_streak` FOREIGN KEY (`id_streak`) REFERENCES `streak` (`id_streak`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`id_account`) REFERENCES `accounts` (`id_account`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_tokens_positive` CHECK ((`tokens` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,'Gonzalo','Gomez','M','Buenos Aires','PREMIUM',610,1,NULL,'2025-10-15 06:11:27','2025-10-15 06:11:27',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(2,3,'Gonzalo','Gomez','M','Chaco','FREE',0,3,NULL,'2025-10-16 04:35:33','2025-10-16 04:35:33',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires','2001-10-23'),(3,4,'QA','TEAM','M','Chaco','FREE',650,4,NULL,'2025-10-16 07:50:20','2025-10-19 20:50:46',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires','2001-10-23'),(6,7,'Geo','User','O','TestCity','FREE',0,NULL,NULL,'2025-10-19 23:32:57','2025-10-19 23:32:57',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(7,8,'Tpl','User','O',NULL,'FREE',0,NULL,NULL,'2025-10-19 23:33:54','2025-10-19 23:33:54',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(8,9,'Geo','User','O','TestCity','FREE',0,NULL,NULL,'2025-10-19 23:33:54','2025-10-19 23:33:55',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(16,18,'UTPL','User','O',NULL,'PREMIUM',0,NULL,NULL,'2025-10-19 23:34:06','2025-10-19 23:34:06',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(17,19,'UTPL','User','O',NULL,'FREE',0,NULL,NULL,'2025-10-19 23:34:06','2025-10-19 23:34:06',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(18,20,'UTPL','User','O',NULL,'FREE',0,NULL,NULL,'2025-10-19 23:34:07','2025-10-19 23:34:07',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(22,24,'UTPL','User','O',NULL,'PREMIUM',0,NULL,NULL,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(23,25,'UTPL','User','O',NULL,'FREE',0,NULL,NULL,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(24,26,'UTPL','User','O',NULL,'FREE',0,NULL,NULL,'2025-10-19 23:52:04','2025-10-19 23:52:04',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(29,31,'UAS','User','O',NULL,'PREMIUM',5,8,NULL,'2025-10-19 23:53:54','2025-10-19 23:53:54',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(37,39,'AE','User','O',NULL,'PREMIUM',5,14,NULL,'2025-10-20 00:00:16','2025-10-20 00:00:16',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(41,43,'Tpl','User','O',NULL,'FREE',0,NULL,NULL,'2025-10-20 00:01:49','2025-10-20 00:01:49',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires',NULL),(86,93,'Testing','Area','M','Chaco','FREE',0,29,NULL,'2025-10-20 00:46:42','2025-10-20 00:46:42',NULL,NULL,0,'FREE','es','America/Argentina/Buenos_Aires','2001-10-23');
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_routine`
--

DROP TABLE IF EXISTS `user_routine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_routine` (
  `id_routine` int NOT NULL,
  `start_date` date NOT NULL,
  `finish_date` date DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `id_user` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_routine`),
  KEY `id_routine` (`id_routine`),
  KEY `fk_user_routine_user_profile` (`id_user`),
  CONSTRAINT `fk_user_routine_user_profile` FOREIGN KEY (`id_user`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_routine_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`),
  CONSTRAINT `chk_routine_dates` CHECK (((`finish_date` is null) or (`finish_date` >= `start_date`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_routine`
--

LOCK TABLES `user_routine` WRITE;
/*!40000 ALTER TABLE `user_routine` DISABLE KEYS */;
INSERT INTO `user_routine` VALUES (1,'2025-06-01',NULL,1,1,'2025-10-15 06:11:42','2025-10-15 06:11:42');
/*!40000 ALTER TABLE `user_routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_gym_complete`
--

DROP TABLE IF EXISTS `vw_gym_complete`;
/*!50001 DROP VIEW IF EXISTS `vw_gym_complete`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_gym_complete` AS SELECT 
 1 AS `id_gym`,
 1 AS `name`,
 1 AS `description`,
 1 AS `city`,
 1 AS `address`,
 1 AS `latitude`,
 1 AS `longitude`,
 1 AS `phone`,
 1 AS `whatsapp`,
 1 AS `email`,
 1 AS `website`,
 1 AS `instagram`,
 1 AS `facebook`,
 1 AS `google_maps_url`,
 1 AS `max_capacity`,
 1 AS `area_sqm`,
 1 AS `verified`,
 1 AS `featured`,
 1 AS `month_price`,
 1 AS `week_price`,
 1 AS `photo_url`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `rating`,
 1 AS `reviews_count`,
 1 AS `active_members`,
 1 AS `monthly_visits`,
 1 AS `favorites_count`,
 1 AS `main_image`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_user_dashboard`
--

DROP TABLE IF EXISTS `vw_user_dashboard`;
/*!50001 DROP VIEW IF EXISTS `vw_user_dashboard`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_user_dashboard` AS SELECT 
 1 AS `id_user_profile`,
 1 AS `name`,
 1 AS `lastname`,
 1 AS `full_name`,
 1 AS `tokens`,
 1 AS `subscription`,
 1 AS `email`,
 1 AS `current_weight_kg`,
 1 AS `current_height_cm`,
 1 AS `current_bmi`,
 1 AS `weekly_goal`,
 1 AS `weekly_assists`,
 1 AS `current_streak`,
 1 AS `active_gyms`,
 1 AS `total_attendances`,
 1 AS `completed_workouts`,
 1 AS `member_since`*/;
SET character_set_client = @saved_cs_client;

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
  `started_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `total_sets` int NOT NULL DEFAULT '0',
  `total_reps` int NOT NULL DEFAULT '0',
  `total_weight` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_workout_session`),
  KEY `id_routine` (`id_routine`),
  KEY `id_routine_day` (`id_routine_day`),
  KEY `idx_workout_session_user` (`id_user_profile`),
  KEY `idx_workout_session_status` (`status`),
  KEY `idx_workout_session_started_at` (`started_at`),
  CONSTRAINT `workout_session_ibfk_1` FOREIGN KEY (`id_user_profile`) REFERENCES `user_profiles` (`id_user_profile`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workout_session_ibfk_2` FOREIGN KEY (`id_routine`) REFERENCES `routine` (`id_routine`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workout_session_ibfk_3` FOREIGN KEY (`id_routine_day`) REFERENCES `routine_day` (`id_routine_day`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `set_number` smallint NOT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `reps` smallint DEFAULT NULL,
  `rpe` decimal(3,1) DEFAULT NULL COMMENT 'Perceived exertion (RPE o RIR invertido)',
  `rest_seconds` int DEFAULT NULL,
  `is_warmup` tinyint(1) NOT NULL DEFAULT '0',
  `notes` varchar(255) DEFAULT NULL,
  `performed_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id_workout_set`),
  KEY `idx_workout_set_session` (`id_workout_session`),
  KEY `idx_workout_set_exercise` (`id_exercise`),
  CONSTRAINT `workout_set_ibfk_1` FOREIGN KEY (`id_workout_session`) REFERENCES `workout_session` (`id_workout_session`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `workout_set_ibfk_2` FOREIGN KEY (`id_exercise`) REFERENCES `exercise` (`id_exercise`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_set`
--

LOCK TABLES `workout_set` WRITE;
/*!40000 ALTER TABLE `workout_set` DISABLE KEYS */;
/*!40000 ALTER TABLE `workout_set` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `vw_gym_complete`
--

/*!50001 DROP VIEW IF EXISTS `vw_gym_complete`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_gym_complete` AS select `g`.`id_gym` AS `id_gym`,`g`.`name` AS `name`,`g`.`description` AS `description`,`g`.`city` AS `city`,`g`.`address` AS `address`,`g`.`latitude` AS `latitude`,`g`.`longitude` AS `longitude`,`g`.`phone` AS `phone`,`g`.`whatsapp` AS `whatsapp`,`g`.`email` AS `email`,`g`.`website` AS `website`,`g`.`instagram` AS `instagram`,`g`.`facebook` AS `facebook`,`g`.`google_maps_url` AS `google_maps_url`,`g`.`max_capacity` AS `max_capacity`,`g`.`area_sqm` AS `area_sqm`,`g`.`verified` AS `verified`,`g`.`featured` AS `featured`,`g`.`month_price` AS `month_price`,`g`.`week_price` AS `week_price`,`g`.`photo_url` AS `photo_url`,`g`.`created_at` AS `created_at`,`g`.`updated_at` AS `updated_at`,coalesce(`grs`.`avg_rating`,0) AS `rating`,coalesce(`grs`.`total_reviews`,0) AS `reviews_count`,(select count(distinct `ug`.`id_user`) from `user_gym` `ug` where ((`ug`.`id_gym` = `g`.`id_gym`) and (`ug`.`active` = true))) AS `active_members`,(select count(0) from `assistance` `a` where ((`a`.`id_gym` = `g`.`id_gym`) and (`a`.`date` >= (curdate() - interval 30 day)))) AS `monthly_visits`,(select count(0) from `user_favorite_gym` `ufg` where (`ufg`.`id_gym` = `g`.`id_gym`)) AS `favorites_count`,(select `m`.`url` from `media` `m` where ((`m`.`entity_type` = 'GYM') and (`m`.`entity_id` = `g`.`id_gym`) and (`m`.`is_primary` = true)) order by `m`.`uploaded_at` desc limit 1) AS `main_image` from (`gym` `g` left join `gym_rating_stats` `grs` on((`g`.`id_gym` = `grs`.`id_gym`))) where (`g`.`deleted_at` is null) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_user_dashboard`
--

/*!50001 DROP VIEW IF EXISTS `vw_user_dashboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_user_dashboard` AS select `up`.`id_user_profile` AS `id_user_profile`,`up`.`name` AS `name`,`up`.`lastname` AS `lastname`,concat(`up`.`name`,' ',`up`.`lastname`) AS `full_name`,`up`.`tokens` AS `tokens`,`up`.`subscription` AS `subscription`,`a`.`email` AS `email`,(select `ubm`.`weight_kg` from `user_body_metrics` `ubm` where (`ubm`.`id_user_profile` = `up`.`id_user_profile`) order by `ubm`.`measured_at` desc limit 1) AS `current_weight_kg`,(select `ubm`.`height_cm` from `user_body_metrics` `ubm` where (`ubm`.`id_user_profile` = `up`.`id_user_profile`) order by `ubm`.`measured_at` desc limit 1) AS `current_height_cm`,(select `ubm`.`bmi` from `user_body_metrics` `ubm` where (`ubm`.`id_user_profile` = `up`.`id_user_profile`) order by `ubm`.`measured_at` desc limit 1) AS `current_bmi`,(select `f`.`goal` from `frequency` `f` where (`f`.`id_user` = `up`.`id_user_profile`) order by `f`.`week_start_date` desc,`f`.`created_at` desc limit 1) AS `weekly_goal`,(select `f`.`assist` from `frequency` `f` where (`f`.`id_user` = `up`.`id_user_profile`) order by `f`.`week_start_date` desc,`f`.`created_at` desc limit 1) AS `weekly_assists`,(select `s`.`value` from `streak` `s` where (`s`.`id_user` = `up`.`id_user_profile`) order by `s`.`updated_at` desc limit 1) AS `current_streak`,(select count(0) from `user_gym` `ug` where ((`ug`.`id_user` = `up`.`id_user_profile`) and (`ug`.`active` = true))) AS `active_gyms`,(select count(0) from `assistance` `asst` where (`asst`.`id_user` = `up`.`id_user_profile`)) AS `total_attendances`,(select count(0) from `workout_session` `ws` where ((`ws`.`id_user_profile` = `up`.`id_user_profile`) and (`ws`.`status` = 'COMPLETED'))) AS `completed_workouts`,`up`.`created_at` AS `member_since` from (`user_profiles` `up` join `accounts` `a` on((`up`.`id_account` = `a`.`id_account`))) where (`a`.`is_active` = true) */;
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

-- Dump completed on 2025-10-21  3:55:14
