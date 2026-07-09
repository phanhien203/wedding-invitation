import { MapPin, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Venue } from "@/types";

interface VenueMapProps {
  label: string;
  venue: Venue;
}

export default function VenueMap({ label, venue }: VenueMapProps) {
  const hasCoords = venue.lat !== 0 || venue.lng !== 0;
  const embedUrl = `https://maps.google.com/maps?q=${venue.lat},${venue.lng}&z=16&hl=vi&output=embed`;
  const directionsUrl =
    venue.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-sm">
      <div className="border-b border-sage-100 px-5 py-3 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">{label}</p>
        <h3 className="mt-1 text-lg font-semibold">{venue.name}</h3>
      </div>

      <div className="relative h-56 sm:h-64">
        {hasCoords ? (
          <iframe
            title={`Bản đồ ${label}`}
            src={embedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-sage-100 text-sm text-ink/50">
            Đang cập nhật bản đồ
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm text-ink/70">
          <MapPin size={18} className="mt-0.5 shrink-0 text-blush-400" />
          <span>{venue.address}</span>
        </div>
        {(hasCoords || venue.mapUrl) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(directionsUrl, "_blank")}
            className="shrink-0 gap-1.5"
          >
            <ExternalLink size={14} />
            Chỉ đường
          </Button>
        )}
      </div>
    </div>
  );
}
