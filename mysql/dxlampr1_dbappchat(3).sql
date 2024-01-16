-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-server
-- Generation Time: Jan 16, 2024 at 10:33 AM
-- Server version: 8.2.0
-- PHP Version: 8.2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dxlampr1_dbappchat`
--

-- --------------------------------------------------------

--
-- Table structure for table `groupchat`
--

CREATE TABLE `groupchat` (
  `idgroup` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createat` datetime NOT NULL,
  `status` int NOT NULL,
  `avatar` char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type` int NOT NULL,
  `link` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groupchat`
--

INSERT INTO `groupchat` (`idgroup`, `name`, `createat`, `status`, `avatar`, `type`, `link`, `role`) VALUES
(96, 'ahihi', '2024-01-08 07:12:47', 0, NULL, 0, NULL, ''),
(97, 'INVIDIAL', '2024-01-11 14:43:56', 0, NULL, 1, NULL, ''),
(98, 'INVIDIAL', '2024-01-11 14:54:08', 0, NULL, 1, NULL, ''),
(99, 'INVIDIAL', '2024-01-11 15:37:04', 0, NULL, 1, NULL, ''),
(100, 'INVIDIAL', '2024-01-11 15:37:08', 0, NULL, 1, NULL, '');

--
-- Triggers `groupchat`
--
DELIMITER $$
CREATE TRIGGER `create_member_permisstion_for_group` AFTER INSERT ON `groupchat` FOR EACH ROW BEGIN
      INSERT INTO groupchat_member_permission(idgroup) VALUES(NEW.idgroup);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `groupchat_member_permission`
--

CREATE TABLE `groupchat_member_permission` (
  `idgroup` int NOT NULL,
  `changename` int NOT NULL DEFAULT '0',
  `pinmessage` int NOT NULL DEFAULT '0',
  `createpoll` int NOT NULL DEFAULT '0',
  `sendmessage` int NOT NULL DEFAULT '1',
  `autoapproval` int NOT NULL DEFAULT '0',
  `id` int NOT NULL,
  `changeavatar` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groupchat_member_permission`
--

INSERT INTO `groupchat_member_permission` (`idgroup`, `changename`, `pinmessage`, `createpoll`, `sendmessage`, `autoapproval`, `id`, `changeavatar`) VALUES
(96, 0, 0, 0, 1, 0, 63, 0),
(97, 0, 0, 0, 1, 0, 64, 0),
(98, 0, 0, 0, 1, 0, 65, 0),
(99, 0, 0, 0, 1, 0, 66, 0),
(100, 0, 0, 0, 1, 0, 67, 0);

-- --------------------------------------------------------

--
-- Table structure for table `manipulate_user`
--

CREATE TABLE `manipulate_user` (
  `idmanipulate` int NOT NULL,
  `idmessage` int NOT NULL,
  `iduser` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manipulate_user`
--

INSERT INTO `manipulate_user` (`idmanipulate`, `idmessage`, `iduser`) VALUES
(1, 194, 2721),
(2, 194, 2722),
(3, 194, 2720);

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `id` int NOT NULL,
  `idgroup` int NOT NULL,
  `iduser` int NOT NULL,
  `lastview` int DEFAULT NULL,
  `position` int DEFAULT '0',
  `status` int NOT NULL DEFAULT '0',
  `timejoin` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`id`, `idgroup`, `iduser`, `lastview`, `position`, `status`, `timejoin`, `nickname`) VALUES
(112, 96, 2723, NULL, 2, 0, '2024-01-08 07:12:47', 'lam chym to 4'),
(113, 96, 2721, NULL, 0, 0, '2024-01-08 07:12:47', 'lam chym to 2'),
(114, 96, 2722, NULL, 0, 0, '2024-01-08 07:12:47', 'lam chym to 3'),
(115, 96, 2720, NULL, 0, 0, '2024-01-08 07:12:47', 'lam chym to 1'),
(117, 98, 2723, NULL, 0, 0, '2024-01-11 14:54:09', 'lam chym to 4'),
(118, 98, 2722, NULL, 0, 0, '2024-01-11 14:54:09', 'lam chym to 3'),
(119, 99, 2723, NULL, 0, 0, '2024-01-11 15:37:04', 'lam chym to 4'),
(120, 99, 2721, NULL, 0, 0, '2024-01-11 15:37:04', 'lam chym to 2'),
(121, 100, 2723, NULL, 0, 0, '2024-01-11 15:37:08', 'lam chym to 4'),
(122, 100, 2720, NULL, 0, 0, '2024-01-11 15:37:08', 'lam chym to 1');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `idmessage` int NOT NULL,
  `content` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createat` datetime NOT NULL,
  `type` int NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  `replyidmessage` int DEFAULT NULL,
  `ispin` int NOT NULL DEFAULT '0',
  `idmember` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`idmessage`, `content`, `createat`, `type`, `status`, `replyidmessage`, `ispin`, `idmember`) VALUES
(193, 'created group', '2024-01-08 14:12:48', 5, 0, NULL, 0, 112),
(194, 'added member @ @ @', '2024-01-08 14:12:48', 5, 0, NULL, 0, 112);

-- --------------------------------------------------------

--
-- Table structure for table `reaction`
--

CREATE TABLE `reaction` (
  `idreaction` int NOT NULL,
  `idmessage` int NOT NULL,
  `type` int NOT NULL,
  `idmember` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `react_story`
--

CREATE TABLE `react_story` (
  `idreact` int NOT NULL,
  `idstory` int NOT NULL,
  `iduser_react` int NOT NULL,
  `type` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `relationship`
--

CREATE TABLE `relationship` (
  `id` int NOT NULL,
  `requesterid` int DEFAULT NULL,
  `addresseeid` int DEFAULT NULL,
  `relation` int NOT NULL,
  `createat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `relationship`
--

INSERT INTO `relationship` (`id`, `requesterid`, `addresseeid`, `relation`, `createat`) VALUES
(4401, 2723, 2721, 1, '2024-01-08 07:03:31'),
(4402, 2723, 2720, 1, '2024-01-08 07:04:49'),
(4404, 2723, 2722, 1, '2024-01-08 07:06:26');

-- --------------------------------------------------------

--
-- Table structure for table `story`
--

CREATE TABLE `story` (
  `idstory` int NOT NULL,
  `iduserowner` int NOT NULL,
  `createat` datetime DEFAULT CURRENT_TIMESTAMP,
  `content` varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storyview`
--

CREATE TABLE `storyview` (
  `id` int NOT NULL,
  `viewer` int NOT NULL,
  `idstory` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tagged_member`
--

CREATE TABLE `tagged_member` (
  `idtag` int NOT NULL,
  `idmessage` int NOT NULL,
  `idmember` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
  `id` int NOT NULL,
  `refreshtoken` char(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `iduser` int NOT NULL,
  `notificationtoken` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token`
--

INSERT INTO `token` (`id`, `refreshtoken`, `iduser`, `notificationtoken`) VALUES
(201, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTc1NjIwLCJleHAiOjE3MDQ0Mzk2MjB9.VAu7Ix6mzDHnT436DIFfP1BST2QZTbbUNG-uUofVye8', 2722, 'undefined'),
(202, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTc5MTk5LCJleHAiOjE3MDQ0NDMxOTl9.GUDLeZ7dbYuFRjX3MszTAYQ9JKW2KkJw43taluh5Ldc', 2722, 'undefined'),
(203, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTc5MjcwLCJleHAiOjE3MDQ0NDMyNzB9.X81ekDHpPVMznL4dwxyf6NR-LiCMd490ZrWwHKzQZoI', 2722, 'undefined'),
(204, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxMDkwLCJleHAiOjE3MDQ0NDUwOTB9.1wczchfxk_U3pubFeVruMiSvFLTMN__v4g3c5220QKI', 2722, 'undefined'),
(205, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxNTgyLCJleHAiOjE3MDQ0NDU1ODJ9.P8AQDqRxGhWegjK0qliz2ofs_5XqNFNlEkUiyVBOat8', 2722, 'undefined'),
(206, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxNTg2LCJleHAiOjE3MDQ0NDU1ODZ9.6ojTq5Qojbko6NwM45Q574zKZLFF3Txuruo4mttjqSo', 2722, 'undefined'),
(207, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjIifSwiaWF0IjoxNzAzNTgxNjk1LCJleHAiOjE3MDQ0NDU2OTV9.TGyozH3880swDRDkjmyugd5fywXelY8-CLPg6TD9ZDw', 2722, 'undefined'),
(208, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjEifSwiaWF0IjoxNzAzNjA1NDY5LCJleHAiOjE3MDQ0Njk0Njl9.ISm9ebIpC3Xxr9IvhjC-9A-dGNZwVrYnwh3Hst6ue9s', 2721, 'undefined'),
(209, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjA1NTAzLCJleHAiOjE3MDQ0Njk1MDN9.08kl3GhdT-mptD4-4WM6iZOpnhT03FWzgl5kzpgMqic', 2723, 'undefined'),
(210, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjQwMDIwLCJleHAiOjE3MDQ1MDQwMjB9.kZZ47lALPuInUaGL57UCtGE1-VxSSYUVTD8ZZi6Guwo', 2723, 'undefined'),
(211, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjQ1NjA0LCJleHAiOjE3MDQ1MDk2MDR9.B4z-G0v2s-b_VxuEEBpq8Wl6A1hHtW4ShYU82jAjuUE', 2723, 'undefined'),
(212, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzAzNjQ2Mzg3LCJleHAiOjE3MDQ1MTAzODd9.XwEjvvOUBDHXUzTFwiGaY6JhY75LyWX7gPpIy1Mvqws', 2723, 'undefined'),
(213, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NDY4MjIzLCJleHAiOjE3MDUzMzIyMjN9.odYibXJyzAEpK3Pags43C-Qf99wSfg_GAjk0u-aQoyI', 2723, 'undefined'),
(214, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NDY4MjU3LCJleHAiOjE3MDUzMzIyNTd9.Tv94YLvQFlzGjwN6Y7qxx3LUxA7ky-_jX-kNzVELuqs', 2723, 'undefined'),
(215, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NDY5MjA2LCJleHAiOjE3MDUzMzMyMDZ9.6pCnNpRiO7UABIt2xwfYRE5AjTRORYT8LY3T9TrBm50', 2723, 'undefined'),
(216, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NjgwNTI5LCJleHAiOjE3MDU1NDQ1Mjl9.S62SqT3jJ_51jevuUCWCT27s3Aj1CXzgh1rljA5IPok', 2723, 'undefined'),
(217, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0NjgyNTE2LCJleHAiOjE3MDU1NDY1MTZ9.o0d1uFzhSAH4LOvSrvZDU19b5mCT_3AzMdCFYGR7Ct4', 2723, 'undefined'),
(219, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjAifSwiaWF0IjoxNzA0NzAzOTU3LCJleHAiOjE3MDU1Njc5NTd9.upvvuLnUBRspg7fuUGhfBi8f5xe3Gb3Xwr-khH8xRPc', 2720, 'undefined'),
(220, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjAifSwiaWF0IjoxNzA0NzAzOTk1LCJleHAiOjE3MDU1Njc5OTV9.q6WZjVErtAZijP4jPYKtdrLEBJGE9xddvT7RUyjyRcE', 2720, 'undefined'),
(221, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkdXNlciI6IjI3MjMifSwiaWF0IjoxNzA0OTc4NDE5LCJleHAiOjE3MDU4NDI0MTl9.yVh2oHXqN62bwsnZroH-xoazXGi0VBDBqTX1tks6frs', 2723, 'undefined');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `iduser` int NOT NULL,
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
  `isActive` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`iduser`, `email`, `phone`, `password`, `lastname`, `birthday`, `gender`, `avatar`, `background`, `firstname`, `bio`, `username`, `address`, `isOnline`, `isActive`) VALUES
(2720, NULL, '084294363', '084294363', NULL, '2023-12-16 04:52:00', 3, NULL, NULL, 'lam chym to 1', '', '49e7e2cd-d858-4d85-ba87-f41064725490', NULL, 0, 0),
(2721, NULL, '0842943637', '0842943637', NULL, '2023-12-16 04:52:00', 3, NULL, NULL, 'lam chym to 2 ', '', '4eb6afa9-d4a6-465b-b4d7-454cd142fee1', NULL, 0, 0),
(2722, NULL, '0919180731', '0919180731', NULL, '2023-12-16 04:52:00', 3, NULL, NULL, 'lam chym to 3', '', '0d599b82-c451-4e0c-99a5-a9b1987e62d5', NULL, 0, 0),
(2723, NULL, '091918073', '091918073', NULL, '2023-12-16 04:52:00', 3, NULL, NULL, 'lam chym to 4', '', 'e473a22e-2293-4f71-89b9-ee941a524634', NULL, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `groupchat`
--
ALTER TABLE `groupchat`
  ADD PRIMARY KEY (`idgroup`);

--
-- Indexes for table `groupchat_member_permission`
--
ALTER TABLE `groupchat_member_permission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idgroup` (`idgroup`);

--
-- Indexes for table `manipulate_user`
--
ALTER TABLE `manipulate_user`
  ADD PRIMARY KEY (`idmanipulate`),
  ADD KEY `idmessage` (`idmessage`),
  ADD KEY `iduser` (`iduser`);

--
-- Indexes for table `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idgroup` (`idgroup`),
  ADD KEY `iduser` (`iduser`),
  ADD KEY `lastview` (`lastview`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`idmessage`),
  ADD KEY `replyidmessage` (`replyidmessage`),
  ADD KEY `idmember` (`idmember`);

--
-- Indexes for table `reaction`
--
ALTER TABLE `reaction`
  ADD PRIMARY KEY (`idreaction`),
  ADD KEY `idmessage` (`idmessage`),
  ADD KEY `idmember` (`idmember`);

--
-- Indexes for table `react_story`
--
ALTER TABLE `react_story`
  ADD PRIMARY KEY (`idreact`),
  ADD KEY `idstory` (`idstory`),
  ADD KEY `iduser_react` (`iduser_react`);

--
-- Indexes for table `relationship`
--
ALTER TABLE `relationship`
  ADD PRIMARY KEY (`id`),
  ADD KEY `iduser1` (`requesterid`),
  ADD KEY `iduser2` (`addresseeid`);

--
-- Indexes for table `story`
--
ALTER TABLE `story`
  ADD PRIMARY KEY (`idstory`),
  ADD KEY `iduserowner` (`iduserowner`);

--
-- Indexes for table `storyview`
--
ALTER TABLE `storyview`
  ADD PRIMARY KEY (`id`),
  ADD KEY `viewer` (`viewer`),
  ADD KEY `idstory` (`idstory`);

--
-- Indexes for table `tagged_member`
--
ALTER TABLE `tagged_member`
  ADD PRIMARY KEY (`idtag`),
  ADD KEY `idmessage` (`idmessage`),
  ADD KEY `iduser` (`idmember`);

--
-- Indexes for table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refreshtoken` (`refreshtoken`),
  ADD KEY `iduser` (`iduser`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`iduser`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `groupchat`
--
ALTER TABLE `groupchat`
  MODIFY `idgroup` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `groupchat_member_permission`
--
ALTER TABLE `groupchat_member_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `manipulate_user`
--
ALTER TABLE `manipulate_user`
  MODIFY `idmanipulate` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `idmessage` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

--
-- AUTO_INCREMENT for table `reaction`
--
ALTER TABLE `reaction`
  MODIFY `idreaction` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `react_story`
--
ALTER TABLE `react_story`
  MODIFY `idreact` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `relationship`
--
ALTER TABLE `relationship`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4405;

--
-- AUTO_INCREMENT for table `story`
--
ALTER TABLE `story`
  MODIFY `idstory` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `storyview`
--
ALTER TABLE `storyview`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tagged_member`
--
ALTER TABLE `tagged_member`
  MODIFY `idtag` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=222;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `iduser` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2724;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `groupchat_member_permission`
--
ALTER TABLE `groupchat_member_permission`
  ADD CONSTRAINT `groupchat_member_permission_ibfk_1` FOREIGN KEY (`idgroup`) REFERENCES `groupchat` (`idgroup`);

--
-- Constraints for table `manipulate_user`
--
ALTER TABLE `manipulate_user`
  ADD CONSTRAINT `manipulate_user_ibfk_1` FOREIGN KEY (`idmessage`) REFERENCES `message` (`idmessage`),
  ADD CONSTRAINT `manipulate_user_ibfk_2` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`);

--
-- Constraints for table `member`
--
ALTER TABLE `member`
  ADD CONSTRAINT `member_ibfk_1` FOREIGN KEY (`idgroup`) REFERENCES `groupchat` (`idgroup`),
  ADD CONSTRAINT `member_ibfk_2` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`),
  ADD CONSTRAINT `member_ibfk_3` FOREIGN KEY (`lastview`) REFERENCES `message` (`idmessage`);

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_4` FOREIGN KEY (`replyidmessage`) REFERENCES `message` (`idmessage`),
  ADD CONSTRAINT `message_ibfk_5` FOREIGN KEY (`idmember`) REFERENCES `member` (`id`);

--
-- Constraints for table `reaction`
--
ALTER TABLE `reaction`
  ADD CONSTRAINT `reaction_ibfk_1` FOREIGN KEY (`idmessage`) REFERENCES `message` (`idmessage`),
  ADD CONSTRAINT `reaction_ibfk_2` FOREIGN KEY (`idmember`) REFERENCES `member` (`id`);

--
-- Constraints for table `react_story`
--
ALTER TABLE `react_story`
  ADD CONSTRAINT `react_story_ibfk_1` FOREIGN KEY (`idstory`) REFERENCES `story` (`idstory`),
  ADD CONSTRAINT `react_story_ibfk_2` FOREIGN KEY (`iduser_react`) REFERENCES `user` (`iduser`);

--
-- Constraints for table `relationship`
--
ALTER TABLE `relationship`
  ADD CONSTRAINT `relationship_ibfk_1` FOREIGN KEY (`requesterid`) REFERENCES `user` (`iduser`),
  ADD CONSTRAINT `relationship_ibfk_2` FOREIGN KEY (`addresseeid`) REFERENCES `user` (`iduser`);

--
-- Constraints for table `story`
--
ALTER TABLE `story`
  ADD CONSTRAINT `story_ibfk_1` FOREIGN KEY (`iduserowner`) REFERENCES `user` (`iduser`);

--
-- Constraints for table `storyview`
--
ALTER TABLE `storyview`
  ADD CONSTRAINT `storyview_ibfk_1` FOREIGN KEY (`viewer`) REFERENCES `user` (`iduser`),
  ADD CONSTRAINT `storyview_ibfk_2` FOREIGN KEY (`idstory`) REFERENCES `story` (`idstory`);

--
-- Constraints for table `tagged_member`
--
ALTER TABLE `tagged_member`
  ADD CONSTRAINT `tagged_member_ibfk_1` FOREIGN KEY (`idmessage`) REFERENCES `message` (`idmessage`),
  ADD CONSTRAINT `tagged_member_ibfk_2` FOREIGN KEY (`idmember`) REFERENCES `user` (`iduser`);

--
-- Constraints for table `token`
--
ALTER TABLE `token`
  ADD CONSTRAINT `token_ibfk_1` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
