import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readWishes, writeWishes } from "@/lib/data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID required" });
  }

  const wishes = await readWishes();

  if (req.method === "PATCH") {
    const index = wishes.findIndex((w) => w.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Not found" });
    }
    const { hidden } = req.body ?? {};
    wishes[index] = { ...wishes[index], hidden: Boolean(hidden) };
    await writeWishes(wishes);
    return res.status(200).json(wishes[index]);
  }

  // DELETE
  const filtered = wishes.filter((w) => w.id !== id);
  if (filtered.length === wishes.length) {
    return res.status(404).json({ error: "Not found" });
  }
  await writeWishes(filtered);
  return res.status(200).json({ success: true });
}
