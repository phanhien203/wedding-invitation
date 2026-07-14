import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import Section from "@/components/ui/Section";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
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
    <Section title="Lời chúc" subtitle="Wishes" className="bg-sage-100/30">
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

            <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
              {wishes.map((wish, index) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
                  className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold text-ink">
                      {wish.name}
                    </p>
                    <p className="shrink-0 text-xs italic text-ink/40">
                      {dayjs(wish.createdAt).format("HH:mm:ss D/M/YYYY")}
                    </p>
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
