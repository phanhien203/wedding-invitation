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
    <Section title="Lời chúc" subtitle="Wishes" className="bg-blush-50/30">
      <div className="mx-auto max-w-lg space-y-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm"
        >
          <Input
            label="Tên của bạn"
            {...register("name")}
            error={errors.name?.message}
          />
          <Textarea
            label="Lời chúc"
            {...register("message")}
            error={errors.message?.message}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi lời chúc"}
          </Button>
        </form>

        <div className="space-y-4">
          {wishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-sage-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{wish.name}</span>
                <span className="text-xs text-ink/40">
                  {dayjs(wish.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink/70">
                {wish.message}
              </p>
            </motion.div>
          ))}
          {!wishes.length && (
            <p className="text-center text-sm text-ink/40">
              Hãy là người đầu tiên gửi lời chúc!
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
