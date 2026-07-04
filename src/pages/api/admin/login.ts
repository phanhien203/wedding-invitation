import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth";
import { ADMIN_COOKIE } from "@/constants";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;
  if (!verifyAdminPassword(String(password ?? ""))) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = createSessionToken();
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${getSessionCookieOptions().maxAge}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
  );

  return res.status(200).json({ success: true });
}
