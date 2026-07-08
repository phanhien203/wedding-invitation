import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface AlbumSliderProps {
  images: string[];
}

export default function AlbumSlider({ images }: AlbumSliderProps) {
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
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={src}
                alt={`Ảnh cưới ${i + 1}`}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                className="select-none object-cover"
                draggable={false}
              />
            </div>
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
    </div>
  );
}
