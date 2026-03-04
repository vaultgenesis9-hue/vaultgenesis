import { bigint, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
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
