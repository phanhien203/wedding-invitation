import Head from "next/head";
import { GetServerSideProps } from "next";
import MainLayout from "@/layouts/MainLayout";
import InvitationIntro from "@/components/InvitationIntro";
import HeroSection from "@/components/sections/HeroSection";
import CoupleSection from "@/components/sections/CoupleSection";
import CeremonyInfoSection from "@/components/sections/CeremonyInfoSection";
import LoveStorySection from "@/components/sections/LoveStorySection";
import GallerySection from "@/components/sections/GallerySection";
import EventSection from "@/components/sections/EventSection";
import MapSection from "@/components/sections/MapSection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import GiftSection from "@/components/sections/GiftSection";
import RsvpSection from "@/components/sections/RsvpSection";
import WishesSection from "@/components/sections/WishesSection";
import FooterSection from "@/components/sections/FooterSection";
import {
  readGuests,
  readRsvps,
  readWeddingConfig,
  readWishes,
} from "@/lib/data";
import { resolveSideDate } from "@/utils/date";
import type { Rsvp, WeddingConfig, WeddingSide, Wish } from "@/types";

interface InvitationProps {
  wedding: WeddingConfig;
  wishes: Wish[];
  inviteeName: string | null;
  inviteeSide: WeddingSide | null;
  guestSlug: string | null;
  initialRsvp: Rsvp | null;
}

export default function Invitation({
  wedding,
  wishes,
  inviteeName,
  inviteeSide,
  guestSlug,
  initialRsvp,
}: InvitationProps) {
  const title = `${wedding.brideName} & ${wedding.groomName} · Wedding Invitation`;
  const description = `Thiệp mời đám cưới ${wedding.brideName} & ${wedding.groomName}`;

  // Ngày hiển thị theo nhà của khách (nhà gái → ngày nhà gái; còn lại → nhà trai).
  const displayDate = resolveSideDate(
    wedding.events,
    inviteeSide,
    wedding.weddingDate
  );

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
      <InvitationIntro
        brideName={wedding.brideName}
        groomName={wedding.groomName}
        weddingDate={displayDate}
        inviteeName={inviteeName}
      />
      {/* Ảnh hero full-width, nằm ngoài cột nội dung. */}
      <HeroSection
        brideName={wedding.brideName}
        groomName={wedding.groomName}
        weddingDate={displayDate}
        coverImage={wedding.coverImage}
        inviteeName={inviteeName}
      />
      <MainLayout>
        <CoupleSection
          bride={wedding.bride}
          groom={wedding.groom}
          brideName={wedding.brideName}
          groomName={wedding.groomName}
        />
        <CeremonyInfoSection
          parents={wedding.parents}
          groom={wedding.groom}
          bride={wedding.bride}
          events={wedding.events}
          side={inviteeSide}
        />
        <LoveStorySection timeline={wedding.timeline} />
        <GallerySection images={wedding.gallery} />
        <EventSection
          events={wedding.events}
          side={inviteeSide}
          weddingDate={displayDate}
        />
        <MapSection venues={wedding.venues} side={inviteeSide} />
        <ScheduleSection schedule={wedding.schedule ?? []} />
        <GiftSection gift={wedding.gift} />
        {/* Thiệp chung cũng xác nhận được, chỉ khác là khách phải tự điền tên. */}
        <RsvpSection
          slug={guestSlug}
          guestName={inviteeName}
          initialRsvp={initialRsvp}
        />
        <WishesSection initialWishes={wishes} inviteeName={inviteeName} />
        <FooterSection
          musicSrc={wedding.music}
          brideName={wedding.brideName}
          groomName={wedding.groomName}
          bride={wedding.bride}
          groom={wedding.groom}
        />
      </MainLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<InvitationProps> = async (
  ctx
) => {
  const slug = typeof ctx.query.to === "string" ? ctx.query.to : null;

  const [wedding, allWishes, guests, rsvps] = await Promise.all([
    readWeddingConfig(),
    readWishes(),
    slug ? readGuests() : Promise.resolve([]),
    slug ? readRsvps() : Promise.resolve([]),
  ]);

  // Chỉ hiển thị lời chúc admin không ẩn.
  const wishes = allWishes.filter((w) => !w.hidden);

  // Chỉ slug đã lưu mới là thiệp mời hợp lệ — param bừa sẽ không ra tên khách.
  const guest = slug ? (guests.find((g) => g.slug === slug) ?? null) : null;
  const inviteeName = guest?.name ?? null;
  const inviteeSide = guest?.side ?? null;
  const guestSlug = guest?.slug ?? null;
  // Trạng thái xác nhận trước đó của khách (nếu có) để hiện lại và cập nhật.
  const initialRsvp = guest
    ? (rsvps.find((r) => r.guestSlug === guest.slug) ?? null)
    : null;

  return {
    props: { wedding, wishes, inviteeName, inviteeSide, guestSlug, initialRsvp },
  };
};
