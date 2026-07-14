import { Fragment, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import type { TimelineItem } from "@/types";

interface LoveStorySectionProps {
  timeline: TimelineItem[];
}

/** Tính sẵn: mỗi mốc nằm bên nào (so le) và có mở đầu một chương mới không. */
function buildRows(timeline: TimelineItem[]) {
  let lastChapter = "";
  return timeline.map((item, index) => {
    const chapter = item.chapter?.trim() ?? "";
    const showChapter = chapter !== "" && chapter !== lastChapter;
    if (chapter) lastChapter = chapter;
    return { item, index, showChapter, chapter, left: index % 2 === 0 };
  });
}

export default function LoveStorySection({ timeline }: LoveStorySectionProps) {
  // Mặc định thu gọn: câu chuyện khá dài nên để khách xem thông tin quan trọng
  // trước, ai muốn thì bấm mở.
  const [open, setOpen] = useState(false);

  if (!timeline.length) return null;

  const rows = buildRows(timeline);

  return (
    <Section
      title="Câu chuyện tình yêu"
      subtitle="Our story"
      className="bg-sage-100/40"
    >
      {/* Trạng thái thu gọn: lời mời + nút mở. */}
      <div className="mx-auto max-w-md text-center">
        <p className="mb-6 text-sm leading-relaxed text-ink/70">
          Hành trình yêu thương của chúng mình gói trong {timeline.length} khoảnh
          khắc đáng nhớ — bấm để cùng đọc lại từ đầu nhé.
        </p>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full border border-sage-500 px-7 py-3 text-sm font-medium text-sage-700 transition hover:bg-sage-100"
        >
          <Heart className="h-4 w-4 fill-current" />
          {open ? "Thu gọn câu chuyện" : "Mở câu chuyện tình yêu"}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Timeline sổ ra/thu vào mượt theo chiều cao. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="story-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="relative mx-auto mt-12 max-w-3xl">
              {/* Trục dọc: mobile nằm sát trái, desktop ở chính giữa. */}
              <div className="pointer-events-none absolute inset-y-0 left-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-sage-300 via-sage-500 to-sage-700 sm:left-1/2" />

              {/* Trái tim mở đầu trên trục. */}
              <div className="relative mb-10 flex pl-4 sm:justify-center sm:pl-0">
                <span className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-sage-700 text-white sm:translate-x-0">
                  <Heart className="h-4 w-4 fill-current" />
                </span>
              </div>

              {rows.map(({ item, index, showChapter, chapter, left }) => (
                <Fragment key={item.id}>
                  {showChapter && (
                    <div className="relative mb-8 flex pl-9 sm:justify-center sm:pl-0">
                      <span className="rounded-full bg-sage-700 px-5 py-1.5 font-script text-base text-cream shadow-sm">
                        {chapter}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: left ? -24 : 24, y: 12 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className="relative grid grid-cols-1 pb-10 sm:grid-cols-2 sm:gap-x-12"
                  >
                    {/* Chấm mốc trên trục. */}
                    <span className="absolute left-4 top-1 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-sage-500 shadow sm:left-1/2" />

                    {/* Thẻ mốc: mobile luôn bên phải trục; desktop so le trái/phải. */}
                    <div
                      className={cn(
                        "flex pl-10 sm:pl-0",
                        left
                          ? "sm:col-start-1 sm:justify-end sm:pr-2"
                          : "sm:col-start-2 sm:justify-start sm:pl-2",
                      )}
                    >
                      <div className="w-full max-w-[17rem] overflow-hidden rounded-2xl border border-sage-100 bg-white text-left shadow-sm">
                        {item.image && (
                          <div className="relative aspect-[4/5]">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 70vw, 272px"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <span className="text-xs font-semibold tracking-wide text-sage-700">
                            {item.date}
                          </span>
                          <h3 className="mt-1 text-lg font-medium text-ink">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-ink/60">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Fragment>
              ))}

              {/* Trái tim kết thúc trên trục. */}
              <div className="relative flex pl-4 sm:justify-center sm:pl-0">
                <span className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-sage-500 text-white sm:translate-x-0">
                  <Heart className="h-4 w-4 fill-current" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
