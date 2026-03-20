import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  const setCookieValues: string[] = [];
  return {
    user: null,
    isAdminSession: false,
    req: {
      cookies: {},
      headers: {},
    } as unknown as TrpcContext["req"],
    res: {
      setHeader: (_name: string, value: string) => {
        setCookieValues.push(value);
      },
    } as unknown as TrpcContext["res"],
  };
}

describe("adminAuth procedures", () => {
  it("should reject login with wrong credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.login({ username: "nonexistent_user_xyz", password: "wrongpassword" })
    ).rejects.toThrow();
  });

  it("should return null for adminAuth.me when no session cookie is set", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.me();
    expect(result).toBeNull();
  });

  it("should return admin session data when valid admin_session cookie is present", async () => {
    const sessionData = JSON.stringify({ adminId: 1, userId: 1, role: "admin", name: "Test Admin" });
    const encoded = Buffer.from(sessionData).toString("base64");

    const ctx: TrpcContext = {
      user: null,
    isAdminSession: false,
      req: {
        cookies: { admin_session: encoded },
        headers: {},
      } as unknown as TrpcContext["req"],
      res: {
        setHeader: () => {},
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.me();

    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
    expect(result?.name).toBe("Test Admin");
    expect(result?.adminId).toBe(1);
  });

  it("should clear admin_session cookie on logout", async () => {
    const setCookieValues: string[] = [];
    const ctx: TrpcContext = {
      user: null,
    isAdminSession: false,
      req: {
        cookies: { admin_session: "some_session" },
        headers: {},
      } as unknown as TrpcContext["req"],
      res: {
        setHeader: (_name: string, value: string) => {
          setCookieValues.push(value);
        },
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.logout();

    expect(result.success).toBe(true);
    // Verify a Set-Cookie header was set (to clear the cookie)
    expect(setCookieValues.length).toBeGreaterThan(0);
    const cookieHeader = setCookieValues[0];
    expect(cookieHeader).toContain("admin_session");
    expect(cookieHeader).toContain("Max-Age=0");
  });
});
