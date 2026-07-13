import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readGuests, writeGuests } from "@/lib/data";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "ID required" });
  }

  const guests = await readGuests();
  const index = guests.findIndex((g) => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  if (req.method === "PUT") {
    const { name, note, side } = req.body ?? {};
    const nextSide =
      side === "groom" || side === "bride" ? side : undefined;
    guests[index] = {
      ...guests[index],
      name: name !== undefined ? String(name).trim() : guests[index].name,
      note: note !== undefined ? String(note).trim() : guests[index].note,
      side: side !== undefined ? nextSide : guests[index].side,
    };
    await writeGuests(guests);
    return res.status(200).json(guests[index]);
  }

  if (req.method === "DELETE") {
    await writeGuests(guests.filter((g) => g.id !== id));
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
