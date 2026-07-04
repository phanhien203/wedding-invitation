export const SOCIAL_LINKS = [
  { platform: "Facebook", url: "https://facebook.com" },
  { platform: "Instagram", url: "https://instagram.com" },
] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav"] as const;

export const ADMIN_COOKIE = "admin_session";

export const MUSIC_STORAGE_KEY = "wedding-music-state";
