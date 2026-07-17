import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface DownloadButtonProps {
  /** Đường dẫn ảnh cần tải (có thể là URL Cloudinary cross-origin). */
  url: string;
  /** Tên file khi lưu về máy. */
  filename?: string;
  label?: string;
}

export default function DownloadButton({
  url,
  filename = "qr-chuyen-khoan.png",
  label = "Tải mã QR",
}: DownloadButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleDownload = async () => {
    if (status === "loading") return;
    setStatus("loading");
    try {
      // Ảnh QR thường ở khác domain (Cloudinary) nên thuộc tính `download` của
      // thẻ <a> bị bỏ qua — phải tải blob rồi mới ép lưu về máy.
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      // Fallback: nếu fetch bị chặn thì mở ảnh ở tab mới để người dùng tự lưu.
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("idle");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={status === "loading"}
      className="gap-1.5 whitespace-nowrap"
    >
      {status === "loading" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : status === "done" ? (
        <Check size={14} />
      ) : (
        <Download size={14} />
      )}
      {status === "done" ? "Đã tải" : label}
    </Button>
  );
}
