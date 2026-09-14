CREATE TABLE `depositWallets` (
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
--> statement-breakpoint
DROP TABLE `walletImports`;