import type { NextApiRequest, NextApiResponse } from "next";
import { ADMIN_COOKIE } from "@/constants";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
  return res.status(200).json({ success: true });
}
