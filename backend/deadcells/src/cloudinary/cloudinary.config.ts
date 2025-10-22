import 'dotenv/config';
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

console.log("⚙️ CLOUDINARY CONFIG CHECK:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY ? "✅ Có" : "❌ Không có",
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "✅ Có" : "❌ Không có",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "products",
    resource_type: "image",
    allowed_formats: ["jpg", "png", "jpeg"],
  }),
});

export const CloudinaryMulter = {
  storage,
};
