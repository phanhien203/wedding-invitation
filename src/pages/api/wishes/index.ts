import type { NextApiRequest, NextApiResponse } from "next";
import { readWishes, writeWishes } from "@/lib/data";
import { createId } from "@/utils/id";
import type { Wish } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const wishes = await readWishes();
    return res.status(200).json(wishes);
  }

  if (req.method === "POST") {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required" });
    }

    const wish: Wish = {
      id: createId(),
      name: String(name).trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    };

    const wishes = await readWishes();
    wishes.unshift(wish);
    await writeWishes(wishes);

    return res.status(201).json(wish);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
