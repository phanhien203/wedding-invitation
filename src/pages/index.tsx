import { useEffect } from "react";
import fs from "fs";
import path from "path";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import AOS from "aos";
import AlbumSlider from "@/components/AlbumSlider";

interface HomeProps {
  images: string[];
}

export default function Home({ images }: HomeProps) {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  return (
    <>
      <Head>
        <title>Sắp ra mắt</title>
        <meta name="description" content="Sắp ra mắt" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Image
          src="/images/welcome.jpg"
          alt="Welcome"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink/60" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center text-cream">
          <span
            className="mb-6 text-xs uppercase tracking-[0.5em] text-gold sm:text-sm"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            Wedding Invitation
          </span>

          <h1
            className="font-serif text-5xl font-semibold leading-tight drop-shadow-lg sm:text-7xl lg:text-8xl"
            data-aos="zoom-in"
            data-aos-delay="250"
          >
            Sắp ra mắt
          </h1>

          <div
            className="mt-8 h-px w-24 bg-gold/80"
            data-aos="fade-up"
            data-aos-delay="450"
          />

          <p
            className="mt-8 max-w-md text-sm font-light leading-relaxed text-cream/80 sm:text-base"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            Chúng tôi đang chuẩn bị những điều đặc biệt nhất. Hãy quay lại sớm
            nhé!
          </p>
        </div>
      </section>

      {/* Album ảnh */}
      {images.length > 0 && (
        <section className="bg-cream py-20 sm:py-28">
          <div className="container-page">
            <div className="mb-12 text-center" data-aos="fade-up">
              <p className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">
                Khoảnh khắc
              </p>
              <h2 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
                Album ảnh
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">
                Nhấn vào ảnh để xem chi tiết và phóng to.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="150">
              <AlbumSlider images={images} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const albumDir = path.join(process.cwd(), "public", "album");
  let images: string[] = [];

  try {
    images = fs
      .readdirSync(albumDir)
      .filter((file) => /\.(jpe?g|png|webp|gif|avif)$/i.test(file))
      .sort()
      .map((file) => `/album/${file}`);
  } catch {
    images = [];
  }

  return { props: { images } };
};
