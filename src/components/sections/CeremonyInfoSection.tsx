import { useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { getSolarLunar } from "@/utils/lunar";
import { resolveSide } from "@/utils/side";
import type { EventInfo, Parents, Person, WeddingSide } from "@/types";

// useLayoutEffect trên server sẽ cảnh báo; dùng useEffect khi SSR.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface CeremonyInfoSectionProps {
  parents?: Parents;
  groom: Person;
  bride: Person;
  events: EventInfo[];
  /** Lấy lễ của nhà mời khách; mặc định là nhà trai. */
  side?: WeddingSide | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Nơi và lúc cử hành lễ, dựng theo đúng lễ mà khách được mời. */
function CeremonyDetail({ event }: { event: EventInfo }) {
  const sl = getSolarLunar(event.date);

  return (
    <div className="mt-12">
      <p className="text-sm uppercase tracking-[0.25em] text-ink/60">
        {event.title} được cử hành tại
      </p>
      {event.address && (
        <p className="mt-2 font-serif text-2xl font-semibold uppercase tracking-wide text-sage-700 lining-nums">
          {event.address}
        </p>
      )}
      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-ink/50">
        Vào lúc {event.time}
      </p>

      {sl && (
        <>
          <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-4">
            <span className="text-xs uppercase tracking-widest text-ink/60">
              {sl.weekday}
            </span>
            <span className="h-7 w-px bg-gold/40" />
            <span className="font-display text-3xl font-semibold text-sage-700">
              {pad(sl.day)}
            </span>
            <span className="h-7 w-px bg-gold/40" />
            <span className="text-xs uppercase tracking-widest text-ink/60">
              Tháng {pad(sl.month)}
            </span>
          </div>
          <p className="mt-2 font-display text-lg text-sage-700">{sl.year}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink/50">
            (Nhằm ngày {sl.lunarText})
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Hiển thị tên ba mẹ 2 nhà. Mỗi tên nằm gọn 1 hàng; nếu tràn thì tự thu nhỏ
 * font, và CẢ 4 tên (bố/mẹ hai nhà) dùng chung một cỡ chữ = cỡ nhỏ nhất vừa đủ.
 */
function ParentsGrid({ parents }: { parents: Parents }) {
  const nameRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const blocks = [parents.groom, parents.bride];
  const names = [
    parents.groom.father,
    parents.groom.mother,
    parents.bride.father,
    parents.bride.mother,
  ];

  useIsoLayoutEffect(() => {
    const BASE = 18; // px (cỡ gốc ~ text-lg)
    const MIN = 10; // px (không nhỏ hơn để còn đọc được)
    const els = nameRefs.current.filter(Boolean) as HTMLParagraphElement[];
    if (!els.length) return;

    const fit = () => {
      // Đo ở cỡ gốc để lấy chiều rộng tự nhiên của từng tên.
      els.forEach((el) => (el.style.fontSize = `${BASE}px`));
      let scale = 1;
      els.forEach((el) => {
        const avail = el.clientWidth;
        const natural = el.scrollWidth;
        if (avail > 0 && natural > avail) {
          scale = Math.min(scale, avail / natural);
        }
      });
      // Cùng một cỡ chữ cho tất cả 4 tên = cỡ nhỏ nhất vừa đủ.
      const finalSize = Math.max(MIN, BASE * scale);
      els.forEach((el) => (el.style.fontSize = `${finalSize}px`));
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // Đo lại khi tên thay đổi.
  }, [names.join("|")]);

  return (
    <div className="mb-10 grid grid-cols-2 gap-4 sm:gap-8">
      {blocks.map((info, bi) => (
        <div key={bi} className="min-w-0 text-center">
          <p className="mb-2 text-xs text-ink/60 sm:text-sm">Ông Bà</p>
          <p
            ref={(el) => {
              nameRefs.current[bi * 2] = el;
            }}
            className="overflow-hidden whitespace-nowrap font-semibold leading-snug text-sage-700"
          >
            {info.father}
          </p>
          <p
            ref={(el) => {
              nameRefs.current[bi * 2 + 1] = el;
            }}
            className="overflow-hidden whitespace-nowrap font-semibold leading-snug text-sage-700"
          >
            {info.mother}
          </p>
          {info.address && (
            <p className="mt-1 text-[11px] text-ink/50 sm:text-xs">
              {info.address}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Tên chú rể & cô dâu: mỗi tên luôn nằm 1 hàng ở mọi độ phân giải (không xuống
 * dòng, tự thu nhỏ vừa khít), và CẢ HAI tên dùng chung một cỡ chữ = cỡ nhỏ nhất.
 */
function CeremonyNames({ groom, bride }: { groom: Person; bride: Person }) {
  const nameRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useIsoLayoutEffect(() => {
    const els = nameRefs.current.filter(Boolean) as HTMLHeadingElement[];
    if (!els.length) return;

    const fit = () => {
      // Bỏ cỡ đã ép để đo lại theo cỡ gốc (responsive từ class Tailwind).
      els.forEach((el) => (el.style.fontSize = ""));
      let base = 0;
      let scale = 1;
      els.forEach((el) => {
        base = parseFloat(getComputedStyle(el).fontSize); // 2 tên cùng class → cùng base
        const avail = el.clientWidth;
        const natural = el.scrollWidth;
        if (avail > 0 && natural > avail) {
          scale = Math.min(scale, avail / natural);
        }
      });
      if (scale < 1) {
        const size = base * scale;
        els.forEach((el) => (el.style.fontSize = `${size}px`));
      }
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [groom.name, bride.name]);

  const nameClass =
    "overflow-hidden whitespace-nowrap font-calligraphy text-4xl leading-tight tracking-wider text-sage-700 sm:text-5xl";
  const roleClass = "mt-1 text-xs uppercase tracking-[0.3em] text-gold";

  return (
    <>
      <h3
        ref={(el) => {
          nameRefs.current[0] = el;
        }}
        className={nameClass}
      >
        {groom.name}
      </h3>
      {groom.role && <p className={roleClass}>{groom.role}</p>}

      <p className="my-3 font-script text-3xl text-gold">&amp;</p>

      <h3
        ref={(el) => {
          nameRefs.current[1] = el;
        }}
        className={nameClass}
      >
        {bride.name}
      </h3>
      {bride.role && <p className={roleClass}>{bride.role}</p>}
    </>
  );
}

export default function CeremonyInfoSection({
  parents,
  groom,
  bride,
  events,
  side,
}: CeremonyInfoSectionProps) {
  // Lễ của nhà mời khách; nếu không có thì lấy lễ chung (không gắn nhà).
  const target = resolveSide(side);
  const event =
    events.find((e) => e.side === target) ?? events.find((e) => !e.side);

  return (
    <Section title="Thông tin lễ cưới" subtitle="Wedding">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-xl text-center"
      >
        {parents && <ParentsGrid parents={parents} />}

        <p className="text-sm uppercase tracking-[0.25em] text-ink/60">
          Trân trọng báo tin
        </p>
        <p className="mb-6 text-sm uppercase tracking-[0.25em] text-ink/60">
          Lễ thành hôn của con chúng tôi
        </p>

        <CeremonyNames groom={groom} bride={bride} />

        {event && <CeremonyDetail event={event} />}
      </motion.div>
    </Section>
  );
}
