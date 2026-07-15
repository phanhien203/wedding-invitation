import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownProps {
  weddingDate: string;
  className?: string;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white px-1 py-3 shadow-sm sm:aspect-auto sm:px-6 sm:py-6">
      <span className="text-2xl font-semibold text-sage-700 sm:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-ink/50 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ weddingDate, className }: CountdownProps) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(weddingDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={className}
    >
      {isPast ? (
        <p className="text-lg text-ink/70">Ngày trọng đại đã đến!</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <TimeBlock value={days} label="Ngày" />
          <TimeBlock value={hours} label="Giờ" />
          <TimeBlock value={minutes} label="Phút" />
          <TimeBlock value={seconds} label="Giây" />
        </div>
      )}
    </motion.div>
  );
}
