import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import { Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import ImageViewer from "@/components/ImageViewer";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

interface GallerySectionProps {
  images: string[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <Section title="Thư viện ảnh" subtitle="Gallery">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          loop={images.length > 2}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          coverflowEffect={{
            rotate: 42,
            stretch: 0,
            depth: 130,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 5,
          }}
          navigation
          className="gallery-swiper pb-14"
        >
          {images.map((src, index) => (
            <SwiperSlide
              key={src}
              className="!w-[74vw] max-w-[320px] sm:!w-[300px] lg:!w-[340px]"
            >
              <button
                onClick={() => setLightboxIndex(index)}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 80vw, 33vw"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <Maximize2
                    size={24}
                    className="text-white opacity-0 transition group-hover:opacity-100"
                  />
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      <ImageViewer
        images={images}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </Section>
  );
}
