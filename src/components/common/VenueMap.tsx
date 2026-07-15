import { MapPin, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Venue } from "@/types";

interface VenueMapProps {
  label: string;
  venue: Venue;
}

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export default function VenueMap({ label, venue }: VenueMapProps) {
  const hasCoords = venue.lat !== 0 || venue.lng !== 0;
  // venue.name hay bị đặt trùng luôn với nhãn ("Nhà Trai"), in ra thành hai
  // dòng y hệt nhau. Trùng thì lấy địa chỉ làm tiêu đề, và bỏ dòng địa chỉ
  // dưới chân cho khỏi lặp tiếp.
  const title = same(venue.name, label) ? venue.address : venue.name;
  const showAddress = Boolean(venue.address) && !same(title, venue.address);
  const embedUrl = `https://maps.google.com/maps?q=${venue.lat},${venue.lng}&z=16&hl=vi&output=embed`;
  const directionsUrl =
    venue.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-sm">
      <div className="border-b border-sage-100 px-5 py-2.5 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">{label}</p>
        {title && <h3 className="mt-0.5 text-lg font-semibold">{title}</h3>}
      </div>

      <div className="relative h-64 sm:h-72">
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

      <div
        className={cn(
          "flex flex-1 flex-col items-center gap-3 px-5 py-3.5 sm:flex-row",
          showAddress ? "sm:justify-between" : "justify-center"
        )}
      >
        {showAddress && (
          <div className="flex items-start gap-2 text-sm text-ink/70">
            <MapPin size={18} className="mt-0.5 shrink-0 text-sage-700" />
            <span>{venue.address}</span>
          </div>
        )}
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
