import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import ImageViewer from "@/components/ImageViewer";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={1.2}
          centeredSlides
          loop={images.length > 2}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3 },
          }}
          className="gallery-swiper pb-10"
        >
          {images.map((src, index) => (
            <SwiperSlide key={src}>
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
