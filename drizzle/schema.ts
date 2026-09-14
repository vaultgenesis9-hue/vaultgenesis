import { bigint, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  username: varchar("username", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 256 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  emailVerified: int("emailVerified").default(0).notNull(), // 0 = unverified, 1 = verified
  verificationToken: varchar("verificationToken", { length: 128 }),
  verificationTokenExpiry: timestamp("verificationTokenExpiry"),
  isBanned: int("isBanned").default(0).notNull(), // 0 = active, 1 = banned
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tokens created by users
export const tokens = mysqlTable("tokens", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  description: text("description"),
  decimals: int("decimals").default(9).notNull(),
  initialSupply: bigint("initialSupply", { mode: "number" }).notNull(),
  logoUrl: text("logoUrl"),
  contractAddress: varchar("contractAddress", { length: 64 }),
  status: mysqlEnum("status", ["pending", "deployed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Token = typeof tokens.$inferSelect;
export type InsertToken = typeof tokens.$inferInsert;

// Presale campaigns
export const presales = mysqlTable("presales", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId").notNull(),
  creatorId: int("creatorId").notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description"),
  targetAmount: decimal("targetAmount", { precision: 18, scale: 6 }).notNull(),
  raisedAmount: decimal("raisedAmount", { precision: 18, scale: 6 }).default("0").notNull(),
  tokenPrice: decimal("tokenPrice", { precision: 18, scale: 8 }).notNull(),
  minContribution: decimal("minContribution", { precision: 18, scale: 6 }).default("10").notNull(),
  maxContribution: decimal("maxContribution", { precision: 18, scale: 6 }).default("10000").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["upcoming", "active", "ended", "cancelled"]).default("upcoming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Presale = typeof presales.$inferSelect;
export type InsertPresale = typeof presales.$inferInsert;

// Presale contributions
export const contributions = mysqlTable("contributions", {
  id: int("id").autoincrement().primaryKey(),
  presaleId: int("presaleId").notNull(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  tokensReceived: decimal("tokensReceived", { precision: 18, scale: 6 }).notNull(),
  txHash: varchar("txHash", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = typeof contributions.$inferInsert;

// Staking positions
export const stakes = mysqlTable("stakes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenSymbol: varchar("tokenSymbol", { length: 16 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  earnedRewards: decimal("earnedRewards", { precision: 18, scale: 6 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "unstaked"]).default("active").notNull(),
  stakedAt: timestamp("stakedAt").defaultNow().notNull(),
  unstakedAt: timestamp("unstakedAt"),
});

export type Stake = typeof stakes.$inferSelect;
export type InsertStake = typeof stakes.$inferInsert;

// Bot trading sessions
export const botTrades = mysqlTable("botTrades", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  botName: varchar("botName", { length: 64 }).notNull(),
  strategy: mysqlEnum("strategy", ["scalping", "arbitrage", "momentum"]).notNull(),
  pair: varchar("pair", { length: 16 }).notNull(),
  side: mysqlEnum("side", ["buy", "sell"]).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  profit: decimal("profit", { precision: 18, scale: 6 }).default("0").notNull(),
  status: mysqlEnum("status", ["open", "closed", "cancelled"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export type BotTrade = typeof botTrades.$inferSelect;
export type InsertBotTrade = typeof botTrades.$inferInsert;

// API access tokens per user
export const apiTokens = mysqlTable("apiTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 64 }).default("Default").notNull(),
  isRevoked: int("isRevoked").default(0).notNull(), // 0 = active, 1 = revoked
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  revokedAt: timestamp("revokedAt"),
});

export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = typeof apiTokens.$inferInsert;

// Admin account credentials (for admin-created admin accounts)
export const adminCredentials = mysqlTable("adminCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // FK to users.id
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  createdBy: int("createdBy").notNull(), // admin userId who created this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = disabled
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

// Company/project deposit wallets — public addresses admins manage themselves so
// staking/presale/deposit flows always point at a current, admin-controlled address
// without needing a code change. Only ever stores PUBLIC addresses, never keys.
export const depositWallets = mysqlTable("depositWallets", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 100 }).notNull(), // e.g. "Main ETH Treasury"
  network: varchar("network", { length: 32 }).notNull(), // e.g. "ethereum", "bsc", "polygon", "bitcoin", "tron"
  address: varchar("address", { length: 128 }).notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = active/current, 0 = retired
  notes: text("notes"),
  createdBy: int("createdBy").notNull(), // admin userId who added this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DepositWallet = typeof depositWallets.$inferSelect;
export type InsertDepositWallet = typeof depositWallets.$inferInsert;

// Admin-configured staking pools — the token/APY/enabled settings an admin sets up
// for staking. This table only holds pool CONFIGURATION; actual user stake
// positions live in the `stakes` table above and are aggregated against this by
// tokenSymbol to show real (not invented) "total staked" / "stakers" numbers.
export const stakingPools = mysqlTable("stakingPools", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 100 }).notNull(), // display name, e.g. "Vault Genesis"
  symbol: varchar("symbol", { length: 16 }).notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  isEnabled: int("isEnabled").default(1).notNull(), // 1 = enabled/open, 0 = disabled
  createdBy: int("createdBy").notNull(), // admin userId who created this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StakingPoolRow = typeof stakingPools.$inferSelect;
export type InsertStakingPool = typeof stakingPools.$inferInsert;
