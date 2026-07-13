import { ReactNode } from "react";
import FloralBackground from "@/components/common/FloralBackground";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    // Nền ngoài (màu khác) làm nổi bật cột nội dung ở giữa.
    <div className="min-h-screen bg-[#e7e0d4]">
      {/* Cột nội dung: màu cream + hoa, hoa tràn mép bị cắt gọn trong cột. */}
      <div className="relative mx-auto max-w-5xl overflow-hidden bg-cream shadow-[0_0_50px_rgba(93,115,81,0.12)]">
        <FloralBackground />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
