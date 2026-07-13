import Image from "next/image";
import type { CSSProperties } from "react";

type Cluster = {
  top: number;
  side: "left" | "right";
  off: number;
  w: number;
  rot: number;
  flip?: boolean;
  op: number;
};

// Cùng một bông hoa nhưng biến hoá góc xoay / lật / kích cỡ / độ mờ / vị trí để
// nền đa dạng khi cuộn. Ba tầng: mảng lớn mờ (nền), cụm vừa ở mép, bông nhỏ điểm.
// Mép âm để hoa tràn ra rìa và bị cột cắt gọn — hoa chỉ nằm trong khung cột.
const CLUSTERS: Cluster[] = [
  // Tầng nền — mảng lớn, rất mờ, tràn sâu vào trong cho cảm giác "phủ".
  { top: 3, side: "right", off: -150, w: 560, rot: 10, flip: true, op: 0.3 },
  { top: 13, side: "left", off: -170, w: 600, rot: -6, op: 0.28 },
  { top: 29, side: "right", off: -190, w: 640, rot: 14, op: 0.3 },
  { top: 46, side: "left", off: -160, w: 580, rot: -12, flip: true, op: 0.26 },
  { top: 63, side: "right", off: -180, w: 620, rot: 8, flip: true, op: 0.3 },
  { top: 80, side: "left", off: -170, w: 600, rot: -9, op: 0.27 },
  { top: 94, side: "right", off: -160, w: 560, rot: 12, flip: true, op: 0.29 },

  // Tầng mép — cụm vừa, rõ hơn, ôm hai bên cột.
  { top: 1, side: "left", off: -55, w: 300, rot: -8, op: 0.8 },
  { top: 9, side: "right", off: -45, w: 260, rot: 13, flip: true, op: 0.72 },
  { top: 21, side: "left", off: -60, w: 285, rot: 17, flip: true, op: 0.78 },
  { top: 31, side: "right", off: -50, w: 305, rot: -11, op: 0.8 },
  { top: 41, side: "left", off: -55, w: 255, rot: -5, flip: true, op: 0.72 },
  { top: 53, side: "right", off: -60, w: 295, rot: 9, op: 0.78 },
  { top: 66, side: "left", off: -45, w: 275, rot: 7, op: 0.74 },
  { top: 75, side: "right", off: -55, w: 305, rot: -13, flip: true, op: 0.8 },
  { top: 87, side: "left", off: -55, w: 285, rot: 12, op: 0.76 },
  { top: 97, side: "right", off: -45, w: 295, rot: -7, flip: true, op: 0.8 },

  // Tầng điểm — bông nhỏ, xoay mạnh, nhích vào trong cột.
  { top: 17, side: "right", off: 24, w: 150, rot: 26, op: 0.7 },
  { top: 37, side: "left", off: 30, w: 140, rot: -22, flip: true, op: 0.68 },
  { top: 58, side: "right", off: 26, w: 160, rot: 20, flip: true, op: 0.7 },
  { top: 82, side: "left", off: 22, w: 138, rot: -18, op: 0.68 },
];

/**
 * Nền hoa (ảnh watercolor thật) phủ trong cột nội dung; hoa tràn ra mép sẽ bị
 * cột (overflow-hidden ở MainLayout) cắt gọn, không lan ra ngoài. Cuộn theo nội
 * dung, đặt sau nội dung (z thấp).
 */
export default function FloralBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {CLUSTERS.map((c, i) => {
        const style: CSSProperties = {
          top: `${c.top}%`,
          opacity: c.op,
          transform: `rotate(${c.rot}deg)${c.flip ? " scaleX(-1)" : ""}`,
        };
        if (c.side === "left") style.left = c.off;
        else style.right = c.off;
        return (
          <Image
            key={i}
            src="/images/flower.webp"
            alt=""
            width={c.w}
            height={c.w}
            className="absolute select-none"
            style={style}
          />
        );
      })}
    </div>
  );
}
