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
        className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm sm:p-8"
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
          <p>
            <span className="text-ink/50">Số tài khoản:</span>{" "}
            <span className="font-medium">{gift.accountNumber}</span>
          </p>
          {/* Nút xuống hàng riêng: nhét chung hàng với nhãn + số thì trên mobile
              cả nhãn lẫn chữ trong nút đều bị bẻ đôi. */}
          <div className="pt-2">
            <CopyButton text={gift.accountNumber} />
          </div>
        </div>

        <p className="max-w-sm border-t border-sage-100 pt-5 text-center text-sm italic leading-relaxed text-ink/60">
          Mọi người hãy nhớ ghi rõ tên để vợ chồng mình dễ dàng phân biệt được sự
          yêu thương này đến từ ai nhé
        </p>
      </motion.div>
    </Section>
  );
}
