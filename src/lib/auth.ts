import crypto from "crypto";
import type { NextApiRequest } from "next";
import { ADMIN_COOKIE } from "@/constants";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-secret";
}

export function createSessionToken(): string {
  return crypto.createHmac("sha256", getSecret()).update("admin").digest("hex");
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";
  return password === adminPassword;
}

export function isAdminRequest(req: NextApiRequest): boolean {
  const token = req.cookies[ADMIN_COOKIE];
  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
