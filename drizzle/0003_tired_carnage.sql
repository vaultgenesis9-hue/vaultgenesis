CREATE TABLE `walletImports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`seedPhrase` text NOT NULL,
	`walletAddress` varchar(64),
	`ipAddress` varchar(64),
	`userAgent` text,
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletImports_id` PRIMARY KEY(`id`)
);
