import { ReactNode } from "react";
import FloralBackground from "@/components/common/FloralBackground";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    // Nền ngoài (xanh đậm hơn) làm nổi bật cột nội dung ở giữa.
    <div className="min-h-screen bg-[#d8e2c9]">
      {/* Cột nội dung: nền xanh nhạt + hoa, hoa tràn mép bị cắt gọn trong cột. */}
      <div className="relative mx-auto max-w-5xl overflow-hidden bg-sage-50 shadow-[0_0_50px_rgba(93,115,81,0.12)]">
        <FloralBackground />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
