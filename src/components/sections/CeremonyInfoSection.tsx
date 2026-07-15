import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { getSolarLunar } from "@/utils/lunar";
import { resolveSide } from "@/utils/side";
import type { EventInfo, Parents, Person, WeddingSide } from "@/types";

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
        <p className="mt-2 font-serif text-2xl font-semibold uppercase tracking-wide text-sage-700">
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
            <span className="font-serif text-3xl font-semibold text-sage-700">
              {pad(sl.day)}
            </span>
            <span className="h-7 w-px bg-gold/40" />
            <span className="text-xs uppercase tracking-widest text-ink/60">
              Tháng {pad(sl.month)}
            </span>
          </div>
          <p className="mt-2 font-serif text-lg text-sage-700">{sl.year}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink/50">
            (Tức ngày {sl.lunarText})
          </p>
        </>
      )}
    </div>
  );
}

function ParentBlock({
  father,
  mother,
  address,
}: {
  father: string;
  mother: string;
  address: string;
}) {
  return (
    <div className="text-center">
      <p className="mb-2 text-xs text-ink/60 sm:text-sm">Ông Bà</p>
      <p className="text-base font-semibold text-sage-700 sm:text-lg">
        {father}
      </p>
      <p className="text-base font-semibold text-sage-700 sm:text-lg">
        {mother}
      </p>
      {address && (
        <p className="mt-1 text-[11px] text-ink/50 sm:text-xs">{address}</p>
      )}
    </div>
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
        {parents && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:gap-8">
            <ParentBlock {...parents.groom} />
            <ParentBlock {...parents.bride} />
          </div>
        )}

        <p className="text-sm uppercase tracking-[0.25em] text-ink/60">
          Trân trọng báo tin
        </p>
        <p className="mb-6 text-sm uppercase tracking-[0.25em] text-ink/60">
          Lễ thành hôn của con chúng tôi
        </p>

        <h3 className="font-serif text-3xl font-semibold text-sage-700 sm:text-4xl">
          {groom.name}
        </h3>
        {groom.role && (
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-gold">
            {groom.role}
          </p>
        )}

        <p className="my-3 font-script text-3xl text-gold">&amp;</p>

        <h3 className="font-serif text-3xl font-semibold text-sage-700 sm:text-4xl">
          {bride.name}
        </h3>
        {bride.role && (
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-gold">
            {bride.role}
          </p>
        )}

        {event && <CeremonyDetail event={event} />}
      </motion.div>
    </Section>
  );
}
