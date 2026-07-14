import { cn } from "@/lib/cn";

/**
 * Hai kiểu lá vẽ bằng SVG: một lá thon (kiểu liễu) và một lá bầu hơn. Thân lá
 * tô bằng currentColor để đổi màu theo từng chiếc; gân lá là nét mờ tối để tạo
 * chiều sâu.
 */
function LeafShape({ variant }: { variant: 0 | 1 }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 24 34" className="h-full w-full" aria-hidden>
        <path
          d="M12 1C4 8 4 24 12 33C20 24 20 8 12 1Z"
          fill="currentColor"
        />
        <g stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" strokeLinecap="round">
          <path d="M12 3.5V31" />
          <path d="M12 10 6.6 6.8" />
          <path d="M12 10 17.4 6.8" />
          <path d="M12 17 5.8 13.6" />
          <path d="M12 17 18.2 13.6" />
          <path d="M12 24 6.8 21" />
          <path d="M12 24 17.2 21" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 26 30" className="h-full w-full" aria-hidden>
      <path
        d="M13 1C3 5 2 18 6 27C7 29 9 29 12 28C21 25 24 12 13 1Z"
        fill="currentColor"
      />
      <g stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" strokeLinecap="round">
        <path d="M8 26 15 4" />
        <path d="M11 18 6.5 16.5" />
        <path d="M12.5 13 8 10.5" />
        <path d="M10 22 5.8 21.5" />
      </g>
    </svg>
  );
}

interface LeafConfig {
  left: number; // %
  size: number; // px
  fall: number; // giây rơi hết màn
  sway: number; // giây đung đưa
  delay: number; // độ trễ (âm để bắt đầu giữa chừng)
  color: string;
  opacity: number;
  variant: 0 | 1;
}

// Cấu hình cố định (không random) để tránh lệch giữa SSR và client.
const LEAVES: LeafConfig[] = [
  { left: 5, size: 26, fall: 9, sway: 3.2, delay: 0, color: "#C7D6B5", opacity: 0.9, variant: 0 },
  { left: 14, size: 18, fall: 12, sway: 4, delay: -3, color: "#9FB884", opacity: 0.8, variant: 1 },
  { left: 22, size: 32, fall: 8, sway: 2.8, delay: -5, color: "#B7C9A0", opacity: 0.95, variant: 0 },
  { left: 31, size: 20, fall: 11, sway: 3.6, delay: -1.5, color: "#7C9A5E", opacity: 0.85, variant: 1 },
  { left: 40, size: 24, fall: 10, sway: 3, delay: -7, color: "#DDE8CD", opacity: 0.9, variant: 0 },
  { left: 48, size: 16, fall: 13, sway: 4.4, delay: -4, color: "#9FB884", opacity: 0.75, variant: 1 },
  { left: 56, size: 30, fall: 8.5, sway: 2.6, delay: -2, color: "#C7D6B5", opacity: 0.95, variant: 0 },
  { left: 64, size: 19, fall: 11.5, sway: 3.8, delay: -6, color: "#7C9A5E", opacity: 0.8, variant: 1 },
  { left: 72, size: 27, fall: 9.5, sway: 3.1, delay: -0.8, color: "#B7C9A0", opacity: 0.9, variant: 0 },
  { left: 80, size: 17, fall: 12.5, sway: 4.2, delay: -3.5, color: "#DDE8CD", opacity: 0.8, variant: 1 },
  { left: 88, size: 29, fall: 8.8, sway: 2.9, delay: -5.5, color: "#9FB884", opacity: 0.92, variant: 0 },
  { left: 95, size: 21, fall: 10.5, sway: 3.5, delay: -2.5, color: "#C7D6B5", opacity: 0.85, variant: 1 },
  { left: 10, size: 22, fall: 10.8, sway: 3.3, delay: -8, color: "#B7C9A0", opacity: 0.8, variant: 1 },
  { left: 35, size: 15, fall: 13.5, sway: 4.6, delay: -6.5, color: "#DDE8CD", opacity: 0.7, variant: 0 },
  { left: 60, size: 23, fall: 9.8, sway: 3.4, delay: -9, color: "#9FB884", opacity: 0.88, variant: 0 },
  { left: 84, size: 18, fall: 12.2, sway: 4.1, delay: -1, color: "#7C9A5E", opacity: 0.82, variant: 1 },
];

/** Lớp lá rơi phủ toàn màn (không chắn tương tác). */
export default function FallingLeaves({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {LEAVES.map((leaf, i) => (
        <div
          key={i}
          className="absolute top-0 animate-leaf-fall motion-reduce:animate-none"
          style={{
            left: `${leaf.left}%`,
            animationDuration: `${leaf.fall}s`,
            animationDelay: `${leaf.delay}s`,
          }}
        >
          <div
            className="animate-leaf-sway motion-reduce:animate-none"
            style={{
              width: leaf.size,
              height: leaf.size,
              color: leaf.color,
              opacity: leaf.opacity,
              animationDuration: `${leaf.sway}s`,
              animationDelay: `${leaf.delay}s`,
            }}
          >
            <LeafShape variant={leaf.variant} />
          </div>
        </div>
      ))}
    </div>
  );
}
