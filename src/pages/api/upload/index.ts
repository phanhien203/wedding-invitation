import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import { isAdminRequest } from "@/lib/auth";
import {
  createUniqueFilename,
  getMaxUploadBytes,
  getPublicUploadUrl,
  getUploadPath,
  isAllowedImage,
} from "@/lib/upload";

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
    const { file } = await parseForm(req);

    if (!isAllowedImage(file.mimetype ?? "")) {
      return res.status(400).json({ error: "Only image files are allowed" });
    }

    const filename = createUniqueFilename(file.originalFilename ?? "image.jpg");
    const dest = getUploadPath(filename);
    await fs.copyFile(file.filepath, dest);
    await fs.unlink(file.filepath).catch(() => {});

    return res.status(200).json({ url: getPublicUploadUrl(filename), filename });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return res.status(400).json({ error: message });
  }
}
