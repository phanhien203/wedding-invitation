import dynamic from "next/dynamic";
import Section from "@/components/ui/Section";
import type { VenueLocation } from "@/types";

const Map = dynamic(() => import("@/components/common/Map"), { ssr: false });

interface MapSectionProps {
  venue: VenueLocation;
}

export default function MapSection({ venue }: MapSectionProps) {
  return (
    <Section title="Địa điểm" subtitle="Location" className="bg-blush-50/30">
      <Map venue={venue} />
    </Section>
  );
}
