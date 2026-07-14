import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownSectionProps {
  weddingDate: string;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white px-1 py-3 shadow-sm sm:aspect-auto sm:px-6 sm:py-6">
      <span className="text-2xl font-semibold text-sage-700 sm:text-5xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-ink/50 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function CountdownSection({ weddingDate }: CountdownSectionProps) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(weddingDate);

  return (
    <Section title="Đếm ngược" subtitle="Countdown" className="bg-sage-100/40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl text-center"
      >
        {isPast ? (
          <p className="text-lg text-ink/70">Ngày trọng đại đã đến!</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <TimeBlock value={days} label="Ngày" />
            <TimeBlock value={hours} label="Giờ" />
            <TimeBlock value={minutes} label="Phút" />
            <TimeBlock value={seconds} label="Giây" />
          </div>
        )}
      </motion.div>
    </Section>
  );
}
