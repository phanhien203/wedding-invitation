import path from "path";
import { ALLOWED_IMAGE_TYPES } from "@/constants";

const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 5);

export function getMaxUploadBytes(): number {
  return MAX_UPLOAD_MB * 1024 * 1024;
}

export function isAllowedImage(mimetype: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimetype);
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
