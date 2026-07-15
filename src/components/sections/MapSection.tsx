import VenueMap from "@/components/common/VenueMap";
import Section from "@/components/ui/Section";
import { resolveSide } from "@/utils/side";
import type { Venues, WeddingSide } from "@/types";

interface MapSectionProps {
  venues: Venues;
  /** Chỉ hiện địa điểm của nhà mời khách; mặc định là nhà trai. */
  side?: WeddingSide | null;
}

export default function MapSection({ venues, side }: MapSectionProps) {
  const shown = resolveSide(side);

  return (
    <Section title="Tiệc cưới sẽ tổ chức tại" subtitle="Location">
      <div className="mx-auto max-w-xl">
        {shown === "bride" ? (
          <VenueMap label="Nhà Gái" venue={venues.bride} />
        ) : (
          <VenueMap label="Nhà Trai" venue={venues.groom} />
        )}
      </div>
    </Section>
  );
}
