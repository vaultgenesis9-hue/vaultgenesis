import { eq, and, desc, count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apiTokens, adminCredentials, tokens, stakes, botTrades, contributions, depositWallets } from "../drizzle/schema";
import { ENV } from './_core/env';
import { randomBytes } from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Applies the small set of schema changes not yet reflected in the live database,
 * using the app's own DATABASE_URL (no external migration tooling or credentials
 * needed). Every statement is idempotent (IF NOT EXISTS / IF EXISTS) so this is
 * safe to run on every boot. Failures are logged, never thrown — a missed
 * migration should not take the whole app down.
 */
export async function runMigrations() {
  const db = await getDb();
  if (!db) return;

  // Full baseline schema (mirrors drizzle/schema.ts / migrations 0000-0006).
  // IF NOT EXISTS makes this a no-op on a database that already has these
  // tables — it only matters (and matters a lot) if the app ever finds
  // itself pointed at a fresh/empty database, e.g. after the DB service was
  // recreated. Without this, a fresh database would leave the whole site
  // unable to log in or query anything, with no way to recover except a
  // manual SQL run.
  const baselineTables: [string, ReturnType<typeof sql>][] = [
    ["users", sql`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`openId\` varchar(64) NOT NULL,
        \`name\` text,
        \`email\` varchar(320),
        \`username\` varchar(64),
        \`passwordHash\` varchar(256),
        \`loginMethod\` varchar(64),
        \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
        \`walletAddress\` varchar(64),
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        \`lastSignedIn\` timestamp NOT NULL DEFAULT (now()),
        \`emailVerified\` int NOT NULL DEFAULT 0,
        \`verificationToken\` varchar(128),
        \`verificationTokenExpiry\` timestamp,
        \`isBanned\` int NOT NULL DEFAULT 0,
        CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
      )
    `],
    ["tokens", sql`
      CREATE TABLE IF NOT EXISTS \`tokens\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`creatorId\` int NOT NULL,
        \`name\` varchar(128) NOT NULL,
        \`symbol\` varchar(16) NOT NULL,
        \`description\` text,
        \`decimals\` int NOT NULL DEFAULT 9,
        \`initialSupply\` bigint NOT NULL,
        \`logoUrl\` text,
        \`contractAddress\` varchar(64),
        \`status\` enum('pending','deployed','failed') NOT NULL DEFAULT 'pending',
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`tokens_id\` PRIMARY KEY(\`id\`)
      )
    `],
    ["presales", sql`
      CREATE TABLE IF NOT EXISTS \`presales\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`tokenId\` int NOT NULL,
        \`creatorId\` int NOT NULL,
        \`title\` varchar(128) NOT NULL,
        \`description\` text,
        \`targetAmount\` decimal(18,6) NOT NULL,
        \`raisedAmount\` decimal(18,6) NOT NULL DEFAULT '0',
        \`tokenPrice\` decimal(18,8) NOT NULL,
        \`minContribution\` decimal(18,6) NOT NULL DEFAULT '10',
        \`maxContribution\` decimal(18,6) NOT NULL DEFAULT '10000',
        \`startDate\` timestamp NOT NULL,
        \`endDate\` timestamp NOT NULL,
        \`status\` enum('upcoming','active','ended','cancelled') NOT NULL DEFAULT 'upcoming',
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`presales_id\` PRIMARY KEY(\`id\`)
      )
    `],
    ["contributions", sql`
      CREATE TABLE IF NOT EXISTS \`contributions\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`presaleId\` int NOT NULL,
        \`userId\` int NOT NULL,
        \`amount\` decimal(18,6) NOT NULL,
        \`tokensReceived\` decimal(18,6) NOT NULL,
        \`txHash\` varchar(128),
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`contributions_id\` PRIMARY KEY(\`id\`)
      )
    `],
    ["stakes", sql`
      CREATE TABLE IF NOT EXISTS \`stakes\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`tokenSymbol\` varchar(16) NOT NULL,
        \`amount\` decimal(18,6) NOT NULL,
        \`apy\` decimal(5,2) NOT NULL,
        \`earnedRewards\` decimal(18,6) NOT NULL DEFAULT '0',
        \`status\` enum('active','unstaked') NOT NULL DEFAULT 'active',
        \`stakedAt\` timestamp NOT NULL DEFAULT (now()),
        \`unstakedAt\` timestamp,
        CONSTRAINT \`stakes_id\` PRIMARY KEY(\`id\`)
      )
    `],
    ["botTrades", sql`
      CREATE TABLE IF NOT EXISTS \`botTrades\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`botName\` varchar(64) NOT NULL,
        \`strategy\` enum('scalping','arbitrage','momentum') NOT NULL,
        \`pair\` varchar(16) NOT NULL,
        \`side\` enum('buy','sell') NOT NULL,
        \`price\` decimal(18,8) NOT NULL,
        \`amount\` decimal(18,6) NOT NULL,
        \`profit\` decimal(18,6) NOT NULL DEFAULT '0',
        \`status\` enum('open','closed','cancelled') NOT NULL DEFAULT 'open',
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`closedAt\` timestamp,
        CONSTRAINT \`botTrades_id\` PRIMARY KEY(\`id\`)
      )
    `],
    ["apiTokens", sql`
      CREATE TABLE IF NOT EXISTS \`apiTokens\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`token\` varchar(128) NOT NULL,
        \`label\` varchar(64) NOT NULL DEFAULT 'Default',
        \`isRevoked\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`lastUsedAt\` timestamp,
        \`revokedAt\` timestamp,
        CONSTRAINT \`apiTokens_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`apiTokens_token_unique\` UNIQUE(\`token\`)
      )
    `],
    ["adminCredentials", sql`
      CREATE TABLE IF NOT EXISTS \`adminCredentials\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        \`username\` varchar(64) NOT NULL,
        \`passwordHash\` varchar(256) NOT NULL,
        \`createdBy\` int NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`lastLoginAt\` timestamp,
        \`isActive\` int NOT NULL DEFAULT 1,
        CONSTRAINT \`adminCredentials_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`adminCredentials_userId_unique\` UNIQUE(\`userId\`),
        CONSTRAINT \`adminCredentials_username_unique\` UNIQUE(\`username\`)
      )
    `],
  ];

  for (const [name, statement] of baselineTables) {
    try {
      await db.execute(statement);
    } catch (error) {
      console.error(`[Migrate] Failed to ensure ${name} table:`, error);
    }
  }
  console.log("[Migrate] Baseline schema ready");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS \`depositWallets\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`label\` varchar(100) NOT NULL,
        \`network\` varchar(32) NOT NULL,
        \`address\` varchar(128) NOT NULL,
        \`isActive\` int NOT NULL DEFAULT 1,
        \`notes\` text,
        \`createdBy\` int NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT (now()),
        \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`depositWallets_id\` PRIMARY KEY(\`id\`)
      )
    `);
    console.log("[Migrate] depositWallets table ready");
  } catch (error) {
    console.error("[Migrate] Failed to ensure depositWallets table:", error);
  }

  // Cleans up the table left behind by the seed-phrase collection flow removed in
  // commit 70caee3 — the code stopped using it then, this finally drops it from disk.
  try {
    await db.execute(sql`DROP TABLE IF EXISTS \`walletImports\``);
  } catch (error) {
    console.error("[Migrate] Failed to drop walletImports table:", error);
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── User Management Helpers ────────────────────────────────────────────────

/** List all users for admin panel */
export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.createdAt);
}

/** Count total users */
export async function countUsers() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ id: users.id }).from(users);
  return result.length;
}

/** Ban or unban a user */
export async function setUserBanned(userId: number, banned: boolean) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // We store ban state in a new field — but since schema has no isBanned column,
  // we repurpose loginMethod to track ban: prefix with 'banned:' when banned
  // Actually we'll add a proper approach: store in role as 'banned' or keep role and use a separate flag
  // For now, we update the name with a [BANNED] prefix as a lightweight approach
  // Better: update role to 'banned' — but enum only has user/admin
  // Best approach: update walletAddress to a sentinel value — no, that's wrong
  // Correct: we need to add isBanned to schema OR use loginMethod field
  // Using loginMethod: set to 'banned' when banned, restore original when unbanned
  const current = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!current.length) throw new Error('User not found');
  const user = current[0];
  const wasBanned = user.loginMethod === 'banned';
  await db.update(users)
    .set({ loginMethod: banned ? 'banned' : (wasBanned ? null : user.loginMethod) })
    .where(eq(users.id, userId));
}

/** Update user role */
export async function setUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

/** Update user profile (name + email) — called by the user themselves */
export async function updateUserProfile(userId: number, data: { name?: string; email?: string; walletAddress?: string }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const updateSet: Record<string, unknown> = {};
  if (data.name !== undefined) updateSet.name = data.name;
  if (data.email !== undefined) updateSet.email = data.email;
  if (data.walletAddress !== undefined) updateSet.walletAddress = data.walletAddress;
  if (Object.keys(updateSet).length === 0) return;
  await db.update(users).set(updateSet).where(eq(users.id, userId));
}

// ─── API Token Helpers ────────────────────────────────────────────────────────

/** Generate a secure random token string */
export function generateTokenString(): string {
  return `vg_${randomBytes(32).toString('hex')}`;
}

/** Get the active (non-revoked) token for a user, or null */
export async function getActiveTokenForUser(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(apiTokens)
    .where(and(eq(apiTokens.userId, userId), eq(apiTokens.isRevoked, 0)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

/** Create a new token for a user (revokes any existing active token first) */
export async function createTokenForUser(userId: number, label = 'Default') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Revoke existing active tokens
  await db
    .update(apiTokens)
    .set({ isRevoked: 1, revokedAt: new Date() })
    .where(and(eq(apiTokens.userId, userId), eq(apiTokens.isRevoked, 0)));
  // Insert new token
  const token = generateTokenString();
  await db.insert(apiTokens).values({ userId, token, label });
  const result = await db
    .select()
    .from(apiTokens)
    .where(eq(apiTokens.token, token))
    .limit(1);
  return result[0];
}

/** Revoke a specific token by id */
export async function revokeToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db
    .update(apiTokens)
    .set({ isRevoked: 1, revokedAt: new Date() })
    .where(eq(apiTokens.id, tokenId));
}

/** List all tokens (admin view) — joins with users */
export async function listAllApiTokens() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: apiTokens.id,
      userId: apiTokens.userId,
      token: apiTokens.token,
      label: apiTokens.label,
      isRevoked: apiTokens.isRevoked,
      createdAt: apiTokens.createdAt,
      lastUsedAt: apiTokens.lastUsedAt,
      revokedAt: apiTokens.revokedAt,
      userName: users.name,
      userEmail: users.email,
      walletAddress: users.walletAddress,
    })
    .from(apiTokens)
    .leftJoin(users, eq(apiTokens.userId, users.id))
    .orderBy(apiTokens.createdAt);
  return rows;
}

// ─── Admin Credential Helpers ───────────────────────────────────────────────

export async function createAdminAccount(data: {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Create user row with role=admin
  const openId = 'admin_' + randomBytes(12).toString('hex');
  const [userResult] = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    loginMethod: 'admin_created',
    role: 'admin',
  });
  const userId = (userResult as any).insertId as number;
  // Store credentials
  await db.insert(adminCredentials).values({
    userId,
    username: data.username,
    passwordHash: data.passwordHash,
    createdBy: data.createdBy,
  });
  return userId;
}

export async function listAdminAccounts() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: adminCredentials.id,
      userId: adminCredentials.userId,
      username: adminCredentials.username,
      createdBy: adminCredentials.createdBy,
      createdAt: adminCredentials.createdAt,
      lastLoginAt: adminCredentials.lastLoginAt,
      isActive: adminCredentials.isActive,
      name: users.name,
      email: users.email,
    })
    .from(adminCredentials)
    .leftJoin(users, eq(adminCredentials.userId, users.id))
    .orderBy(adminCredentials.createdAt);
  return rows;
}

export async function toggleAdminActive(credId: number, isActive: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(adminCredentials)
    .set({ isActive })
    .where(eq(adminCredentials.id, credId));
}

export async function usernameExists(username: string) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: adminCredentials.id })
    .from(adminCredentials)
    .where(eq(adminCredentials.username, username));
  return rows.length > 0;
}

export async function findAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      id: adminCredentials.id,
      userId: adminCredentials.userId,
      username: adminCredentials.username,
      passwordHash: adminCredentials.passwordHash,
      isActive: adminCredentials.isActive,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(adminCredentials)
    .leftJoin(users, eq(adminCredentials.userId, users.id))
    .where(eq(adminCredentials.username, username))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateAdminLastLogin(credId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminCredentials)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminCredentials.id, credId));
}

export async function updateAdminPassword(credId: number, newPasswordHash: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(adminCredentials)
    .set({ passwordHash: newPasswordHash })
    .where(eq(adminCredentials.id, credId));
}

// TODO: add feature queries here as your schema grows.

// ─── Email/Password Auth Helpers ─────────────────────────────────────────────

/** Find a user by email (for login) */
export async function findUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

/** Find a user by username (for login) */
export async function findUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

/** Check if an email is already registered */
export async function emailExists(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return rows.length > 0;
}

/** Check if a username is already taken */
export async function userUsernameExists(username: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  return rows.length > 0;
}

/** Create a new user with email + password (returns the new user row) */
export async function createEmailUser(data: {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const openId = 'email_' + randomBytes(16).toString('hex');
  const [result] = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    username: data.username,
    passwordHash: data.passwordHash,
    loginMethod: 'email',
    role: 'user',
    lastSignedIn: new Date(),
  });
  const insertId = (result as any).insertId as number;
  const rows = await db.select().from(users).where(eq(users.id, insertId)).limit(1);
  return rows[0];
}

// ─── Email Verification Helpers ──────────────────────────────────────────────

/** Save a verification token for a user (expires in 24 hours) */
export async function saveVerificationToken(userId: number, token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now
  await db.update(users)
    .set({ verificationToken: token, verificationTokenExpiry: expiry })
    .where(eq(users.id, userId));
}

/** Find a user by their verification token (returns null if expired or not found) */
export async function findUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
  if (!rows.length) return null;
  const user = rows[0];
  // Check expiry
  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) return null;
  return user;
}

/** Mark a user's email as verified and clear the token */
export async function markEmailVerified(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users)
    .set({ emailVerified: 1, verificationToken: null, verificationTokenExpiry: null })
    .where(eq(users.id, userId));
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────

/** Fetch all data needed for the user dashboard in one call */
export async function getDashboardOverview(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [userTokens, activeStakes, recentTrades, recentContributions, tokenCountRows, stakeCountRows, tradeCountRows] = await Promise.all([
    db.select().from(tokens).where(eq(tokens.creatorId, userId)).orderBy(desc(tokens.createdAt)).limit(5),
    db.select().from(stakes).where(eq(stakes.userId, userId)).orderBy(desc(stakes.stakedAt)).limit(5),
    db.select().from(botTrades).where(eq(botTrades.userId, userId)).orderBy(desc(botTrades.createdAt)).limit(5),
    db.select().from(contributions).where(eq(contributions.userId, userId)).orderBy(desc(contributions.createdAt)).limit(5),
    db.select({ count: count() }).from(tokens).where(eq(tokens.creatorId, userId)),
    db.select({ count: count() }).from(stakes).where(eq(stakes.userId, userId)),
    db.select({ count: count() }).from(botTrades).where(eq(botTrades.userId, userId)),
  ]);

  return {
    tokens: userTokens,
    stakes: activeStakes,
    trades: recentTrades,
    contributions: recentContributions,
    stats: {
      tokenCount: tokenCountRows[0]?.count ?? 0,
      stakeCount: stakeCountRows[0]?.count ?? 0,
      tradeCount: tradeCountRows[0]?.count ?? 0,
    },
  };
}

// ─── Deposit Wallet Helpers (admin-managed public addresses) ───────────────

export async function listDepositWallets() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.select().from(depositWallets).orderBy(desc(depositWallets.createdAt));
}

/** Public-safe view: only active wallets, grouped so callers can find "the" current address per network. */
export async function listActiveDepositWallets() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db
    .select({
      id: depositWallets.id,
      label: depositWallets.label,
      network: depositWallets.network,
      address: depositWallets.address,
    })
    .from(depositWallets)
    .where(eq(depositWallets.isActive, 1))
    .orderBy(depositWallets.network);
}

export async function createDepositWallet(data: {
  label: string;
  network: string;
  address: string;
  notes?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [result] = await db.insert(depositWallets).values({
    label: data.label,
    network: data.network,
    address: data.address,
    notes: data.notes,
    createdBy: data.createdBy,
  });
  return (result as any).insertId as number;
}

export async function updateDepositWallet(id: number, data: Partial<{
  label: string;
  network: string;
  address: string;
  notes: string | null;
  isActive: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(depositWallets).set(data).where(eq(depositWallets.id, id));
}

export async function deleteDepositWallet(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(depositWallets).where(eq(depositWallets.id, id));
}
