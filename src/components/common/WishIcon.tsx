import { Flower2, Gem, Heart, Wine } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const SIZE = 39;

/** Lucide không có icon nhẫn cưới nên vẽ tay: vòng nhẫn + viên đá phía trên. */
function WeddingRing() {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="15" r="6.5" />
      <path d="M12 9.5 8 5.5h8L12 9.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Chữ Hỷ — là ký tự chứ không phải icon, nên dựng bằng text. */
function DoubleHappiness() {
  return <span className="block text-[36px] leading-none">囍</span>;
}

const solid = { fill: "currentColor", strokeWidth: 0, size: SIZE } as const;
/** Ly rượu tô đặc sẽ mất miệng và chân ly nên phải vẽ nét như chiếc nhẫn. */
const outline = { fill: "none", strokeWidth: 2, size: SIZE } as const;

const ICONS: ReactNode[] = [
  <Heart key="heart" {...solid} />,
  <Gem key="gem" {...solid} />,
  <WeddingRing key="ring" />,
  <DoubleHappiness key="hy" />,
  <Flower2 key="flower" {...solid} />,
  <Wine key="wine" {...outline} />,
];

/** Băm id để mỗi lời chúc luôn ra cùng một icon trên server lẫn client. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface WishIconProps {
  seed: string;
  className?: string;
}

/** Icon trang trí của thẻ lời chúc, mỗi thẻ một icon khác nhau. */
export default function WishIcon({ seed, className }: WishIconProps) {
  return (
    <span aria-hidden className={cn("shrink-0 text-sage-300", className)}>
      {ICONS[hash(seed) % ICONS.length]}
    </span>
  );
}
