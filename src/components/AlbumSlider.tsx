import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import ImageViewer from "@/components/ImageViewer";

interface AlbumSliderProps {
  images: string[];
}

export default function AlbumSlider({ images }: AlbumSliderProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="album-slider relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        grabCursor
        loop={images.length > 2}
        spaceBetween={16}
        slidesPerView={1.15}
        centeredSlides
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          prevEl: ".album-slider-prev",
          nextEl: ".album-slider-next",
        }}
        breakpoints={{
          640: { slidesPerView: 2, centeredSlides: false, spaceBetween: 20 },
          1024: { slidesPerView: 3, centeredSlides: false, spaceBetween: 24 },
        }}
        style={
          {
            "--swiper-pagination-color": "#C8A96A",
            "--swiper-pagination-bullet-inactive-color": "#3D3733",
            "--swiper-pagination-bullet-inactive-opacity": "0.25",
          } as React.CSSProperties
        }
        className="!pb-12"
      >
        {images.map((src, i) => (
          <SwiperSlide key={src}>
            <button
              type="button"
              onClick={() => setViewerIndex(i)}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm"
              aria-label={`Xem ảnh ${i + 1}`}
            >
              <Image
                src={src}
                alt={`Ảnh cưới ${i + 1}`}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                className="select-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                draggable={false}
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/15" />
              <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-cream/90 text-ink opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        className="album-slider-prev absolute left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/80 text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-cream sm:flex lg:-left-4"
        aria-label="Ảnh trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="album-slider-next absolute right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/80 text-ink shadow-md backdrop-blur-sm transition-colors hover:bg-cream sm:flex lg:-right-4"
        aria-label="Ảnh sau"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <ImageViewer
        images={images}
        openIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </div>
  );
}
