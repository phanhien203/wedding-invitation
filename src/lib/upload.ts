import path from "path";
import { ALLOWED_IMAGE_TYPES } from "@/constants";

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 5);
const MAX_AUDIO_MB = Number(process.env.NEXT_PUBLIC_MAX_AUDIO_MB ?? 15);

// Tên file nhạc cố định: mỗi lần upload sẽ ghi đè file này nên nhạc mới
// luôn "thay thế" nhạc cũ trong public/audio (không để lại file thừa).
const AUDIO_FILENAME = "wedding-song.mp3";

export function getMaxUploadBytes(): number {
  return MAX_UPLOAD_MB * 1024 * 1024;
}

export function getMaxAudioBytes(): number {
  return MAX_AUDIO_MB * 1024 * 1024;
}

export function isAllowedImage(mimetype: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimetype);
}

// Chỉ cho phép mp3: đuôi file phải .mp3 và mimetype hợp lệ (một số trình
// duyệt gửi octet-stream/không rõ nên vẫn chấp nhận nếu đuôi đúng).
export function isMp3(mimetype: string, originalName: string): boolean {
  if (path.extname(originalName).toLowerCase() !== ".mp3") return false;
  return (
    mimetype === "audio/mpeg" ||
    mimetype === "audio/mp3" ||
    mimetype === "application/octet-stream" ||
    mimetype === ""
  );
}

export function getAudioUploadPath(): string {
  return path.join(process.cwd(), "public", "audio", AUDIO_FILENAME);
}

export function getPublicAudioUrl(): string {
  return `/audio/${AUDIO_FILENAME}`;
}

export function createUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)
    ? ext
    : ".jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
}

export function getUploadPath(filename: string): string {
  return path.join(process.cwd(), "public", "uploads", filename);
}

export function getPublicUploadUrl(filename: string): string {
  return `/uploads/${filename}`;
}
