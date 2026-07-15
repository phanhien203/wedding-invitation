import axios from "axios";
import type {
  WeddingConfig,
  Rsvp,
  UploadedImage,
  Wish,
  Guest,
  WeddingSide,
  Attendance,
} from "@/types";

const api = axios.create({ baseURL: "/api" });

/**
 * API trả lỗi dạng { error: "..." }, còn axios chỉ ném "Request failed with
 * status code 400" — vô nghĩa với người dùng. Lôi message thật ra để hiện.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { error?: string } | undefined)
      ?.error;
    if (detail) return detail;
  }
  return fallback;
}

export async function fetchWeddingConfig(): Promise<WeddingConfig> {
  const { data } = await api.get<WeddingConfig>("/wedding");
  return data;
}

export async function updateWeddingConfig(
  config: WeddingConfig
): Promise<WeddingConfig> {
  const { data } = await api.put<WeddingConfig>("/wedding", config);
  return data;
}

export async function geocodeMapUrl(
  url: string
): Promise<{ lat: number; lng: number }> {
  const { data } = await api.get<{ lat: number; lng: number }>("/geocode", {
    params: { url },
  });
  return data;
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string }>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function fetchUploads(): Promise<UploadedImage[]> {
  const { data } = await api.get<UploadedImage[]>("/upload");
  return data;
}

/** `publicId` là id Cloudinary (có dấu "/") nên truyền qua query, không qua path. */
export async function deleteImage(publicId: string): Promise<void> {
  await api.delete("/upload", { params: { publicId } });
}

export async function uploadAudio(
  file: File,
  previous?: string
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  if (previous) form.append("previous", previous);
  const { data } = await api.post<{ url: string }>("/upload/audio", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function submitRsvp(payload: {
  /** Thiệp mời riêng. Không có thì phải kèm `name` (thiệp chung). */
  slug?: string;
  name?: string;
  attendance: Attendance;
  guests: number;
  message?: string;
}): Promise<Rsvp> {
  const { data } = await api.post<Rsvp>("/rsvp", payload);
  return data;
}

export async function fetchRsvps(): Promise<Rsvp[]> {
  const { data } = await api.get<Rsvp[]>("/rsvp");
  return data;
}

export async function deleteRsvp(id: string): Promise<void> {
  await api.delete(`/rsvp/${id}`);
}

export async function submitWish(
  payload: Omit<Wish, "id" | "createdAt">
): Promise<Wish> {
  const { data } = await api.post<Wish>("/wishes", payload);
  return data;
}

export async function fetchWishes(): Promise<Wish[]> {
  const { data } = await api.get<Wish[]>("/wishes");
  return data;
}

export async function deleteWish(id: string): Promise<void> {
  await api.delete(`/wishes/${id}`);
}

export async function setWishHidden(
  id: string,
  hidden: boolean
): Promise<Wish> {
  const { data } = await api.patch<Wish>(`/wishes/${id}`, { hidden });
  return data;
}

export async function fetchGuests(): Promise<Guest[]> {
  const { data } = await api.get<Guest[]>("/guests");
  return data;
}

export async function createGuest(payload: {
  name: string;
  note?: string;
  side?: WeddingSide;
}): Promise<Guest> {
  const { data } = await api.post<Guest>("/guests", payload);
  return data;
}

export async function updateGuest(
  id: string,
  payload: { name?: string; note?: string; side?: WeddingSide }
): Promise<Guest> {
  const { data } = await api.put<Guest>(`/guests/${id}`, payload);
  return data;
}

export async function deleteGuest(id: string): Promise<void> {
  await api.delete(`/guests/${id}`);
}

export async function adminLogin(password: string): Promise<void> {
  await api.post("/admin/login", { password });
}

export async function adminLogout(): Promise<void> {
  await api.post("/admin/logout");
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const { data } = await api.get<{ authenticated: boolean }>("/admin/me");
    return data.authenticated;
  } catch {
    return false;
  }
}
