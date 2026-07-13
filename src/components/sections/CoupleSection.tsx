import Image from "next/image";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { Person } from "@/types";

interface CoupleSectionProps {
  bride: Person;
  groom: Person;
  brideName: string;
  groomName: string;
}

function TiltPhoto({
  src,
  alt,
  rotate,
}: {
  src: string;
  alt: string;
  rotate: number;
}) {
  return (
    <div className="shrink-0" style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="relative h-56 w-44 overflow-hidden rounded-sm border-[6px] border-white shadow-xl ring-1 ring-gold/30 sm:h-72 sm:w-56">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 176px, 224px"
        />
      </div>
    </div>
  );
}

export default function CoupleSection({
  bride,
  groom,
  brideName,
  groomName,
}: CoupleSectionProps) {
  return (
    <Section title="Cô dâu & Chú rể" subtitle="About us">
      <div className="relative mx-auto max-w-2xl">
        {/* Chú rể */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center justify-center gap-6 sm:gap-10"
        >
          <TiltPhoto src={groom.photo} alt={groom.name} rotate={-5} />
          <div className="max-w-[45%] text-left">
            <p className="mb-1 text-xs uppercase tracking-[0.3em] text-gold">
              {groom.role ?? "Chú rể"}
            </p>
            <h3 className="font-script text-4xl leading-tight text-sage-700 sm:text-5xl">
              {groomName}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">
              {groom.intro}
            </p>
          </div>
        </motion.div>

        {/* Cô dâu */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 -mt-6 flex flex-row-reverse items-center justify-center gap-6 sm:-mt-10 sm:gap-10"
        >
          <TiltPhoto src={bride.photo} alt={bride.name} rotate={5} />
          <div className="max-w-[45%] text-right">
            <p className="mb-1 text-xs uppercase tracking-[0.3em] text-gold">
              {bride.role ?? "Cô dâu"}
            </p>
            <h3 className="font-script text-4xl leading-tight text-sage-700 sm:text-5xl">
              {brideName}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">
              {bride.intro}
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
