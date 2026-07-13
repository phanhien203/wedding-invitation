import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import type { Parents, Person } from "@/types";

interface CeremonyInfoSectionProps {
  parents?: Parents;
  groom: Person;
  bride: Person;
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
      <p className="font-serif text-base font-semibold text-sage-700 sm:text-lg">
        {father}
      </p>
      <p className="font-serif text-base font-semibold text-sage-700 sm:text-lg">
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
}: CeremonyInfoSectionProps) {
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
      </motion.div>
    </Section>
  );
}
