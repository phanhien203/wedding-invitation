import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { resolveMapUrl } from "@/lib/geocode";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const url = typeof req.query.url === "string" ? req.query.url : "";
  const coords = await resolveMapUrl(url);

  if (!coords) {
    return res.status(404).json({ error: "Không lấy được toạ độ từ link" });
  }
  return res.status(200).json(coords);
}
