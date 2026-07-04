import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface GalleryProps {
  images: string[];
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function Gallery({ images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  const isOpen = activeIndex !== null;

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const open = useCallback(
    (index: number) => {
      resetView();
      setActiveIndex(index);
    },
    [resetView],
  );

  const close = useCallback(() => {
    setActiveIndex(null);
    resetView();
  }, [resetView]);

  const goTo = useCallback(
    (index: number) => {
      resetView();
      setActiveIndex(((index % images.length) + images.length) % images.length);
    },
    [images.length, resetView],
  );

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2))),
    [],
  );
  const zoomOut = useCallback(
    () =>
      setZoom((z) => {
        const next = Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2));
        if (next === MIN_ZOOM) setOffset({ x: 0, y: 0 });
        return next;
      }),
    [],
  );

  const download = useCallback(() => {
    if (activeIndex === null) return;
    const src = images[activeIndex];
    const link = document.createElement("a");
    link.href = src;
    link.download = src.split("/").pop() ?? "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeIndex, images]);

  // Điều khiển bằng bàn phím
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") goTo((activeIndex ?? 0) + 1);
      else if (e.key === "ArrowLeft") goTo((activeIndex ?? 0) - 1);
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, activeIndex, close, goTo, zoomIn, zoomOut]);

  // Khóa scroll của body khi lightbox mở
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    setOffset({
      x: dragState.current.originX + (e.clientX - dragState.current.startX),
      y: dragState.current.originY + (e.clientY - dragState.current.startY),
    });
  };

  const onPointerUp = () => {
    dragState.current.dragging = false;
  };

  return (
    <>
      {/* Lưới ảnh */}
      <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => open(i)}
            className="group relative mb-3 block w-full overflow-hidden rounded-xl sm:mb-4"
            aria-label={`Xem ảnh ${i + 1}`}
          >
            <Image
              src={src}
              alt={`Ảnh cưới ${i + 1}`}
              width={800}
              height={1000}
              sizes="(max-width: 640px) 50vw, 33vw"
              className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/15" />
            <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-cream/90 text-ink opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isOpen && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          {/* Thanh công cụ */}
          <div className="flex items-center justify-between px-4 py-3 text-cream sm:px-6">
            <span className="text-sm tracking-widest text-cream/70">
              {activeIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <ToolbarButton onClick={zoomOut} label="Thu nhỏ" disabled={zoom <= MIN_ZOOM}>
                <ZoomOut className="h-5 w-5" />
              </ToolbarButton>
              <span className="w-12 text-center text-sm tabular-nums text-cream/70">
                {Math.round(zoom * 100)}%
              </span>
              <ToolbarButton onClick={zoomIn} label="Phóng to" disabled={zoom >= MAX_ZOOM}>
                <ZoomIn className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton onClick={resetView} label="Đặt lại">
                <RotateCcw className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton onClick={download} label="Tải xuống">
                <Download className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton onClick={close} label="Đóng">
                <X className="h-5 w-5" />
              </ToolbarButton>
            </div>
          </div>

          {/* Vùng ảnh */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onWheel={onWheel}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:left-6"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div
              className={cn(
                "relative select-none",
                zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default",
              )}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: dragState.current.dragging
                  ? "none"
                  : "transform 0.2s ease-out",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onDoubleClick={() => (zoom > 1 ? resetView() : zoomIn())}
            >
              <Image
                src={images[activeIndex]}
                alt={`Ảnh cưới ${activeIndex + 1}`}
                width={1600}
                height={2000}
                priority
                draggable={false}
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>

            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:right-6"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Dải ảnh thu nhỏ */}
          <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => goTo(i)}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition-all",
                  i === activeIndex
                    ? "ring-gold"
                    : "ring-transparent opacity-50 hover:opacity-100",
                )}
                aria-label={`Chuyển đến ảnh ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ToolbarButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full text-cream/90 transition-colors hover:bg-cream/15 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
