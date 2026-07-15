import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import dayjs from "dayjs";
import WishIcon from "@/components/common/WishIcon";
import { MAX_WISH_LENGTH } from "@/constants";
import Section from "@/components/ui/Section";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { submitWish } from "@/services/api";
import type { Wish } from "@/types";

/** Thiệp riêng đã biết khách là ai nên không bắt điền tên nữa. */
const makeSchema = (needsName: boolean) =>
  z.object({
    name: needsName
      ? z.string().trim().min(1, "Vui lòng nhập tên")
      : z.string().optional(),
    message: z
      .string()
      .min(1, "Vui lòng nhập lời chúc")
      .max(MAX_WISH_LENGTH, `Lời chúc tối đa ${MAX_WISH_LENGTH} ký tự`),
  });

type FormData = z.infer<ReturnType<typeof makeSchema>>;

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "♥";

/** Số thẻ hiện sẵn: luôn là các lời chúc mới nhất, để mở rộng chỉ nối thêm
 *  xuống dưới chứ không chèn thẻ vào giữa danh sách. */
const PREVIEW_COUNT = 3;
/** Dài hơn ngần này thì thẻ chỉ hiện đoạn đầu, kèm nút "Xem thêm". */
const PREVIEW_CHARS = 200;

/**
 * Vị trí của phần tử so với đầu tài liệu. Dùng chuỗi offsetTop chứ không dùng
 * getBoundingClientRect vì rect đã cộng cả transform mà framer-motion đang
 * dùng để chạy layout animation — đo rect sẽ ra vị trí cũ, bù trượt sai.
 */
function docTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * Khối phình/co làm nội dung quanh nó xê dịch và màn hình nhảy — chưa kể Chrome
 * còn tự cuộn để giữ mỏ neo của riêng nó (scroll anchoring). Chụp vị trí một
 * mốc trước khi đổi state rồi cuộn bù ngay trước lúc vẽ, để mốc đứng im.
 */
function useKeepInPlace(dep: unknown) {
  const anchor = useRef<{ el: HTMLElement; viewportTop: number } | null>(null);

  const capture = (el: HTMLElement | null) => {
    anchor.current = el
      ? { el, viewportTop: docTop(el) - window.scrollY }
      : null;
  };

  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    const target = docTop(a.el) - a.viewportTop;
    if (Math.round(target) !== Math.round(window.scrollY)) {
      // "instant" là bắt buộc: html đang để scroll-behavior:smooth, bỏ trống thì
      // cú bù này biến thành một pha cuộn trượt — đúng cái cần tránh.
      window.scrollTo({ top: target, behavior: "instant" });
    }
  }, [dep]);

  return capture;
}

/** Cắt ở khoảng trắng gần nhất để không đứt ngang một từ. */
function shorten(message: string): string {
  const cut = message.slice(0, PREVIEW_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > PREVIEW_CHARS * 0.8 ? cut.slice(0, lastSpace) : cut;
  return `${safe.trimEnd()}…`;
}

function WishCard({ wish, index }: { wish: Wish; index: number }) {
  const [open, setOpen] = useState(false);
  const isLong = wish.message.length > PREVIEW_CHARS;
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const keepInPlace = useKeepInPlace(open);

  const toggle = () => {
    // Mở: níu đỉnh thẻ — thẻ đứng im, chữ nở dần xuống dưới.
    // Rút gọn: níu chính nút vừa bấm — nút không chạy khỏi con trỏ.
    keepInPlace(open ? buttonRef.current : cardRef.current);
    setOpen((v) => !v);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.2),
        layout: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
      }}
      className="relative overflow-hidden rounded-2xl border border-sage-100 bg-white p-5 pl-7 shadow-sm transition-colors [overflow-anchor:none] hover:border-sage-300"
    >
      <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-sage-300 to-gold/40" />

      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-100 font-serif text-lg text-sage-700">
          {initialOf(wish.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words font-serif text-lg font-semibold text-sage-700">
              {wish.name}
            </p>
            <WishIcon seed={wish.id} />
          </div>

          <motion.p
            layout="position"
            className="mt-1.5 whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-ink/70"
          >
            {isLong && !open ? shorten(wish.message) : wish.message}
          </motion.p>

          <motion.div layout="position" className="mt-3 flex items-end justify-between gap-3">
            {isLong ? (
              <button
                ref={buttonRef}
                type="button"
                onClick={toggle}
                className="flex items-center gap-1 text-xs font-medium text-sage-700 transition hover:text-ink"
              >
                {open ? "Rút gọn" : "Xem thêm"}
                {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            ) : (
              <span />
            )}
            <p className="shrink-0 text-xs text-ink/40">
              {dayjs(wish.createdAt).format("HH:mm · DD/MM/YYYY")}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

interface WishesSectionProps {
  initialWishes: Wish[];
  /** Có = thiệp mời riêng, đã biết tên khách nên không hỏi lại. */
  inviteeName?: string | null;
}

export default function WishesSection({
  initialWishes,
  inviteeName,
}: WishesSectionProps) {
  const [wishes, setWishes] = useState(initialWishes);
  const [expanded, setExpanded] = useState(false);
  const needsName = !inviteeName;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(useMemo(() => makeSchema(needsName), [needsName])),
  });

  const typedLength = watch("message")?.length ?? 0;

  const shown = expanded ? wishes : wishes.slice(0, PREVIEW_COUNT);
  const canExpand = wishes.length > PREVIEW_COUNT;

  const listRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const keepInPlace = useKeepInPlace(expanded);

  const toggleAll = () => {
    // Mở: níu đỉnh danh sách — thẻ mới hiện dần xuống dưới, màn hình đứng im.
    // Thu gọn: níu chính nút vừa bấm vì thẻ phía trên nó bị cắt bớt.
    keepInPlace(expanded ? toggleRef.current : listRef.current);
    setExpanded((v) => !v);
  };

  const onSubmit = async (data: FormData) => {
    const wish = await submitWish({
      name: inviteeName ?? data.name ?? "",
      message: data.message,
    });
    setWishes((prev) => [wish, ...prev]);
    reset();
  };

  return (
    <Section title="Lời chúc" subtitle="Wishes" className="bg-sage-100/30">
      <div className="mx-auto max-w-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm"
        >
          {needsName ? (
            <Input
              label="Tên của bạn"
              {...register("name")}
              error={errors.name?.message}
            />
          ) : (
            // Không hỏi tên nhưng vẫn phải cho biết lời chúc sẽ đứng tên ai.
            <p className="text-sm text-ink/60">
              Gửi với tên{" "}
              <span className="font-medium text-ink">{inviteeName}</span>
            </p>
          )}
          <div>
            <Textarea
              label="Lời chúc"
              placeholder="Gửi đôi lời yêu thương đến cô dâu và chú rể…"
              maxLength={MAX_WISH_LENGTH}
              {...register("message")}
              error={errors.message?.message}
            />
            <p className="mt-1 text-right text-xs text-ink/40">
              {typedLength}/{MAX_WISH_LENGTH}
            </p>
          </div>
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

            {/* gap thay space-y: margin và layout animation của framer đá nhau. */}
            <div ref={listRef} className="flex flex-col gap-4 [overflow-anchor:none]">
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((wish, index) => (
                  <WishCard key={wish.id} wish={wish} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {canExpand && (
              <motion.button
                layout
                ref={toggleRef}
                type="button"
                onClick={toggleAll}
                className="mx-auto mt-6 flex items-center gap-1.5 rounded-full border border-sage-300 bg-white px-5 py-2 text-sm text-sage-700 shadow-sm transition-colors hover:border-sage-700 hover:bg-sage-100/40"
              >
                {expanded ? (
                  <>
                    Thu gọn
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Xem tất cả ({wishes.length})
                    <ChevronDown size={16} />
                  </>
                )}
              </motion.button>
            )}
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
