import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'absensi_kamera', // Nama folder di dashboard Cloudinary lu
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const uploadCloud = multer({ 
  storage: storage,
  limits: { 
    fileSize: 16 * 4080 * 4080 // 4MB (Jangan lebih dari 4.5MB karena Vercel bakal nge-kill request lu!)
  } 
});

export default uploadCloud;