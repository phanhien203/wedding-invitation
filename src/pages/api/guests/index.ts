import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readGuests, writeGuests } from "@/lib/data";
import { createId } from "@/utils/id";
import { slugifyName, randomSuffix } from "@/utils/slug";
import type { Guest } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Danh sách khách là dữ liệu riêng tư — mọi thao tác đều yêu cầu admin.
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json(await readGuests());
  }

  if (req.method === "POST") {
    const { name, note, side } = req.body ?? {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const guests = await readGuests();

    let slug = `${slugifyName(String(name))}-${randomSuffix()}`;
    while (guests.some((g) => g.slug === slug)) {
      slug = `${slugifyName(String(name))}-${randomSuffix()}`;
    }

    const guest: Guest = {
      id: createId(),
      slug,
      name: String(name).trim(),
      note: note ? String(note).trim() : "",
      ...(side === "groom" || side === "bride" ? { side } : {}),
      createdAt: new Date().toISOString(),
    };

    guests.unshift(guest);
    await writeGuests(guests);

    return res.status(201).json(guest);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
