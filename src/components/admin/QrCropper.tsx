import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface QrCropperProps {
  imageSrc: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("crop failed"))),
      "image/png"
    )
  );
}

export default function QrCropper({
  imageSrc,
  open,
  onCancel,
  onConfirm,
}: QrCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    setProcessing(true);
    try {
      const blob = await cropToBlob(imageSrc, area);
      onConfirm(new File([blob], "qr.png", { type: "image/png" }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel} className="max-w-md">
      <p className="mb-3 text-sm font-medium">Cắt ảnh QR</p>
      <p className="mb-3 text-xs text-ink/50">
        Kéo để di chuyển, dùng thanh trượt để phóng to/thu nhỏ sao cho mã QR vừa
        khung vuông.
      </p>

      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-ink/5">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-ink/60">Thu phóng</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-blush-400"
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Hủy
        </Button>
        <Button size="sm" onClick={handleConfirm} disabled={processing || !area}>
          {processing ? "Đang xử lý..." : "Dùng ảnh này"}
        </Button>
      </div>
    </Modal>
  );
}
