import Image from "next/image";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import CopyButton from "@/components/common/CopyButton";
import type { GiftInfo } from "@/types";

interface GiftSectionProps {
  gift: GiftInfo;
}

export default function GiftSection({ gift }: GiftSectionProps) {
  return (
    <Section title="Mừng cưới" subtitle="Gift">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-sage-100 bg-white p-8 shadow-sm"
      >
        {gift.qrImage && (
          <div className="relative h-48 w-48 overflow-hidden rounded-xl">
            <Image
              src={gift.qrImage}
              alt="QR Code"
              fill
              className="object-contain"
              sizes="192px"
            />
          </div>
        )}
        <div className="w-full space-y-2 text-center text-sm">
          <p>
            <span className="text-ink/50">Ngân hàng:</span> {gift.bankName}
          </p>
          <p>
            <span className="text-ink/50">Chủ tài khoản:</span>{" "}
            {gift.accountName}
          </p>
          <p className="flex items-center justify-center gap-2">
            <span className="text-ink/50">Số tài khoản:</span>
            <span className="font-medium">{gift.accountNumber}</span>
            <CopyButton text={gift.accountNumber} />
          </p>
        </div>
      </motion.div>
    </Section>
  );
}
