// src/common/interceptors/upload.interceptor.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 } from 'uuid';

/**
 * UploadInterceptor is a custom interceptor that handles file uploads using Multer.
 * It generates a unique filename for each uploaded file and stores it in the 'uploads' directory.
 */
export function UploadInterceptor(fieldName: string) {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${v4()}${ext}`);
      },
    }),
  });
}
