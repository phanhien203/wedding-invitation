import fs from "fs/promises";
import path from "path";
import type { WeddingConfig, Rsvp, Wish } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Read a JSON file from the data dir. Returns null if it is missing or
 * unreadable — callers decide the fallback. On serverless hosts (Vercel) the
 * filesystem is read-only, so we never try to create files on read.
 */
async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export async function readWeddingConfig(): Promise<WeddingConfig> {
  const config =
    (await readJsonFile<WeddingConfig>("wedding.json")) ??
    (await readJsonFile<WeddingConfig>("wedding.example.json"));
  if (!config) {
    throw new Error(
      "Missing wedding config: expected data/wedding.json (or data/wedding.example.json)."
    );
  }
  return config;
}

export async function writeWeddingConfig(config: WeddingConfig): Promise<void> {
  await writeJson("wedding.json", config);
}

export async function readRsvps(): Promise<Rsvp[]> {
  return (await readJsonFile<Rsvp[]>("rsvp.json")) ?? [];
}

export async function writeRsvps(rsvps: Rsvp[]): Promise<void> {
  await writeJson("rsvp.json", rsvps);
}

export async function readWishes(): Promise<Wish[]> {
  return (await readJsonFile<Wish[]>("wishes.json")) ?? [];
}

export async function writeWishes(wishes: Wish[]): Promise<void> {
  await writeJson("wishes.json", wishes);
}
