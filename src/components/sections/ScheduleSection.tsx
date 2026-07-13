import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { ScheduleItem } from "@/types";

interface ScheduleSectionProps {
  schedule: ScheduleItem[];
}

export default function ScheduleSection({ schedule }: ScheduleSectionProps) {
  if (!schedule.length) return null;

  return (
    <Section title="Lịch trình ngày cưới" subtitle="Timeline">
      <div className="mx-auto max-w-md">
        {schedule.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="flex items-stretch gap-5"
          >
            <span className="w-16 shrink-0 pt-0.5 text-right font-serif text-lg text-ink/70">
              {item.time}
            </span>
            <div className="flex flex-col items-center">
              <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-sage-700" />
              {index < schedule.length - 1 && (
                <span className="my-1 w-px flex-1 bg-sage-300" />
              )}
            </div>
            <span className="flex-1 pb-8 text-ink/80">{item.activity}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
