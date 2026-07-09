import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readRsvps, writeRsvps } from "@/lib/data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID required" });
  }

  const rsvps = await readRsvps();
  const filtered = rsvps.filter((r) => r.id !== id);

  if (filtered.length === rsvps.length) {
    return res.status(404).json({ error: "Not found" });
  }

  await writeRsvps(filtered);
  return res.status(200).json({ success: true });
}
