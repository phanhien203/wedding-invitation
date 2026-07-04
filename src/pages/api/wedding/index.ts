import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readWeddingConfig, writeWeddingConfig } from "@/lib/data";
import type { WeddingConfig } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const config = await readWeddingConfig();
    return res.status(200).json(config);
  }

  if (req.method === "PUT") {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const config = req.body as WeddingConfig;
    await writeWeddingConfig(config);
    return res.status(200).json(config);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export const config = {
  api: { bodyParser: { sizeLimit: "2mb" } },
};
