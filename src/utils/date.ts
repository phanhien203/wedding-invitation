import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { EventInfo, WeddingSide } from "@/types";
import { resolveSide } from "@/utils/side";

dayjs.extend(duration);
dayjs.extend(customParseFormat);

export function formatDate(date: string, format = "DD/MM/YYYY"): string {
  return dayjs(date).format(format);
}

function parseEventDate(value: string) {
  const d = dayjs(value, ["DD/MM/YYYY", "D/M/YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d : null;
}

/**
 * Ngày hiển thị theo nhà của khách: khách nhà gái → sự kiện nhà gái;
 * khách nhà trai hoặc bạn của cả hai nhà (không rõ) → sự kiện nhà trai.
 * Trả về chuỗi YYYY-MM-DD; nếu không tìm được thì dùng fallbackIso.
 */
export function resolveSideDate(
  events: EventInfo[],
  side: WeddingSide | null | undefined,
  fallbackIso: string
): string {
  const event = events.find((e) => e.side === resolveSide(side));
  const parsed = event?.date ? parseEventDate(event.date) : null;
  return parsed ? parsed.format("YYYY-MM-DD") : fallbackIso;
}

export function getCountdown(targetDate: string) {
  const now = dayjs();
  const target = dayjs(targetDate);
  const diff = target.diff(now);

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const d = dayjs.duration(diff);
  return {
    days: Math.floor(d.asDays()),
    hours: d.hours(),
    minutes: d.minutes(),
    seconds: d.seconds(),
    isPast: false,
  };
}
