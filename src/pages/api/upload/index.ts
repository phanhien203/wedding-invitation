import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import path from "path";
import { isAdminRequest } from "@/lib/auth";
import {
  destroyCloudinaryImage,
  isCloudinaryConfigured,
  listCloudinaryImages,
  uploadToCloudinary,
} from "@/lib/cloudinary";
import { getMaxUploadBytes, isAllowedImage } from "@/lib/upload";
import type { UploadedImage } from "@/types";

export const config = {
  api: { bodyParser: false },
};

function parseForm(req: NextApiRequest) {
  const form = formidable({
    maxFileSize: getMaxUploadBytes(),
    multiples: false,
  });
  return new Promise<{ file: File }>((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const file = files.file?.[0] ?? files.file;
      if (!file) return reject(new Error("No file uploaded"));
      resolve({ file: file as File });
    });
  });
}

/** Bỏ đuôi và ký tự lạ: Cloudinary lấy chuỗi này làm public_id. */
function baseName(originalName: string): string {
  const withoutExt = path.parse(originalName || "image").name;
  return withoutExt.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60) || "image";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!["GET", "POST", "DELETE"].includes(req.method ?? "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!isCloudinaryConfigured()) {
    return res
      .status(500)
      .json({ error: "Thiếu CLOUDINARY_URL trong biến môi trường" });
  }

  try {
    if (req.method === "GET") {
      const images = await listCloudinaryImages();
      const items: UploadedImage[] = images
        .map((img) => ({
          filename: img.public_id,
          url: img.secure_url,
          size: img.bytes,
          uploadedAt: img.created_at,
        }))
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
      return res.status(200).json(items);
    }

    if (req.method === "DELETE") {
      // public_id có dấu "/" (vd "wedding/abc") nên phải đi qua query chứ không
      // nhét vào path segment được.
      const { publicId } = req.query;
      if (!publicId || typeof publicId !== "string") {
        return res.status(400).json({ error: "publicId required" });
      }
      const result = await destroyCloudinaryImage(publicId);
      if (result.result !== "ok") {
        return res.status(404).json({ error: "Không tìm thấy ảnh" });
      }
      return res.status(200).json({ success: true });
    }

    const { file } = await parseForm(req);

    if (!isAllowedImage(file.mimetype ?? "")) {
      return res.status(400).json({ error: "Only image files are allowed" });
    }

    const buffer = await fs.readFile(file.filepath);
    const uploaded = await uploadToCloudinary(
      buffer,
      baseName(file.originalFilename ?? "image")
    );
    await fs.unlink(file.filepath).catch(() => {});

    return res
      .status(200)
      .json({ url: uploaded.secure_url, filename: uploaded.public_id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(400).json({ error: message });
  }
}
