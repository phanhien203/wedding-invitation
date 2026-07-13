import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { getSolarLunar } from "@/utils/lunar";
import type { EventInfo, WeddingSide } from "@/types";

interface EventSectionProps {
  events: EventInfo[];
  side?: WeddingSide | null;
}

const WEEK_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const pad = (n: number) => String(n).padStart(2, "0");

function Calendar({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=CN
  const startCol = (firstDow + 6) % 7; // đưa về tuần bắt đầu Thứ 2
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mx-auto max-w-xs rounded-2xl border border-sage-100 bg-white/70 p-4 shadow-sm">
      <p className="mb-3 text-center text-sm font-medium text-sage-700">
        Tháng {month} / {year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-ink/40">
        {WEEK_HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((c, i) => (
          <span
            key={i}
            className={
              c === day
                ? "mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sage-700 font-semibold text-cream"
                : "py-1.5 text-ink/70"
            }
          >
            {c ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function EventBlock({ event }: { event: EventInfo }) {
  const sl = getSolarLunar(event.date);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-sm uppercase tracking-[0.25em] text-ink/60">
        {event.title} sẽ diễn ra vào lúc
      </p>
      <p className="mt-2 font-serif text-4xl font-semibold text-sage-700">
        {event.time}
      </p>

      {sl && (
        <>
          <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-4">
            <span className="text-sm uppercase tracking-widest text-ink/60">
              {sl.weekday}
            </span>
            <span className="h-8 w-px bg-gold/40" />
            <span className="font-serif text-4xl font-semibold text-sage-700">
              {pad(sl.day)}
            </span>
            <span className="h-8 w-px bg-gold/40" />
            <span className="text-sm uppercase tracking-widest text-ink/60">
              Tháng {pad(sl.month)}
            </span>
          </div>
          <p className="mt-3 font-serif text-xl text-sage-700">{sl.year}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/50">
            (Tức ngày {sl.lunarText})
          </p>
          <div className="mt-8">
            <Calendar year={sl.year} month={sl.month} day={sl.day} />
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function EventSection({ events, side }: EventSectionProps) {
  const shown = side
    ? events.filter((e) => !e.side || e.side === side)
    : events;

  if (!shown.length) return null;

  return (
    <Section title="Thông tin sự kiện" subtitle="Save the date">
      <div className="mx-auto flex max-w-xl flex-col gap-14">
        {shown.map((event) => (
          <EventBlock key={event.title} event={event} />
        ))}
      </div>
    </Section>
  );
}
