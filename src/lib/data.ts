import fs from "fs/promises";
import path from "path";
import { getDb } from "@/lib/mongodb";
import type { WeddingConfig, Rsvp, Wish, Guest } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const COLLECTION = "store";

interface StoreDoc {
  _id: string;
  data: unknown;
}

/**
 * Đọc file JSON đã commit (nguồn seed lần đầu). Read-only nên chạy được cả trên
 * Vercel; trả về null nếu thiếu/không đọc được.
 */
async function readSeedFile<T>(filename: string): Promise<T | null> {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function readStore<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const doc = await db.collection<StoreDoc>(COLLECTION).findOne({ _id: key });
  return doc ? (doc.data as T) : null;
}

async function writeStore<T>(key: string, data: T): Promise<void> {
  const db = await getDb();
  await db
    .collection<StoreDoc>(COLLECTION)
    .updateOne({ _id: key }, { $set: { data } }, { upsert: true });
}

/**
 * Ưu tiên dữ liệu trong MongoDB; nếu chưa có thì seed từ file JSON đã commit
 * (lần đầu deploy), lưu vào Mongo rồi trả về. Mọi thao tác GHI luôn vào Mongo.
 */
async function readData<T>(
  key: string,
  seedFile: string,
  fallback: T | null
): Promise<T | null> {
  const fromDb = await readStore<T>(key);
  if (fromDb !== null) return fromDb;

  const fromFile = await readSeedFile<T>(seedFile);
  if (fromFile !== null) {
    await writeStore(key, fromFile);
    return fromFile;
  }
  return fallback;
}

/**
 * Mốc timeline đời đầu chỉ có một ảnh ở field `image`. Gộp về mảng `images` ngay
 * lúc đọc để phần còn lại của app chỉ phải biết một dạng dữ liệu; bản ghi cũ tự
 * hết field `image` sau lần lưu đầu tiên trong admin.
 */
function normalizeTimeline(config: WeddingConfig): WeddingConfig {
  if (!config.timeline?.length) return config;
  return {
    ...config,
    timeline: config.timeline.map(({ image, ...item }) => ({
      ...item,
      images: item.images ?? (image ? [image] : []),
    })),
  };
}

export async function readWeddingConfig(): Promise<WeddingConfig> {
  const config =
    (await readData<WeddingConfig>("wedding", "wedding.json", null)) ??
    (await readSeedFile<WeddingConfig>("wedding.example.json"));
  if (!config) {
    throw new Error(
      "Missing wedding config: expected MongoDB 'wedding' or data/wedding.json."
    );
  }
  return normalizeTimeline(config);
}

export async function writeWeddingConfig(config: WeddingConfig): Promise<void> {
  await writeStore("wedding", config);
}

export async function readRsvps(): Promise<Rsvp[]> {
  return (await readData<Rsvp[]>("rsvp", "rsvp.json", [])) ?? [];
}

export async function writeRsvps(rsvps: Rsvp[]): Promise<void> {
  await writeStore("rsvp", rsvps);
}

export async function readWishes(): Promise<Wish[]> {
  return (await readData<Wish[]>("wishes", "wishes.json", [])) ?? [];
}

export async function writeWishes(wishes: Wish[]): Promise<void> {
  await writeStore("wishes", wishes);
}

export async function readGuests(): Promise<Guest[]> {
  return (await readData<Guest[]>("guests", "guests.json", [])) ?? [];
}

export async function writeGuests(guests: Guest[]): Promise<void> {
  await writeStore("guests", guests);
}
