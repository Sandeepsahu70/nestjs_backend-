// src/modules/auth/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      console.log('➡️ Multer destination callback triggered');
      const uploadPath = './uploads/profiles';
      if (!existsSync(uploadPath)) {
        console.log(`📁 Upload folder does not exist. Creating: ${uploadPath}`);
        mkdirSync(uploadPath, { recursive: true });
      } else {
        console.log(`📁 Upload folder exists: ${uploadPath}`);
      }
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      console.log('➡️ Multer filename callback triggered');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `profile-${uniqueSuffix}${ext}`;
      console.log(`📝 Generated filename: ${filename}`);
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    console.log('➡️ Multer fileFilter triggered');
    console.log(`📄 File mime type: ${file.mimetype}, original name: ${file.originalname}`);
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      console.error('❌ File type not allowed');
      return callback(new Error('Only image files are allowed!'), false);
    }
    console.log('✅ File type allowed');
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
};
