CREATE TABLE `botTrades` (
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
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`presaleId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(18,6) NOT NULL,
	`tokensReceived` decimal(18,6) NOT NULL,
	`txHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presales` (
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
--> statement-breakpoint
CREATE TABLE `stakes` (
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
--> statement-breakpoint
CREATE TABLE `tokens` (
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
--> statement-breakpoint
ALTER TABLE `users` ADD `walletAddress` varchar(64);