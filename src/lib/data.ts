import fs from "fs/promises";
import path from "path";
import type { WeddingConfig, Rsvp, Wish } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataFile(filename: string, fallbackFile?: string) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    if (fallbackFile) {
      const fallback = path.join(DATA_DIR, fallbackFile);
      try {
        await fs.copyFile(fallback, filePath);
        return;
      } catch {
        /* use default below */
      }
    }
    if (filename === "rsvp.json") {
      await fs.writeFile(filePath, "[]", "utf-8");
    } else if (filename === "wishes.json") {
      await fs.writeFile(filePath, "[]", "utf-8");
    }
  }
}

async function readJson<T>(filename: string): Promise<T> {
  await ensureDataFile(filename);
  const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(content) as T;
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
  await ensureDataFile("wedding.json", "wedding.example.json");
  return readJson<WeddingConfig>("wedding.json");
}

export async function writeWeddingConfig(config: WeddingConfig): Promise<void> {
  await writeJson("wedding.json", config);
}

export async function readRsvps(): Promise<Rsvp[]> {
  await ensureDataFile("rsvp.json");
  return readJson<Rsvp[]>("rsvp.json");
}

export async function writeRsvps(rsvps: Rsvp[]): Promise<void> {
  await writeJson("rsvp.json", rsvps);
}

export async function readWishes(): Promise<Wish[]> {
  await ensureDataFile("wishes.json");
  return readJson<Wish[]>("wishes.json");
}

export async function writeWishes(wishes: Wish[]): Promise<void> {
  await writeJson("wishes.json", wishes);
}
