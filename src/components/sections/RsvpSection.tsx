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

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  guests: z.coerce.number().min(1).max(10),
  attendance: z.enum(["yes", "no"]),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RsvpSection() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 1, attendance: "yes" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await submitRsvp({
        name: data.name,
        phone: data.phone,
        guests: data.guests,
        attendance: data.attendance,
        message: data.message ?? "",
      });
      setSubmitted(true);
      reset();
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
        {submitted ? (
          <p className="py-8 text-center text-ink/70">
            Cảm ơn bạn đã xác nhận. Hẹn gặp bạn tại ngày trọng đại!
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ và tên"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="Số điện thoại"
              {...register("phone")}
              error={errors.phone?.message}
            />
            <Input
              label="Số khách đi cùng"
              type="number"
              min={1}
              max={10}
              {...register("guests")}
              error={errors.guests?.message}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Tham dự</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="yes" {...register("attendance")} />
                  Có, tôi sẽ đến
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="no" {...register("attendance")} />
                  Không thể tham dự
                </label>
              </div>
            </div>
            <Textarea
              label="Lời nhắn (tuỳ chọn)"
              {...register("message")}
            />
            {error && <p className="text-sm text-blush-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi xác nhận"}
            </Button>
          </form>
        )}
      </motion.div>
    </Section>
  );
}
