import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownSectionProps {
  weddingDate: string;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
      <span className="text-3xl font-semibold text-blush-500 sm:text-5xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wider text-ink/50">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
