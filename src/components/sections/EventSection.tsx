import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Countdown from "@/components/common/Countdown";
import Section from "@/components/ui/Section";
import { getSolarLunar } from "@/utils/lunar";
import { resolveSide } from "@/utils/side";
import type { EventInfo, WeddingSide } from "@/types";

interface EventSectionProps {
  events: EventInfo[];
  /** Chỉ hiện sự kiện của nhà mời khách; mặc định là nhà trai. */
  side?: WeddingSide | null;
  /** Ngày để đếm ngược, đã chọn theo nhà của khách. */
  weddingDate: string;
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
        Tháng {month} Năm {year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-ink/40">
        {WEEK_HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((c, i) =>
          c === day ? (
            <span
              key={i}
              className="relative mx-auto flex h-9 w-9 items-center justify-center"
            >
              <Heart
                aria-hidden
                fill="currentColor"
                strokeWidth={0}
                className="absolute inset-0 h-full w-full text-sage-700"
              />
              {/* Nhích lên cho khớp phần thân trái tim. */}
              <span className="relative -mt-0.5 text-[13px] font-semibold text-cream">
                {c}
              </span>
            </span>
          ) : (
            <span key={i} className="py-1.5 text-ink/70">
              {c ?? ""}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function EventBlock({
  event,
  countdownDate,
}: {
  event: EventInfo;
  /** Chỉ sự kiện chính mới kèm đếm ngược. */
  countdownDate?: string;
}) {
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
        Bữa tiệc sẽ diễn ra vào lúc
      </p>
      <p className="mt-2 font-display text-4xl font-semibold text-sage-700">
        {event.partyTime || event.time}
      </p>
      {(event.partyAddress || event.address) && (
        <p className="mt-3 font-serif text-xl font-semibold uppercase tracking-wide text-sage-700 lining-nums">
          {event.partyAddress || event.address}
        </p>
      )}

      {sl && (
        <>
          <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-4">
            <span className="text-sm uppercase tracking-widest text-ink/60">
              {sl.weekday}
            </span>
            <span className="h-8 w-px bg-gold/40" />
            <span className="font-display text-4xl font-semibold text-sage-700">
              {pad(sl.day)}
            </span>
            <span className="h-8 w-px bg-gold/40" />
            <span className="text-sm uppercase tracking-widest text-ink/60">
              Tháng {pad(sl.month)}
            </span>
          </div>
          <p className="mt-3 font-display text-xl text-sage-700">{sl.year}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/50">
            (Nhằm ngày {sl.lunarText})
          </p>
          {countdownDate && (
            <Countdown
              weddingDate={countdownDate}
              className="mx-auto mt-8 max-w-md"
            />
          )}

          <div className="mt-8">
            <Calendar year={sl.year} month={sl.month} day={sl.day} />
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function EventSection({
  events,
  side,
  weddingDate,
}: EventSectionProps) {
  // Sự kiện không gắn nhà là sự kiện chung → hiện cho mọi khách.
  const target = resolveSide(side);
  const shown = events.filter((e) => !e.side || e.side === target);

  if (!shown.length) return null;

  return (
    <Section title="Thông tin bữa tiệc" subtitle="Save the date">
      <div className="mx-auto flex max-w-xl flex-col gap-14">
        {shown.map((event, index) => (
          <EventBlock
            key={event.title}
            event={event}
            countdownDate={index === 0 ? weddingDate : undefined}
          />
        ))}
      </div>
    </Section>
  );
}
