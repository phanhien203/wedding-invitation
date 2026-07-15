import { Fragment, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";
import Section from "@/components/ui/Section";
import ImageViewer from "@/components/ImageViewer";
import { MAX_TIMELINE_PHOTOS } from "@/constants";
import { cn } from "@/lib/cn";
import type { TimelineItem } from "@/types";

interface LoveStorySectionProps {
  timeline: TimelineItem[];
}

const FULL = "(max-width: 640px) 70vw, 272px";
const HALF = "(max-width: 640px) 35vw, 136px";
const THIRD = "(max-width: 640px) 24vw, 90px";

/** Số ô tối đa trên thẻ; ảnh dư dồn vào nhãn "+N" ở ô cuối. */
const MAX_TILES = 4;

function Tile({
  src,
  alt,
  ratio,
  sizes,
  className,
  more,
  onOpen,
}: {
  src: string;
  alt: string;
  ratio: string;
  sizes: string;
  className?: string;
  /** Số ảnh còn lại không có ô riêng, hiện đè lên ô này. */
  more?: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        // block w-full: button mặc định inline-block, mà ảnh bên trong là fill
        // (absolute) nên không có gì đẩy chiều rộng — để nguyên là ô rộng 0.
        "group relative block w-full overflow-hidden bg-sage-100",
        ratio,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes={sizes}
      />
      {more ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 font-serif text-lg text-white">
          +{more}
        </span>
      ) : (
        <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
      )}
    </button>
  );
}

/**
 * Thẻ mốc chỉ rộng 17rem nên nhồi cả chục ảnh vào là mỗi ảnh còn cỡ con tem.
 * Thẻ chỉ bày tối đa 4 ô, phần dư gộp vào "+N"; bấm ô nào cũng mở lightbox xem
 * đủ. Bố cục đổi theo số ảnh để không có ô nào bị hụt.
 */
function PhotoCollage({
  photos,
  alt,
  onOpen,
}: {
  photos: string[];
  alt: string;
  onOpen: (index: number) => void;
}) {
  if (!photos.length) return null;

  if (photos.length === 1) {
    return (
      <Tile
        src={photos[0]}
        alt={alt}
        ratio="aspect-[4/5]"
        sizes={FULL}
        onOpen={() => onOpen(0)}
      />
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {photos.map((src, i) => (
          <Tile
            key={i}
            src={src}
            alt={alt}
            ratio="aspect-[3/4]"
            sizes={HALF}
            onOpen={() => onOpen(i)}
          />
        ))}
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1">
        <Tile
          src={photos[0]}
          alt={alt}
          ratio="aspect-[16/10]"
          sizes={FULL}
          className="col-span-2"
          onOpen={() => onOpen(0)}
        />
        <Tile
          src={photos[1]}
          alt={alt}
          ratio="aspect-square"
          sizes={HALF}
          onOpen={() => onOpen(1)}
        />
        <Tile
          src={photos[2]}
          alt={alt}
          ratio="aspect-square"
          sizes={HALF}
          onOpen={() => onOpen(2)}
        />
      </div>
    );
  }

  const tiles = photos.slice(0, MAX_TILES);
  const hidden = photos.length - tiles.length;

  return (
    <div className="grid grid-cols-3 gap-1">
      <Tile
        src={tiles[0]}
        alt={alt}
        ratio="aspect-[16/10]"
        sizes={FULL}
        className="col-span-3"
        onOpen={() => onOpen(0)}
      />
      {tiles.slice(1).map((src, i) => (
        <Tile
          key={i + 1}
          src={src}
          alt={alt}
          ratio="aspect-square"
          sizes={THIRD}
          more={hidden > 0 && i === tiles.length - 2 ? hidden : undefined}
          onOpen={() => onOpen(i + 1)}
        />
      ))}
    </div>
  );
}

/** Chặn cứng ở tầng hiển thị, phòng dữ liệu cũ lỡ có nhiều ảnh hơn giới hạn. */
const photosOf = (item: TimelineItem) =>
  (item.images ?? []).slice(0, MAX_TIMELINE_PHOTOS);

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
  // Lightbox dùng chung cho mọi mốc: mở mốc nào thì nạp đúng bộ ảnh của mốc đó.
  const [viewer, setViewer] = useState<{
    photos: string[];
    index: number;
  } | null>(null);

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
                        <PhotoCollage
                          photos={photosOf(item)}
                          alt={item.title}
                          onOpen={(photoIndex) =>
                            setViewer({
                              photos: photosOf(item),
                              index: photoIndex,
                            })
                          }
                        />
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

      <ImageViewer
        images={viewer?.photos ?? []}
        openIndex={viewer?.index ?? null}
        onClose={() => setViewer(null)}
      />
    </Section>
  );
}
