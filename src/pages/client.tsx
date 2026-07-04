import Head from "next/head";
import { GetServerSideProps } from "next";
import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/sections/HeroSection";
import CoupleSection from "@/components/sections/CoupleSection";
import LoveStorySection from "@/components/sections/LoveStorySection";
import GallerySection from "@/components/sections/GallerySection";
import CountdownSection from "@/components/sections/CountdownSection";
import EventSection from "@/components/sections/EventSection";
import MapSection from "@/components/sections/MapSection";
import GiftSection from "@/components/sections/GiftSection";
import RsvpSection from "@/components/sections/RsvpSection";
import WishesSection from "@/components/sections/WishesSection";
import FooterSection from "@/components/sections/FooterSection";
import { readWeddingConfig, readWishes } from "@/lib/data";
import type { WeddingConfig, Wish } from "@/types";

interface ClientProps {
  wedding: WeddingConfig;
  wishes: Wish[];
}

export default function Client({ wedding, wishes }: ClientProps) {
  const title = `${wedding.brideName} & ${wedding.groomName} · Wedding Invitation`;
  const description = `Thiệp mời đám cưới ${wedding.brideName} & ${wedding.groomName}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={wedding.coverImage} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MainLayout>
        <HeroSection
          brideName={wedding.brideName}
          groomName={wedding.groomName}
          weddingDate={wedding.weddingDate}
          coverImage={wedding.coverImage}
        />
        <CoupleSection bride={wedding.bride} groom={wedding.groom} />
        <LoveStorySection timeline={wedding.timeline} />
        <GallerySection images={wedding.gallery} />
        <CountdownSection weddingDate={wedding.weddingDate} />
        <EventSection events={wedding.events} />
        <MapSection venue={wedding.venue} />
        <GiftSection gift={wedding.gift} />
        <RsvpSection />
        <WishesSection initialWishes={wishes} />
        <FooterSection
          musicSrc={wedding.music}
          brideName={wedding.brideName}
          groomName={wedding.groomName}
        />
      </MainLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ClientProps> = async () => {
  const [wedding, wishes] = await Promise.all([
    readWeddingConfig(),
    readWishes(),
  ]);

  return { props: { wedding, wishes } };
};
