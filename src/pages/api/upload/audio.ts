import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import path from "path";
import { isAdminRequest } from "@/lib/auth";
import {
  getAudioUploadPath,
  getMaxAudioBytes,
  getPublicAudioUrl,
  isMp3,
} from "@/lib/upload";

export const config = {
  api: { bodyParser: false },
};

function parseForm(req: NextApiRequest) {
  const form = formidable({
    maxFileSize: getMaxAudioBytes(),
    multiples: false,
  });
  return new Promise<{ file: File; previous: string }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const file = files.file?.[0] ?? files.file;
      if (!file) return reject(new Error("No file uploaded"));
      const prev = fields.previous?.[0] ?? fields.previous ?? "";
      resolve({ file: file as File, previous: String(prev) });
    });
  });
}

// Xoá file nhạc cũ trong public/audio (nếu có) để thật sự thay thế. Chỉ xử lý
// đường dẫn nội bộ /audio/... và không đụng tới file cố định vừa ghi đè.
async function removePreviousAudio(previous: string) {
  if (!previous || !previous.startsWith("/audio/")) return;
  const base = path.basename(previous.split("?")[0]);
  if (!base || base.includes("..") || base === path.basename(getAudioUploadPath())) {
    return;
  }
  const target = path.join(process.cwd(), "public", "audio", base);
  await fs.unlink(target).catch(() => {});
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { file, previous } = await parseForm(req);

    if (!isMp3(file.mimetype ?? "", file.originalFilename ?? "")) {
      return res.status(400).json({ error: "Chỉ chấp nhận file mp3" });
    }

    // Ghi đè lên file nhạc cố định để thay thế nhạc cũ trong public/audio.
    const dest = getAudioUploadPath();
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(file.filepath, dest);
    await fs.unlink(file.filepath).catch(() => {});

    // Dọn file nhạc cũ nếu nó có tên khác file cố định vừa ghi.
    await removePreviousAudio(previous);

    // Thêm ?v= để phá cache trình duyệt vì tên file không đổi.
    const url = `${getPublicAudioUrl()}?v=${Date.now()}`;
    return res.status(200).json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(400).json({ error: message });
  }
}
