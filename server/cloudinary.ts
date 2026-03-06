import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a base64 or URL image to Cloudinary
 * Returns the secure URL and public_id
 */
export async function uploadToCloudinary(
  source: string, // base64 data URI or remote URL
  options: {
    folder?: string;
    publicId?: string;
    transformation?: object[];
  } = {}
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(source, {
    folder: options.folder ?? "vaultgenesis",
    public_id: options.publicId,
    transformation: options.transformation ?? [
      { width: 400, height: 400, crop: "fill", gravity: "center" },
      { quality: "auto", fetch_format: "auto" },
    ],
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
