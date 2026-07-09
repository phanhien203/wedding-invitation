import VenueMap from "@/components/common/VenueMap";
import Section from "@/components/ui/Section";
import type { Venues } from "@/types";

interface MapSectionProps {
  venues: Venues;
}

export default function MapSection({ venues }: MapSectionProps) {
  return (
    <Section title="Địa điểm" subtitle="Location" className="bg-blush-50/30">
      <div className="grid gap-6 md:grid-cols-2">
        <VenueMap label="Nhà Trai" venue={venues.groom} />
        <VenueMap label="Nhà Gái" venue={venues.bride} />
      </div>
    </Section>
  );
}
