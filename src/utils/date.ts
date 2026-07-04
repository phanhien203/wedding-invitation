import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function formatDate(date: string, format = "DD/MM/YYYY"): string {
  return dayjs(date).format(format);
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
