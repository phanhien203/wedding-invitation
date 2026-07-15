import type { WeddingSide } from "@/types";

/**
 * Nhà của khách để hiển thị thiệp: chỉ khách được đánh dấu nhà gái mới xem
 * thông tin tiệc nhà gái; còn lại (kể cả thiệp mặc định không có param) đều
 * xem tiệc nhà trai.
 */
export function resolveSide(side: WeddingSide | null | undefined): WeddingSide {
  return side === "bride" ? "bride" : "groom";
}
