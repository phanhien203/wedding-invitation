import axios from "axios";
import type { WeddingConfig, Rsvp, Wish } from "@/types";

const api = axios.create({ baseURL: "/api" });

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

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string }>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function deleteImage(filename: string): Promise<void> {
  await api.delete(`/upload/${filename}`);
}

export async function submitRsvp(
  payload: Omit<Rsvp, "id" | "createdAt">
): Promise<Rsvp> {
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
