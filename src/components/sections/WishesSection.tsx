import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { Quote } from "lucide-react";
import Section from "@/components/ui/Section";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { submitWish } from "@/services/api";
import type { Wish } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  message: z.string().min(1, "Vui lòng nhập lời chúc"),
});

type FormData = z.infer<typeof schema>;

interface WishesSectionProps {
  initialWishes: Wish[];
}

const AVATAR_STYLES = [
  "bg-blush-100 text-blush-500",
  "bg-sage-100 text-sage-700",
  "bg-gold/20 text-[#9A7B33]",
];

/** Chữ cái đầu của tên (tối đa 2 ký tự). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const chars =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return chars.toUpperCase();
}

/** Chọn màu avatar ổn định theo tên. */
function getAvatarStyle(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_STYLES[hash % AVATAR_STYLES.length];
}

export default function WishesSection({ initialWishes }: WishesSectionProps) {
  const [wishes, setWishes] = useState(initialWishes);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const wish = await submitWish(data);
    setWishes((prev) => [wish, ...prev]);
    reset();
  };

  return (
    <Section title="Lời chúc" subtitle="Wishes" className="bg-blush-50/30">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto max-w-lg space-y-4 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm"
        >
          <Input
            label="Tên của bạn"
            {...register("name")}
            error={errors.name?.message}
          />
          <Textarea
            label="Lời chúc"
            placeholder="Gửi đôi lời yêu thương đến cô dâu và chú rể…"
            {...register("message")}
            error={errors.message?.message}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi lời chúc"}
          </Button>
        </form>

        {wishes.length > 0 ? (
          <>
            <div className="my-8 flex items-center justify-center gap-3 text-sm text-ink/50">
              <span className="h-px w-9 bg-gold/40" />
              {wishes.length} lời chúc đã gửi
              <span className="h-px w-9 bg-gold/40" />
            </div>

            <div className="columns-1 gap-4 sm:columns-2">
              {wishes.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
                  className="relative mb-4 break-inside-avoid rounded-2xl border border-sage-100 bg-white p-5 shadow-sm"
                >
                  <Quote
                    className="absolute right-4 top-4 h-5 w-5 text-gold/40"
                    aria-hidden
                  />
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        getAvatarStyle(wish.name),
                      )}
                    >
                      {getInitials(wish.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{wish.name}</p>
                      <p className="text-xs text-ink/40">
                        {dayjs(wish.createdAt).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                  <p className="whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-ink/70">
                    {wish.message}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-8 text-center text-sm text-ink/40">
            Hãy là người đầu tiên gửi lời chúc!
          </p>
        )}
      </div>
    </Section>
  );
}
