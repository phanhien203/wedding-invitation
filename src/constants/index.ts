/** Giới hạn độ dài lời chúc, chặn ở cả form lẫn API. */
export const MAX_WISH_LENGTH = 5000;

/** Giới hạn tên khách tự điền khi xác nhận từ thiệp chung. */
export const MAX_RSVP_NAME_LENGTH = 60;

/** Số ảnh tối đa cho một mốc trong câu chuyện tình yêu. */
export const MAX_TIMELINE_PHOTOS = 10;

/** Giới hạn dung lượng ảnh upload; form chặn sớm, API chặn thật. */
export const MAX_UPLOAD_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 5);
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav"] as const;

export const ADMIN_COOKIE = "admin_session";

export const MUSIC_STORAGE_KEY = "wedding-music-state";
