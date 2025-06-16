import { v2 as cloudinary } from 'cloudinary';

interface UploadedFileInfo {
  secureUrl: string;
  publicId: string;
}

export async function uploadFilesToCloudinary(
  files: Express.Multer.File[],
  folder: string
): Promise<UploadedFileInfo[]> {
  const filesArray = Array.isArray(files) ? files : [files];

  const uploadPromises = filesArray.map((file) => {
    if (!file || !file.buffer || !file.mimetype) {
      throw new Error('Invalid file format');
    }

    const base64DataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    return cloudinary.uploader.upload(base64DataUri, {
      folder,
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      secureUrl: result.secure_url,
      publicId: result.public_id,
    }));
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('File upload failed');
  }
}

export async function uploadSingleFileToCloudinary(
  file: Express.Multer.File,
  folder: string
): Promise<UploadedFileInfo> {
  const [result] = await uploadFilesToCloudinary([file], folder);
  return result;
}

export const uploadSummaryPdf = async (file: Express.Multer.File, folder: string) => {
  if (!file || !file.buffer || !file.mimetype) {
    throw new Error("Invalid file");
  }

  if (file.mimetype !== 'application/pdf') {
    throw new Error("Only PDF files allowed for summary upload");
  }

  const base64DataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const uploadResult = await cloudinary.uploader.upload(base64DataUri, {
    folder,
    resource_type: 'raw',
  });

  return {
    secureUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };
};
