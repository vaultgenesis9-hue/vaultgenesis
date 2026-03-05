CREATE TABLE `apiTokens` (
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
