import Image from "next/image";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { TimelineItem } from "@/types";

interface LoveStorySectionProps {
  timeline: TimelineItem[];
}

export default function LoveStorySection({ timeline }: LoveStorySectionProps) {
  return (
    <Section title="Câu chuyện tình yêu" subtitle="Our story" className="bg-blush-50/50">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        {timeline.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex gap-5"
          >
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-400 text-xs font-medium text-white">
                {item.date}
              </span>
              {index < timeline.length - 1 && (
                <div className="mt-2 w-px flex-1 bg-blush-200" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="relative mb-4 h-40 overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
