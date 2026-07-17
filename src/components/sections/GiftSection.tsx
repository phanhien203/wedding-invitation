import Image from "next/image";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import DownloadButton from "@/components/common/DownloadButton";
import { cn } from "@/lib/cn";
import type { GiftAccount, GiftInfo } from "@/types";

interface GiftSectionProps {
  gift: GiftInfo;
}

const hasData = (a?: GiftAccount) =>
  !!a && !!(a.accountNumber || a.qrImage || a.bankName || a.accountName);

function GiftAccountBlock({
  account,
  label,
}: {
  account: GiftAccount;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold sm:text-xs">
        {label}
      </p>

      {account.qrImage && (
        <div className="flex flex-col items-center gap-2.5">
          <div className="relative aspect-square w-full max-w-[180px] overflow-hidden">
            <Image
              src={account.qrImage}
              alt={`QR ${label}`}
              fill
              className="object-contain"
              sizes="180px"
            />
          </div>
          <DownloadButton
            url={account.qrImage}
            filename={`qr-${account.accountNumber || label}.png`}
          />
        </div>
      )}

      <div className="w-full space-y-1.5 text-center text-[11px] sm:text-sm">
        {account.bankName && (
          <p>
            {account.bankName}
          </p>
        )}
        {account.accountName && (
          <p>
            {account.accountName}
          </p>
        )}
        {account.accountNumber && (
          <p>
            <span className="text-ink/50">STK:</span>{" "}
            <span className="font-medium">{account.accountNumber}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function GiftSection({ gift }: GiftSectionProps) {
  const accounts = [
    { label: "Nhà trai", account: gift.groom },
    { label: "Nhà gái", account: gift.bride },
  ].filter(({ account }) => hasData(account));

  if (!accounts.length) return null;

  const twoCols = accounts.length > 1;

  return (
    <Section title="Mừng cưới" subtitle="Gift">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          "mx-auto flex flex-col items-center gap-6 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm sm:p-8",
          twoCols ? "max-w-2xl" : "max-w-md"
        )}
      >
        <div
          className={cn(
            "grid w-full gap-4 sm:gap-8",
            twoCols
              ? "grid-cols-2 divide-x divide-sage-100 [&>*:not(:first-child)]:pl-4 sm:[&>*:not(:first-child)]:pl-8"
              : "grid-cols-1"
          )}
        >
          {accounts.map(({ label, account }) => (
            <GiftAccountBlock key={label} account={account} label={label} />
          ))}
        </div>

        <p className="max-w-sm border-t border-sage-100 pt-5 text-center text-sm italic leading-relaxed text-ink/60">
          💌 Đừng quên ghi tên để vợ chồng mình biết món quà yêu thương này đến từ ai nhé.
        </p>
      </motion.div>
    </Section>
  );
}
