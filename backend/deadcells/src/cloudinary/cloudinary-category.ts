import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories',
    resource_type: 'image' as const,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 400, height: 400, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  } as any,
});

export const uploadCategoryImage = storage;
