import Image from "next/image";
import { motion } from "framer-motion";
import ScrollIndicator from "@/components/common/ScrollIndicator";
import { formatDate } from "@/utils/date";

interface HeroSectionProps {
  brideName: string;
  groomName: string;
  weddingDate: string;
  coverImage: string;
}

export default function HeroSection({
  brideName,
  groomName,
  weddingDate,
  coverImage,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src={coverImage}
        alt="Wedding cover"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 px-6 text-center text-white"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-white/80">
          Save the date
        </p>
        <h1 className="text-4xl font-semibold sm:text-6xl md:text-7xl">
          {brideName}
          <span className="mx-3 font-light text-gold">&amp;</span>
          {groomName}
        </h1>
        <p className="mt-6 text-lg tracking-wide text-white/90 sm:text-xl">
          {formatDate(weddingDate, "DD · MM · YYYY")}
        </p>
      </motion.div>
      <ScrollIndicator />
    </section>
  );
}
