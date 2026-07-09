import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { isAdminRequest } from "@/lib/auth";
import { getUploadPath } from "@/lib/upload";

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

  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "Filename required" });
  }

  if (filename.includes("..") || filename.includes("/")) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  try {
    await fs.unlink(getUploadPath(filename));
    return res.status(200).json({ success: true });
  } catch {
    return res.status(404).json({ error: "File not found" });
  }
}
