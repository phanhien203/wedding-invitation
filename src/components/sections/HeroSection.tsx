import Image from "next/image";
import { motion } from "framer-motion";
import ScrollIndicator from "@/components/common/ScrollIndicator";
import { formatDate } from "@/utils/date";

interface HeroSectionProps {
  brideName: string;
  groomName: string;
  weddingDate: string;
  coverImage: string;
  inviteeName?: string | null;
}

export default function HeroSection({
  brideName,
  groomName,
  weddingDate,
  coverImage,
  inviteeName,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-start justify-center overflow-hidden pt-[16vh] sm:pt-[18vh]">
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
        <p className="mb-5 text-base uppercase tracking-[0.35em] text-white/85 sm:text-xl">
          Save the date
        </p>
        <h1 className="flex flex-col items-center font-script text-6xl font-semibold leading-tight drop-shadow-lg sm:flex-row sm:items-baseline sm:justify-center sm:text-8xl md:text-9xl">
          <span>{brideName}</span>
          <span className="font-normal text-gold sm:mx-3">&amp;</span>
          <span>{groomName}</span>
        </h1>
        <p className="mt-6 text-2xl tracking-wide text-white/90 sm:text-3xl md:text-4xl">
          {formatDate(weddingDate, "DD · MM · YYYY")}
        </p>

        {inviteeName && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto mt-10 inline-flex flex-col items-center rounded-2xl bg-black/30 px-8 py-5 backdrop-blur-sm"
          >
            <p className="text-lg uppercase tracking-[0.4em] text-gold sm:text-xl">
              Thân mời
            </p>
            <p className="mt-3 font-script text-4xl font-semibold leading-tight text-white drop-shadow sm:text-6xl">
              {inviteeName}
            </p>
          </motion.div>
        )}
      </motion.div>
      <ScrollIndicator />
    </section>
  );
}
