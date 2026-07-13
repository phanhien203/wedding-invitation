import VenueMap from "@/components/common/VenueMap";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import type { Venues, WeddingSide } from "@/types";

interface MapSectionProps {
  venues: Venues;
  /** Nếu là thiệp mời riêng một nhà thì chỉ hiện địa điểm của nhà đó. */
  side?: WeddingSide | null;
}

export default function MapSection({ venues, side }: MapSectionProps) {
  const showGroom = !side || side === "groom";
  const showBride = !side || side === "bride";
  const both = showGroom && showBride;

  return (
    <Section title="Tiệc cưới sẽ tổ chức tại" subtitle="Location">
      <div
        className={cn(
          "grid gap-6",
          both ? "mx-auto max-w-4xl md:grid-cols-2" : "mx-auto max-w-xl"
        )}
      >
        {showGroom && <VenueMap label="Nhà Trai" venue={venues.groom} />}
        {showBride && <VenueMap label="Nhà Gái" venue={venues.bride} />}
      </div>
    </Section>
  );
}
