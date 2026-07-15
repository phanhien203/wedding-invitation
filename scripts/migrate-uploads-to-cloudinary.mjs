/**
 * Đẩy ảnh đang nằm ở public/uploads lên Cloudinary rồi ghi lại URL trong config
 * (MongoDB). Chỉ động tới ảnh thật sự đang được tham chiếu; file rác bỏ qua.
 *
 *   node scripts/migrate-uploads-to-cloudinary.mjs          # chạy khô, không ghi
 *   node scripts/migrate-uploads-to-cloudinary.mjs --apply  # ghi thật
 */
import fs from "fs";
import path from "path";

for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const APPLY = process.argv.includes("--apply");
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "wedding";
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const { v2: cloudinary } = await import("cloudinary");
const { MongoClient } = await import("mongodb");
cloudinary.config({ secure: true });

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const store = client.db(process.env.MONGODB_DB ?? "wedding").collection("store");

const doc = await store.findOne({ _id: "wedding" });
if (!doc) throw new Error("Không thấy config 'wedding' trong MongoDB");
const config = doc.data;

/** Mọi chỗ một URL ảnh có thể xuất hiện trong config. */
function collectRefs(cfg) {
  const refs = new Set();
  const add = (u) => typeof u === "string" && u.startsWith("/uploads/") && refs.add(u);
  cfg.gallery?.forEach(add);
  cfg.timeline?.forEach((t) => t.images?.forEach(add));
  add(cfg.bride?.photo);
  add(cfg.groom?.photo);
  add(cfg.gift?.qrImage);
  return [...refs];
}

const refs = collectRefs(config);
console.log(`Ảnh /uploads/ đang được tham chiếu: ${refs.length}`);

const missing = refs.filter(
  (u) => !fs.existsSync(path.join(UPLOADS_DIR, path.basename(u)))
);
if (missing.length) {
  console.log(`\n⚠ ${missing.length} ảnh được tham chiếu nhưng KHÔNG có file:`);
  missing.forEach((u) => console.log(`   ${u}`));
}

const todo = refs.filter((u) => !missing.includes(u));
const map = {};

for (const url of todo) {
  const filePath = path.join(UPLOADS_DIR, path.basename(url));
  if (!APPLY) {
    const kb = (fs.statSync(filePath).size / 1024).toFixed(0);
    console.log(`  [khô] ${url}  (${kb} KB)`);
    continue;
  }
  const buffer = fs.readFileSync(filePath);
  const uploaded = await new Promise((res, rej) => {
    const s = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: "image",
        public_id: path.parse(filePath).name.replace(/[^a-zA-Z0-9-_]/g, "-"),
        unique_filename: true,
        use_filename: true,
        overwrite: false,
      },
      (e, r) => (e || !r ? rej(e) : res(r))
    );
    s.end(buffer);
  });
  map[url] = uploaded.secure_url;
  console.log(`  ✓ ${url}\n    → ${uploaded.secure_url}`);
}

if (!APPLY) {
  console.log("\nChạy khô — chưa upload và chưa ghi DB.");
  console.log("Muốn làm thật: node scripts/migrate-uploads-to-cloudinary.mjs --apply");
  await client.close();
  process.exit(0);
}

/** Thay URL cũ bằng URL Cloudinary ở đúng những chỗ đã quét. */
const swap = (u) => (typeof u === "string" && map[u]) || u;
const next = {
  ...config,
  gallery: config.gallery?.map(swap),
  timeline: config.timeline?.map((t) => ({
    ...t,
    ...(t.images ? { images: t.images.map(swap) } : {}),
  })),
  bride: { ...config.bride, photo: swap(config.bride?.photo) },
  groom: { ...config.groom, photo: swap(config.groom?.photo) },
  gift: { ...config.gift, qrImage: swap(config.gift?.qrImage) },
};

await store.updateOne({ _id: "wedding" }, { $set: { data: next } });
console.log(`\nĐã cập nhật config: ${Object.keys(map).length} URL được thay.`);

const left = collectRefs(next);
console.log(
  left.length
    ? `⚠ Còn ${left.length} link /uploads/ chưa chuyển: ${left.join(", ")}`
    : "✓ Không còn link /uploads/ nào trong config."
);

await client.close();
