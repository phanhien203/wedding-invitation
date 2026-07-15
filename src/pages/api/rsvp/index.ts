import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/auth";
import { MAX_RSVP_NAME_LENGTH } from "@/constants";
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
    const { slug, name, attendance, guests, message } = req.body ?? {};

    if (attendance !== "yes" && attendance !== "no") {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Có slug = thiệp mời riêng, phải là khách trong danh sách. Không slug =
    // thiệp chung, khách tự khai tên.
    let guestName: string;
    if (slug) {
      const guest = (await readGuests()).find((g) => g.slug === slug);
      if (!guest) {
        return res.status(403).json({ error: "Invalid invitation" });
      }
      guestName = guest.name;
    } else {
      guestName = String(name ?? "")
        .trim()
        .slice(0, MAX_RSVP_NAME_LENGTH);
      if (!guestName) {
        return res.status(400).json({ error: "Vui lòng nhập tên của bạn" });
      }
    }

    const rsvps = await readRsvps();
    const now = new Date().toISOString();
    const numGuests =
      attendance === "yes"
        ? Math.max(1, Math.min(20, Number(guests) || 1))
        : 0;
    const cleanMessage = String(message ?? "").trim();

    // Upsert theo guestSlug — mỗi khách chỉ 1 record, quay lại thì cập nhật.
    // Thiệp chung không có slug nên không nhận diện được ai với ai: mỗi lần gửi
    // là một record mới, admin tự dọn nếu trùng.
    const existing = slug ? rsvps.find((r) => r.guestSlug === slug) : undefined;
    if (existing) {
      existing.guestName = guestName;
      existing.attendance = attendance;
      existing.guests = numGuests;
      existing.message = cleanMessage;
      existing.updatedAt = now;
      await writeRsvps(rsvps);
      return res.status(200).json(existing);
    }

    const rsvp: Rsvp = {
      id: createId(),
      ...(slug ? { guestSlug: slug } : {}),
      guestName,
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
