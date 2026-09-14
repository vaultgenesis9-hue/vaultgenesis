-- VaultGenesis — full schema rebuild
--
-- Use this ONLY if you're pointed at a brand-new/empty database (e.g. after
-- the Aiven MySQL service was recreated and the old one's data is gone).
-- Every statement is IF NOT EXISTS, so it's safe to run even if some tables
-- already exist — it will just skip them.
--
-- How to run it:
--   1. In Aiven, open vaultgenesis-mysql > Overview > Connection information,
--      and copy the Service URI (click "Click to reveal password" first, or
--      use the copy icon next to Service URI to copy it with the password
--      already filled in).
--   2. Run this file against that connection with any MySQL client, e.g.:
--        mysql --host=<host> --port=<port> --user=avnadmin -p defaultdb < scripts/rebuild-schema.sql
--      (it will prompt for the password), or paste its contents into a GUI
--      client like TablePlus / DBeaver / MySQL Workbench connected the same way.
--   3. After this runs, the site's tables exist but are EMPTY — you'll need
--      to run `node scripts/seed-admin.mjs` (or ask Claude to) to recreate
--      the admin login, since the previous admin account was in the data
--      that's gone.
--
-- This mirrors drizzle/schema.ts as of 2026-09-14 (migrations 0000-0007,
-- with the removed `walletImports` table left out since it's dropped again
-- immediately in migration 0007 anyway).

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`username` varchar(64),
	`passwordHash` varchar(256),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`walletAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`emailVerified` int NOT NULL DEFAULT 0,
	`verificationToken` varchar(128),
	`verificationTokenExpiry` timestamp,
	`isBanned` int NOT NULL DEFAULT 0,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE TABLE IF NOT EXISTS `tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`description` text,
	`decimals` int NOT NULL DEFAULT 9,
	`initialSupply` bigint NOT NULL,
	`logoUrl` text,
	`contractAddress` varchar(64),
	`status` enum('pending','deployed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `presales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(128) NOT NULL,
	`description` text,
	`targetAmount` decimal(18,6) NOT NULL,
	`raisedAmount` decimal(18,6) NOT NULL DEFAULT '0',
	`tokenPrice` decimal(18,8) NOT NULL,
	`minContribution` decimal(18,6) NOT NULL DEFAULT '10',
	`maxContribution` decimal(18,6) NOT NULL DEFAULT '10000',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('upcoming','active','ended','cancelled') NOT NULL DEFAULT 'upcoming',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `presales_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`presaleId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(18,6) NOT NULL,
	`tokensReceived` decimal(18,6) NOT NULL,
	`txHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `stakes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenSymbol` varchar(16) NOT NULL,
	`amount` decimal(18,6) NOT NULL,
	`apy` decimal(5,2) NOT NULL,
	`earnedRewards` decimal(18,6) NOT NULL DEFAULT '0',
	`status` enum('active','unstaked') NOT NULL DEFAULT 'active',
	`stakedAt` timestamp NOT NULL DEFAULT (now()),
	`unstakedAt` timestamp,
	CONSTRAINT `stakes_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `botTrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`botName` varchar(64) NOT NULL,
	`strategy` enum('scalping','arbitrage','momentum') NOT NULL,
	`pair` varchar(16) NOT NULL,
	`side` enum('buy','sell') NOT NULL,
	`price` decimal(18,8) NOT NULL,
	`amount` decimal(18,6) NOT NULL,
	`profit` decimal(18,6) NOT NULL DEFAULT '0',
	`status` enum('open','closed','cancelled') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	CONSTRAINT `botTrades_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `apiTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`label` varchar(64) NOT NULL DEFAULT 'Default',
	`isRevoked` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	`revokedAt` timestamp,
	CONSTRAINT `apiTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiTokens_token_unique` UNIQUE(`token`)
);

CREATE TABLE IF NOT EXISTS `adminCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(64) NOT NULL,
	`passwordHash` varchar(256) NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastLoginAt` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `adminCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminCredentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `adminCredentials_username_unique` UNIQUE(`username`)
);

CREATE TABLE IF NOT EXISTS `depositWallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(100) NOT NULL,
	`network` varchar(32) NOT NULL,
	`address` varchar(128) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `depositWallets_id` PRIMARY KEY(`id`)
);
