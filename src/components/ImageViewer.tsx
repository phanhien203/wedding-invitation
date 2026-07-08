import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation, Keyboard, Zoom } from "swiper/modules";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/cn";

interface ImageViewerProps {
  images: string[];
  openIndex: number | null;
  onClose: () => void;
}

export default function ImageViewer({ images, openIndex, onClose }: ImageViewerProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [current, setCurrent] = useState(openIndex ?? 0);
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (openIndex !== null) setCurrent(openIndex);
  }, [openIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const download = useCallback(() => {
    const src = images[current];
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = src.split("/").pop() ?? "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [current, images]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      {/* Thanh trên cùng */}
      <div className="flex items-center justify-between px-4 py-3 text-cream sm:px-6">
        <span className="text-sm tracking-widest text-cream/70">
          {current + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={download}
            aria-label="Tải xuống"
            title="Tải xuống"
            className="flex h-11 w-11 items-center justify-center rounded-full text-cream/90 transition-colors hover:bg-cream/15"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            className="flex h-11 w-11 items-center justify-center rounded-full text-cream/90 transition-colors hover:bg-cream/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Vùng ảnh */}
      <div className="relative flex-1 overflow-hidden">
        <Swiper
          modules={[Navigation, Keyboard, Zoom]}
          initialSlide={openIndex ?? 0}
          zoom={{ maxRatio: 3 }}
          keyboard={{ enabled: true }}
          navigation={{ prevEl: ".viewer-prev", nextEl: ".viewer-next" }}
          spaceBetween={24}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setCurrent(s.activeIndex)}
          className="h-full w-full"
        >
          {images.map((src, i) => (
            <SwiperSlide key={src} className="flex items-center justify-center">
              <div className="swiper-zoom-container">
                <Image
                  src={src}
                  alt={`Ảnh cưới ${i + 1}`}
                  width={1600}
                  height={2000}
                  priority={i === (openIndex ?? 0)}
                  draggable={false}
                  className="max-h-[78vh] w-auto select-none object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="viewer-prev absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:left-6 sm:flex"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className="viewer-next absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:right-6 sm:flex"
          aria-label="Ảnh sau"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dải ảnh thu nhỏ (desktop / tablet) */}
      <div className="hidden justify-center gap-2 overflow-x-auto px-4 py-3 sm:flex">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => swiperRef.current?.slideTo(i)}
            className={cn(
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition-all",
              i === current
                ? "ring-gold"
                : "ring-transparent opacity-50 hover:opacity-100",
            )}
            aria-label={`Chuyển đến ảnh ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="56px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Gợi ý thao tác (mobile) */}
      <p className="pb-5 pt-1 text-center text-xs text-cream/50 sm:hidden">
        Vuốt để chuyển ảnh · Chạm đúp hoặc chụm để phóng to
      </p>
    </div>,
    document.body,
  );
}
