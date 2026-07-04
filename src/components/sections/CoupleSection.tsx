import Image from "next/image";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { Person } from "@/types";

interface CoupleSectionProps {
  bride: Person;
  groom: Person;
}

function PersonCard({ person, label }: { person: Person; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-6 h-48 w-48 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-56 sm:w-56">
        <Image
          src={person.photo}
          alt={person.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 192px, 224px"
        />
      </div>
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gold">
        {label}
      </p>
      <h3 className="mb-3 text-2xl font-semibold">{person.name}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-ink/60">
        {person.intro}
      </p>
    </motion.div>
  );
}

export default function CoupleSection({ bride, groom }: CoupleSectionProps) {
  return (
    <Section title="Cô dâu & Chú rể" subtitle="About us">
      <div className="grid gap-12 sm:grid-cols-2 sm:gap-8">
        <PersonCard person={bride} label="Cô dâu" />
        <PersonCard person={groom} label="Chú rể" />
      </div>
    </Section>
  );
}
