import { v2 as cloudinary } from 'cloudinary';

export async function uploadFilesToCloudinary(
  files: Express.Multer.File[],
  folder: string,
): Promise<{ secureUrl: string; publicId: string }[]> {
  const uploadPromises = files.map((file) => {
    if (!file || !file.buffer || !file.mimetype) {
      throw new Error('Invalid file format');
    }

    const base64DataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    return cloudinary.uploader.upload(base64DataUri, {
      folder: folder,
    });
  });

  const results = await Promise.all(uploadPromises);

  return results.map((result) => ({
    secureUrl: result.secure_url,
    publicId: result.public_id,
  }));
}