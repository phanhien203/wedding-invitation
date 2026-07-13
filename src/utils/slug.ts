const SUFFIX_CHARS = "abcdefghijkmnpqrstuvwxyz23456789"; // bỏ ký tự dễ nhầm (l, o, 0, 1)

// Dải dấu kết hợp (combining diacritical marks) U+0300–U+036F.
const DIACRITICS = /[̀-ͯ]/g;

/** Chuyển tên (có dấu tiếng Việt) thành slug ascii, vd "Anh Nam" -> "anh-nam". */
export function slugifyName(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "khach";
}

/** Chuỗi ngẫu nhiên ngắn để link không đoán được (mặc định 5 ký tự). */
export function randomSuffix(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  }
  return out;
}
