import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readRsvps, writeRsvps } from "@/lib/data";
import { createId } from "@/utils/id";
import type { Rsvp } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    if (!isAdminRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const rsvps = await readRsvps();
    return res.status(200).json(rsvps);
  }

  if (req.method === "POST") {
    const { name, phone, guests, attendance, message } = req.body;

    if (!name || !phone || !attendance) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const rsvp: Rsvp = {
      id: createId(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      guests: Number(guests) || 1,
      attendance,
      message: String(message ?? "").trim(),
      createdAt: new Date().toISOString(),
    };

    const rsvps = await readRsvps();
    rsvps.unshift(rsvp);
    await writeRsvps(rsvps);

    return res.status(201).json(rsvp);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
