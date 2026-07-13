import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { submitRsvp } from "@/services/api";
import type { Rsvp } from "@/types";

const schema = z.object({
  attendance: z.enum(["yes", "no"]),
  guests: z.coerce.number().min(1).max(20),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RsvpSectionProps {
  slug: string;
  guestName: string;
  initialRsvp: Rsvp | null;
}

export default function RsvpSection({
  slug,
  guestName,
  initialRsvp,
}: RsvpSectionProps) {
  const [current, setCurrent] = useState<Rsvp | null>(initialRsvp);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      attendance: initialRsvp?.attendance ?? "yes",
      guests: initialRsvp && initialRsvp.guests > 0 ? initialRsvp.guests : 1,
      message: initialRsvp?.message ?? "",
    },
  });

  const attendance = watch("attendance");

  const onSubmit = async (data: FormData) => {
    setError("");
    setSaved(false);
    try {
      const rsvp = await submitRsvp({
        slug,
        attendance: data.attendance,
        guests: data.attendance === "yes" ? data.guests : 0,
        message: data.message ?? "",
      });
      setCurrent(rsvp);
      setSaved(true);
    } catch {
      setError("Gửi xác nhận thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Section title="Xác nhận tham dự" subtitle="RSVP">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-lg rounded-2xl border border-sage-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="mb-5 text-center text-sm text-ink/60">
          Kính gửi{" "}
          <span className="font-medium text-ink">{guestName}</span>, mong bạn
          dành chút thời gian xác nhận tham dự.
        </p>

        {current && (
          <div className="mb-5 rounded-xl bg-sage-100/60 px-4 py-3 text-center text-sm text-ink/70">
            Bạn đã xác nhận:{" "}
            <span className="font-medium text-ink">
              {current.attendance === "yes"
                ? `Có tham dự · ${current.guests} người`
                : "Không thể tham dự"}
            </span>
            . Bạn có thể cập nhật lại bên dưới.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">
              Bạn sẽ tham dự chứ?
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="yes" {...register("attendance")} />
                Có, tôi sẽ đến
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="no" {...register("attendance")} />
                Rất tiếc, không thể
              </label>
            </div>
          </div>

          {attendance === "yes" && (
            <Input
              label="Số người tham dự"
              type="number"
              min={1}
              max={20}
              {...register("guests")}
              error={errors.guests?.message}
            />
          )}

          <Textarea label="Lời nhắn (tuỳ chọn)" {...register("message")} />

          {error && <p className="text-sm text-blush-500">{error}</p>}
          {saved && (
            <p className="text-sm text-sage-700">
              Đã lưu xác nhận của bạn. Cảm ơn bạn rất nhiều!
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang gửi..."
              : current
                ? "Cập nhật xác nhận"
                : "Gửi xác nhận"}
          </Button>
        </form>
      </motion.div>
    </Section>
  );
}
