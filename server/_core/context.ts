import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getUserById } from "../db";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  isAdminSession: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let isAdminSession = false;

  // Try regular OAuth/email session FIRST — this is the primary user session
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // If no regular user session, check admin_session cookie as fallback
  // The admin panel uses its own session separate from the regular user session
  if (!user) {
    try {
      const cookies = parseCookieHeader(opts.req.headers.cookie || '');
      const raw = cookies['admin_session'];
      if (raw) {
        const data = JSON.parse(Buffer.from(raw, 'base64').toString()) as { adminId: number; userId: number; role: string; name: string };
        if (data?.userId) {
          const adminUser = await getUserById(data.userId);
          if (adminUser) {
            user = adminUser;
            isAdminSession = true;
          }
        }
      }
    } catch {
      // Invalid admin session cookie — ignore
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    isAdminSession,
  };
}
