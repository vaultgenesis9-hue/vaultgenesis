import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getUserById } from "../db";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Check admin_session cookie FIRST — it takes priority over OAuth session
  // This allows admins to access admin procedures even when also logged in as a regular user
  try {
    const cookies = parseCookieHeader(opts.req.headers.cookie || '');
    const raw = cookies['admin_session'];
    if (raw) {
      const data = JSON.parse(Buffer.from(raw, 'base64').toString()) as { adminId: number; userId: number; role: string; name: string };
      if (data?.userId) {
        const adminUser = await getUserById(data.userId);
        if (adminUser) {
          user = adminUser;
        }
      }
    }
  } catch {
    // Invalid admin session cookie — ignore
  }

  // Fall back to OAuth/email session if no admin session
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
