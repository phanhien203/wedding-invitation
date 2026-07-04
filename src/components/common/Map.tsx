import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import type { VenueLocation } from "@/types";

interface MapProps {
  venue: VenueLocation;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export default function Map({ venue }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const center = { lat: venue.lat, lng: venue.lng };
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-sm">
      <div className="relative h-64 sm:h-80">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            <Marker position={center} />
          </GoogleMap>
        ) : (
          <div className="flex h-full items-center justify-center bg-sage-100 text-sm text-ink/50">
            Đang tải bản đồ...
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm text-ink/70">
          <MapPin size={18} className="mt-0.5 shrink-0 text-blush-400" />
          <span>{venue.address}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(mapsUrl, "_blank")}
          className="shrink-0 gap-1.5"
        >
          <ExternalLink size={14} />
          Mở Google Maps
        </Button>
      </div>
    </div>
  );
}
