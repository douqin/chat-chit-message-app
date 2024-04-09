-- MySQL dump 10.13  Distrib 8.2.0, for Linux (x86_64)
--
-- Host: localhost    Database: dxlampr1_dbappchat
-- ------------------------------------------------------
-- Server version	8.2.0

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
-- Table structure for table `groupchat`
--

DROP TABLE IF EXISTS `groupchat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupchat` (
  `groupId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createAt` datetime NOT NULL,
  `status` int NOT NULL,
  `avatar` char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` int NOT NULL,
  `link` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `room` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`groupId`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupchat`
--

LOCK TABLES `groupchat` WRITE;
/*!40000 ALTER TABLE `groupchat` DISABLE KEYS */;
INSERT INTO `groupchat` VALUES (96,'ahihi','2024-01-08 07:12:47',0,NULL,0,NULL,'','96_group'),(97,'INVIDIAL','2024-01-11 14:43:56',0,NULL,1,NULL,'','97_group'),(98,'INVIDIAL','2024-01-11 14:54:08',0,NULL,1,NULL,'','98_group'),(99,'INVIDIAL','2024-01-11 15:37:04',0,NULL,1,NULL,'','99_group'),(100,'INVIDIAL','2024-01-11 15:37:08',0,NULL,1,NULL,'','100_group');
/*!40000 ALTER TABLE `groupchat` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `create_member_permisstion_for_group` AFTER INSERT ON `groupchat` FOR EACH ROW BEGIN
      INSERT INTO groupchat_member_permission(idgroup) VALUES(NEW.groupId);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `groupchat_member_permission`
--

DROP TABLE IF EXISTS `groupchat_member_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupchat_member_permission` (
  `groupId` int NOT NULL,
  `changename` int NOT NULL DEFAULT '0',
  `pinmessage` int NOT NULL DEFAULT '0',
  `createpoll` int NOT NULL DEFAULT '0',
  `sendmessage` int NOT NULL DEFAULT '1',
  `autoapproval` int NOT NULL DEFAULT '0',
  `id` int NOT NULL AUTO_INCREMENT,
  `changeavatar` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idgroup` (`groupId`),
  CONSTRAINT `groupchat_member_permission_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groupchat` (`groupId`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupchat_member_permission`
--

LOCK TABLES `groupchat_member_permission` WRITE;
/*!40000 ALTER TABLE `groupchat_member_permission` DISABLE KEYS */;
INSERT INTO `groupchat_member_permission` VALUES (96,0,0,0,1,0,63,0),(97,0,0,0,1,0,64,0),(98,0,0,0,1,0,65,0),(99,0,0,0,1,0,66,0),(100,0,0,0,1,0,67,0);
/*!40000 ALTER TABLE `groupchat_member_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manipulate_user`
--

DROP TABLE IF EXISTS `manipulate_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manipulate_user` (
  `manipulateId` int NOT NULL AUTO_INCREMENT,
  `messageId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`manipulateId`),
  KEY `idmessage` (`messageId`),
  KEY `iduser` (`userId`),
  CONSTRAINT `manipulate_user_ibfk_1` FOREIGN KEY (`messageId`) REFERENCES `message` (`messageId`),
  CONSTRAINT `manipulate_user_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manipulate_user`
--

LOCK TABLES `manipulate_user` WRITE;
/*!40000 ALTER TABLE `manipulate_user` DISABLE KEYS */;
INSERT INTO `manipulate_user` VALUES (1,194,2721),(2,194,2722),(3,194,2720),(4,195,2721),(5,196,2721),(6,197,2721),(7,198,2721),(8,199,2721),(9,200,2721),(10,201,2721),(11,202,2721),(12,203,2721),(13,204,2721),(14,205,2721),(15,206,2721),(16,207,2721),(17,207,2723),(18,208,2721),(19,208,2723),(20,209,2721),(21,209,2723),(22,210,2721),(23,210,2723),(24,211,2721),(25,211,2723),(26,212,2721),(27,212,2723),(28,213,2721),(29,213,2723),(30,214,2721),(31,214,2723),(32,215,2721),(33,215,2723),(34,216,2721),(35,216,2723),(36,217,2721),(37,217,2723),(38,218,2721),(39,218,2723),(40,219,2721),(41,219,2723),(42,220,2721),(43,220,2723),(44,221,2721),(45,221,2723),(46,222,2721),(47,222,2723),(48,223,2721),(49,223,2723);
/*!40000 ALTER TABLE `manipulate_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `groupId` int NOT NULL,
  `userId` int NOT NULL,
  `lastview` int DEFAULT NULL,
  `position` int DEFAULT '0',
  `status` int NOT NULL DEFAULT '0',
  `timejoin` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idgroup` (`groupId`),
  KEY `iduser` (`userId`),
  KEY `lastview` (`lastview`),
  CONSTRAINT `member_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `groupchat` (`groupId`),
  CONSTRAINT `member_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`),
  CONSTRAINT `member_ibfk_3` FOREIGN KEY (`lastview`) REFERENCES `message` (`messageId`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES (112,96,2723,NULL,2,0,'2024-01-08 07:12:47','lam chym to 4'),(113,96,2721,NULL,0,0,'2024-01-08 07:12:47','lam chym to 2'),(114,96,2722,NULL,0,0,'2024-01-08 07:12:47','lam chym to 3'),(115,96,2720,NULL,0,0,'2024-01-08 07:12:47','lam chym to 1'),(117,98,2723,NULL,0,0,'2024-01-11 14:54:09','lam chym to 4'),(118,98,2722,NULL,0,0,'2024-01-11 14:54:09','lam chym to 3'),(119,99,2723,NULL,0,0,'2024-01-11 15:37:04','lam chym to 4'),(120,99,2721,NULL,0,0,'2024-01-11 15:37:04','lam chym to 2'),(121,100,2723,NULL,0,0,'2024-01-11 15:37:08','lam chym to 4'),(122,100,2720,NULL,0,0,'2024-01-11 15:37:08','lam chym to 1');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `messageId` int NOT NULL AUTO_INCREMENT,
  `content` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createAt` datetime NOT NULL,
  `type` int NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `replyMessageId` int DEFAULT NULL,
  `ispin` int NOT NULL DEFAULT '0',
  `memberId` int NOT NULL,
  PRIMARY KEY (`messageId`),
  KEY `replyidmessage` (`replyMessageId`),
  KEY `idmember` (`memberId`),
  CONSTRAINT `message_ibfk_4` FOREIGN KEY (`replyMessageId`) REFERENCES `message` (`messageId`),
  CONSTRAINT `message_ibfk_5` FOREIGN KEY (`memberId`) REFERENCES `member` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (193,'created group','2024-01-08 14:12:48',5,0,NULL,0,112),(194,'added member {{@}} {{@}}  {{@}}','2024-01-08 14:12:48',5,0,NULL,0,112),(195,'dasdasdk {{@}}','2024-01-17 21:01:11',5,0,NULL,0,112),(196,'dasdasdk {{@}}','2024-01-17 22:02:05',5,0,NULL,0,112),(197,'dasdasdk {{@}}','2024-01-17 22:05:16',5,0,NULL,0,112),(198,'dasdasdk {{@}}','2024-01-17 22:06:49',5,0,NULL,0,112),(199,'dasdasdk {{@}}','2024-01-17 22:07:12',5,0,NULL,0,112),(200,'dasdasdk {{@}}','2024-01-17 22:08:26',5,0,NULL,0,112),(201,'dasdasdk {{@}}','2024-01-17 22:09:59',5,0,NULL,0,112),(202,'dasdasdk {{@}}','2024-01-17 22:11:29',5,0,NULL,0,112),(203,'dasdasdk {{@}}','2024-01-17 22:11:51',5,0,NULL,0,112),(204,'dasdasdk {{@}}','2024-01-17 22:12:35',5,0,NULL,0,112),(205,'dasdasdk {{@}}','2024-01-17 22:13:43',5,0,NULL,0,112),(206,'dasdasdk {{@}}','2024-01-17 22:16:21',5,0,NULL,0,112),(207,'dasdasdk {{@}} {{@}}','2024-01-17 22:16:50',5,0,NULL,0,112),(208,'dasdasdk {{@}} {{@}}','2024-01-17 22:17:58',5,0,NULL,0,112),(209,'dasdasdk {{@}} {{@}}','2024-01-17 22:25:22',5,0,NULL,0,112),(210,'dasdasdk {{@}} {{@}}','2024-01-17 22:34:09',5,1,NULL,0,112),(211,'dasdasdk {{@}} {{@}}','2024-01-17 22:39:25',5,0,NULL,0,112),(212,'dasdasdk {{@}} {{@}}','2024-01-17 22:48:28',5,0,NULL,0,112),(213,'dasdasdk {{@}} {{@}}','2024-01-17 22:49:11',5,0,NULL,0,112),(214,'dasdasdk {{@}} {{@}}','2024-01-17 22:49:57',5,0,211,0,112),(215,'dasdasdk {{@}} {{@}}','2024-01-18 10:32:46',0,0,NULL,1,112),(216,'dasdasdk {{@}} {{@}}','2024-01-18 10:38:17',0,0,NULL,1,112),(217,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:15',0,0,NULL,1,112),(218,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:16',0,0,NULL,1,112),(219,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:17',0,0,NULL,1,112),(220,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:37',0,0,NULL,0,112),(221,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:38',0,0,NULL,0,112),(222,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:39',0,0,NULL,0,112),(223,'dasdasdk {{@}} {{@}}','2024-01-18 10:40:40',0,0,NULL,0,112),(224,'10MdSm4quDWNjiLe1udjn-I-DM_oN4DM_','2024-01-18 08:33:41',1,0,NULL,0,112),(225,'https://media.tenor.com/2w1XsfvQD5kAAAAS/hhgf.gif','2024-01-18 08:52:18',3,0,NULL,0,112),(226,'dasdasdk {{@}} {{@}}','2024-01-18 15:58:46',0,0,NULL,0,112),(227,'con cac ne','2024-01-18 16:00:05',0,0,NULL,0,112),(228,'https://media.tenor.com/2w1XsfvQD5kAAAAS/hhgf.gif','2024-01-18 09:17:43',3,0,NULL,0,121),(229,'https://media.tenor.com/2w1XsfvQD5kAAAAS/hhgf.gif','2024-01-18 09:19:31',3,0,NULL,0,121),(230,'https://media.tenor.com/2w1XsfvQD5kAAAAS/hhgf.gif','2024-01-18 09:20:46',3,0,NULL,0,121),(231,'https://media.tenor.com/2w1XsfvQD5kAAAAS/hhgf.gif','2024-01-18 09:21:22',3,0,NULL,0,121);
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notificationId` int NOT NULL AUTO_INCREMENT,
  `ownerId` int NOT NULL,
  `contextType` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `subjectsCount` int NOT NULL,
  `affectObjectId` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `updateAt` datetime NOT NULL,
  PRIMARY KEY (`notificationId`),
  KEY `ownerId` (`ownerId`),
  KEY `affectObjectId` (`affectObjectId`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `user` (`userId`),
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`affectObjectId`) REFERENCES `notification_affect_object` (`affectObjectId`)
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
-- Table structure for table `notification_affect_object`
--

DROP TABLE IF EXISTS `notification_affect_object`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_affect_object` (
  `affectObjectId` int NOT NULL AUTO_INCREMENT,
  `entity` enum('Story','User','Group') NOT NULL,
  `entityId` int NOT NULL,
  `notificationId` int NOT NULL,
  PRIMARY KEY (`affectObjectId`),
  KEY `notificationId` (`notificationId`),
  CONSTRAINT `notification_affect_object_ibfk_1` FOREIGN KEY (`notificationId`) REFERENCES `notification` (`notificationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_affect_object`
--

LOCK TABLES `notification_affect_object` WRITE;
/*!40000 ALTER TABLE `notification_affect_object` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_affect_object` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_subject`
--

DROP TABLE IF EXISTS `notification_subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_subject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notificationId` int NOT NULL,
  `entity` enum('Story','User','Group') NOT NULL,
  `entityId` int NOT NULL,
  `createAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notificationId` (`notificationId`),
  CONSTRAINT `notification_subject_ibfk_1` FOREIGN KEY (`notificationId`) REFERENCES `notification` (`notificationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_subject`
--

LOCK TABLES `notification_subject` WRITE;
/*!40000 ALTER TABLE `notification_subject` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `react_story`
--

DROP TABLE IF EXISTS `react_story`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `react_story` (
  `id` int NOT NULL AUTO_INCREMENT,
  `storyId` int NOT NULL,
  `userIdReact` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idstory` (`storyId`),
  KEY `iduser_react` (`userIdReact`),
  CONSTRAINT `react_story_ibfk_1` FOREIGN KEY (`storyId`) REFERENCES `story` (`storyId`),
  CONSTRAINT `react_story_ibfk_2` FOREIGN KEY (`userIdReact`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `react_story`
--

LOCK TABLES `react_story` WRITE;
/*!40000 ALTER TABLE `react_story` DISABLE KEYS */;
INSERT INTO `react_story` VALUES (1,16,2721);
/*!40000 ALTER TABLE `react_story` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reaction`
--

DROP TABLE IF EXISTS `reaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reaction` (
  `idreaction` int NOT NULL AUTO_INCREMENT,
  `messageId` int NOT NULL,
  `type` int NOT NULL,
  `memberId` int NOT NULL,
  PRIMARY KEY (`idreaction`),
  KEY `idmessage` (`messageId`),
  KEY `idmember` (`memberId`),
  CONSTRAINT `reaction_ibfk_1` FOREIGN KEY (`messageId`) REFERENCES `message` (`messageId`),
  CONSTRAINT `reaction_ibfk_2` FOREIGN KEY (`memberId`) REFERENCES `member` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reaction`
--

LOCK TABLES `reaction` WRITE;
/*!40000 ALTER TABLE `reaction` DISABLE KEYS */;
INSERT INTO `reaction` VALUES (12,210,1,112),(13,210,1,112),(14,210,1,112);
/*!40000 ALTER TABLE `reaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relationship`
--

DROP TABLE IF EXISTS `relationship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relationship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requesterid` int DEFAULT NULL,
  `addresseeid` int DEFAULT NULL,
  `relation` int NOT NULL,
  `createAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `iduser1` (`requesterid`),
  KEY `iduser2` (`addresseeid`),
  CONSTRAINT `relationship_ibfk_1` FOREIGN KEY (`requesterid`) REFERENCES `user` (`userId`),
  CONSTRAINT `relationship_ibfk_2` FOREIGN KEY (`addresseeid`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4405 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relationship`
--

LOCK TABLES `relationship` WRITE;
/*!40000 ALTER TABLE `relationship` DISABLE KEYS */;
INSERT INTO `relationship` VALUES (4401,2723,2721,1,'2024-01-08 07:03:31'),(4402,2723,2720,1,'2024-01-08 07:04:49'),(4404,2723,2722,1,'2024-01-08 07:06:26');
/*!40000 ALTER TABLE `relationship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `story`
--

DROP TABLE IF EXISTS `story`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `story` (
  `storyId` int NOT NULL AUTO_INCREMENT,
  `userIdOwner` int NOT NULL,
  `createAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `content` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `visibility` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`storyId`),
  KEY `iduserowner` (`userIdOwner`),
  CONSTRAINT `story_ibfk_1` FOREIGN KEY (`userIdOwner`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `story`
--

LOCK TABLES `story` WRITE;
/*!40000 ALTER TABLE `story` DISABLE KEYS */;
INSERT INTO `story` VALUES (15,2723,'2024-01-25 16:30:00','1cyhLhkX5Aq1aPlykZJrXc48af2OzuXmR',0),(16,2723,'2024-01-25 16:40:49','1WuUe63Ja_fvTpx7ss7c4NQgQPoaJzQTz',0),(17,2723,'2024-01-25 16:41:45','1TRVd7tFkHOzoG632J8YLVvhcfy4bHXLQ',0),(18,2723,'2024-01-25 16:42:49','11HZdE7k8-dc7kRtMAJL5EH-VezXQN8ln',0),(19,2723,'2024-01-25 16:46:16','187qw2pWdUsMEnHXtD52nTfM4-TCPdZRC',0),(20,2723,'2024-03-02 00:26:43','1B7hi8yj4ORTiYip9SQDusiLpZZP5Th7B',0);
/*!40000 ALTER TABLE `story` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storyview`
--

DROP TABLE IF EXISTS `storyview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storyview` (
  `id` int NOT NULL AUTO_INCREMENT,
  `viewer` int NOT NULL,
  `storyId` int NOT NULL,
  `viewAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `viewer` (`viewer`),
  KEY `idstory` (`storyId`),
  CONSTRAINT `storyview_ibfk_1` FOREIGN KEY (`viewer`) REFERENCES `user` (`userId`),
  CONSTRAINT `storyview_ibfk_2` FOREIGN KEY (`storyId`) REFERENCES `story` (`storyId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storyview`
--

LOCK TABLES `storyview` WRITE;
/*!40000 ALTER TABLE `storyview` DISABLE KEYS */;
INSERT INTO `storyview` VALUES (8,2721,15,'2024-03-02 00:09:13');
/*!40000 ALTER TABLE `storyview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token`
--

DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token` (
  `id` int NOT NULL AUTO_INCREMENT,
  `refreshtoken` char(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `userId` int NOT NULL,
  `notificationtoken` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refreshtoken` (`refreshtoken`),
  KEY `iduser` (`userId`),
  CONSTRAINT `token_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=231 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token`
--

LOCK TABLES `token` WRITE;
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
INSERT INTO `token` VALUES (201,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTc1NjIwLCJleHAiOjE3MDQ0Mzk2MjB9.VAu7Ix6mzDHnT436DIFfP1BST2QZTbbUNG-uUofVye8',2722,'undefined'),(202,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTc5MTk5LCJleHAiOjE3MDQ0NDMxOTl9.GUDLeZ7dbYuFRjX3MszTAYQ9JKW2KkJw43taluh5Ldc',2722,'undefined'),(203,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTc5MjcwLCJleHAiOjE3MDQ0NDMyNzB9.X81ekDHpPVMznL4dwxyf6NR-LiCMd490ZrWwHKzQZoI',2722,'undefined'),(204,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxMDkwLCJleHAiOjE3MDQ0NDUwOTB9.1wczchfxk_U3pubFeVruMiSvFLTMN__v4g3c5220QKI',2722,'undefined'),(205,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxNTgyLCJleHAiOjE3MDQ0NDU1ODJ9.P8AQDqRxGhWegjK0qliz2ofs_5XqNFNlEkUiyVBOat8',2722,'undefined'),(206,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxNTg2LCJleHAiOjE3MDQ0NDU1ODZ9.6ojTq5Qojbko6NwM45Q574zKZLFF3Txuruo4mttjqSo',2722,'undefined'),(207,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxNjk1LCJleHAiOjE3MDQ0NDU2OTV9.TGyozH3880swDRDkjmyugd5fywXelY8-CLPg6TD9ZDw',2722,'undefined'),(208,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjEifSwiaWF0IjoxNzAzNjA1NDY5LCJleHAiOjE3MDQ0Njk0Njl9.ISm9ebIpC3Xxr9IvhjC-9A-dGNZwVrYnwh3Hst6ue9s',2721,'undefined'),(209,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjA1NTAzLCJleHAiOjE3MDQ0Njk1MDN9.08kl3GhdT-mptD4-4WM6iZOpnhT03FWzgl5kzpgMqic',2723,'undefined'),(210,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjQwMDIwLCJleHAiOjE3MDQ1MDQwMjB9.kZZ47lALPuInUaGL57UCtGE1-VxSSYUVTD8ZZi6Guwo',2723,'undefined'),(211,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjQ1NjA0LCJleHAiOjE3MDQ1MDk2MDR9.B4z-G0v2s-b_VxuEEBpq8Wl6A1hHtW4ShYU82jAjuUE',2723,'undefined'),(212,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjQ2Mzg3LCJleHAiOjE3MDQ1MTAzODd9.XwEjvvOUBDHXUzTFwiGaY6JhY75LyWX7gPpIy1Mvqws',2723,'undefined'),(213,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NDY4MjIzLCJleHAiOjE3MDUzMzIyMjN9.odYibXJyzAEpK3Pags43C-Qf99wSfg_GAjk0u-aQoyI',2723,'undefined'),(214,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NDY4MjU3LCJleHAiOjE3MDUzMzIyNTd9.Tv94YLvQFlzGjwN6Y7qxx3LUxA7ky-_jX-kNzVELuqs',2723,'undefined'),(215,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NDY5MjA2LCJleHAiOjE3MDUzMzMyMDZ9.6pCnNpRiO7UABIt2xwfYRE5AjTRORYT8LY3T9TrBm50',2723,'undefined'),(216,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NjgwNTI5LCJleHAiOjE3MDU1NDQ1Mjl9.S62SqT3jJ_51jevuUCWCT27s3Aj1CXzgh1rljA5IPok',2723,'undefined'),(217,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NjgyNTE2LCJleHAiOjE3MDU1NDY1MTZ9.o0d1uFzhSAH4LOvSrvZDU19b5mCT_3AzMdCFYGR7Ct4',2723,'undefined'),(219,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjAifSwiaWF0IjoxNzA0NzAzOTU3LCJleHAiOjE3MDU1Njc5NTd9.upvvuLnUBRspg7fuUGhfBi8f5xe3Gb3Xwr-khH8xRPc',2720,'undefined'),(220,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjAifSwiaWF0IjoxNzA0NzAzOTk1LCJleHAiOjE3MDU1Njc5OTV9.q6WZjVErtAZijP4jPYKtdrLEBJGE9xddvT7RUyjyRcE',2720,'undefined'),(221,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0OTc4NDE5LCJleHAiOjE3MDU4NDI0MTl9.yVh2oHXqN62bwsnZroH-xoazXGi0VBDBqTX1tks6frs',2723,'undefined'),(222,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjMifSwiaWF0IjoxNzA2MjAwMDk5LCJleHAiOjE3MDcwNjQwOTl9.-QthMOGhLsEhvlDL3S69Jv8i1xpMTK6Tj80aKU7f_uI',2723,'undefined'),(223,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjMifSwiaWF0IjoxNzA2MjAwMTAxLCJleHAiOjE3MDcwNjQxMDF9.N129MVj4vz4jtvnyyOXOfe9gTOtxBsBsF38TOxQMPLM',2723,'undefined'),(224,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjEifSwiaWF0IjoxNzA2MzI3OTg5LCJleHAiOjE3MDcxOTE5ODl9.YiRSPe1oBI7dgbp7SDGfrj5APHkESmmd_x9xdp1fQV8',2721,'undefined'),(225,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjMifSwiaWF0IjoxNzA5MzM3OTQ2LCJleHAiOjE3MTAyMDE5NDZ9.Dpk-VXf3hW_f_IPnma955fcLtOeYjK4wy8jJuykBxyg',2723,'undefined'),(226,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjEifSwiaWF0IjoxNzA5MzM4MDI3LCJleHAiOjE3MTAyMDIwMjd9.IatDjHQL8VajFtPMtH8lVeFyOVYmE4yltSUntrtWMak',2721,'undefined'),(227,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjIifSwiaWF0IjoxNzA5MzM4MzA3LCJleHAiOjE3MTAyMDIzMDd9.5kxnpak3TsZgsS6qpUmMATDbrYxGrrz72gqXWRnUHUk',2722,'undefined'),(228,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjIifSwiaWF0IjoxNzA5MzM4NzM3LCJleHAiOjE3MTAyMDI3Mzd9.C1R9zgmpR4n7WepXLDC6QtkK4MfczwcLho0ygzaKA18',2722,'undefined'),(229,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjMifSwiaWF0IjoxNzA5MzM4ODYxLCJleHAiOjE3MTAyMDI4NjF9.3Xnq2Is5d3LwY4Ga8GAuhn_pmEqwlPdoDNAwR2zrLp0',2723,'undefined'),(230,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6IjI3MjEifSwiaWF0IjoxNzA5MzM5NTk1LCJleHAiOjE3MTAyMDM1OTV9.X3gQbpq5ZqSE7fGZuuQSsjfSP0RibrF2LIupkzA1Sr4',2721,'undefined');
/*!40000 ALTER TABLE `token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `email` char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `lastname` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `birthday` datetime NOT NULL,
  `gender` int NOT NULL,
  `avatar` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `background` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `firstname` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `bio` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `username` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isOnline` int NOT NULL DEFAULT '0',
  `isActive` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (2720,NULL,'084294363','084294363',NULL,'2023-12-16 04:52:00',3,NULL,NULL,'lam chym to 1','','49e7e2cd-d858-4d85-ba87-f41064725490',NULL,0,0),(2721,NULL,'0842943637','0842943637',NULL,'2023-12-16 04:52:00',3,NULL,NULL,'lam chym to 2 ','','4eb6afa9-d4a6-465b-b4d7-454cd142fee1',NULL,0,0),(2722,NULL,'0919180731','0919180731',NULL,'2023-12-16 04:52:00',3,NULL,NULL,'lam chym to 3','','0d599b82-c451-4e0c-99a5-a9b1987e62d5',NULL,0,0),(2723,NULL,'091918073','091918073',NULL,'2023-12-16 04:52:00',3,NULL,NULL,'lam chym to 4','','e473a22e-2293-4f71-89b9-ee941a524634',NULL,0,0),(2724,NULL,'09191807333','091918073',NULL,'2023-12-16 04:52:00',1,NULL,NULL,'lam chym to 2','','a2dd1ce8-45ff-491e-ba78-2ab0806d240e',NULL,0,0),(2725,NULL,'0919180733','091918073','concac ','2023-12-16 04:52:00',2,NULL,NULL,'lam chym to 2','','cb474373-02d4-4f82-9e81-157203752d54',NULL,0,0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-05 11:49:46
