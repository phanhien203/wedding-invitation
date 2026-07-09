import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { EventInfo } from "@/types";

interface EventSectionProps {
  events: EventInfo[];
}

export default function EventSection({ events }: EventSectionProps) {
  return (
    <Section title="Thông tin sự kiện" subtitle="Events">
      <div className="grid gap-6 sm:grid-cols-2">
        {events.map((event, index) => (
          <motion.div
            key={event.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-sage-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-xl font-semibold text-blush-500">
              {event.title}
            </h3>
            <ul className="space-y-3 text-sm text-ink/70">
              <li className="flex items-center gap-3">
                <Calendar size={16} className="shrink-0 text-gold" />
                {event.date}
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="shrink-0 text-gold" />
                {event.time}
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                {event.address}
              </li>
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
