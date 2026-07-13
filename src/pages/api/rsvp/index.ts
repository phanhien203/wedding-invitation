import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { readGuests, readRsvps, writeRsvps } from "@/lib/data";
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
    const { slug, attendance, guests, message } = req.body ?? {};

    if (!slug || (attendance !== "yes" && attendance !== "no")) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Chỉ khách trong danh sách mời (link hợp lệ) mới được xác nhận.
    const guest = (await readGuests()).find((g) => g.slug === slug);
    if (!guest) {
      return res.status(403).json({ error: "Invalid invitation" });
    }

    const rsvps = await readRsvps();
    const now = new Date().toISOString();
    const numGuests =
      attendance === "yes"
        ? Math.max(1, Math.min(20, Number(guests) || 1))
        : 0;
    const cleanMessage = String(message ?? "").trim();

    // Upsert theo guestSlug — mỗi khách chỉ 1 record, quay lại thì cập nhật.
    const existing = rsvps.find((r) => r.guestSlug === slug);
    if (existing) {
      existing.guestName = guest.name;
      existing.attendance = attendance;
      existing.guests = numGuests;
      existing.message = cleanMessage;
      existing.updatedAt = now;
      await writeRsvps(rsvps);
      return res.status(200).json(existing);
    }

    const rsvp: Rsvp = {
      id: createId(),
      guestSlug: slug,
      guestName: guest.name,
      attendance,
      guests: numGuests,
      message: cleanMessage,
      createdAt: now,
      updatedAt: now,
    };
    rsvps.unshift(rsvp);
    await writeRsvps(rsvps);

    return res.status(201).json(rsvp);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
