import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

/**
 * SDK tự đọc CLOUDINARY_URL từ env; gọi config() để ép dùng https và để chỗ này
 * là nơi duy nhất chạm vào cấu hình. Chỉ dùng phía server — file này giữ api
 * secret nên tuyệt đối không import vào component.
 */
cloudinary.config({ secure: true });

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "wedding";

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL || cloudinary.config().api_key);
}

export function uploadToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        // Giữ tên gốc cho dễ nhận ra trong thư viện, nhưng thêm hậu tố ngẫu
        // nhiên để hai file trùng tên không đè lên nhau.
        public_id: filename,
        unique_filename: true,
        use_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function listCloudinaryImages(max = 200) {
  const { resources } = await cloudinary.api.resources({
    type: "upload",
    prefix: `${CLOUDINARY_FOLDER}/`,
    max_results: max,
  });
  return resources as {
    public_id: string;
    secure_url: string;
    bytes: number;
    created_at: string;
  }[];
}

export async function destroyCloudinaryImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export default cloudinary;
