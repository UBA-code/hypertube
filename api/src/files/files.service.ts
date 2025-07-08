import { ConflictException, Injectable } from '@nestjs/common';
import { File } from '@nest-lab/fastify-multer';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { v4 } from 'uuid';

@Injectable()
export class FilesService {
  async saveFile(file: File): Promise<string> {
    console.log({ ...file });
    try {
      const uploadDir = join(process.cwd(), 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const fileName = `${v4()}-${file.originalname}`;
      const uploadPath = join(uploadDir, `${fileName}`);
      console.log(`Uploading file to ${uploadPath}`);

      await writeFile(uploadPath, file.buffer);
      return `/uploads/${fileName}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('File upload failed');
    }
  }

  async saveAvatar(file: File): Promise<string> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpeg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ConflictException(
        'Invalid file type. Only jpg, jpeg, and png are allowed.',
      );
    }
    return await this.saveFile(file);
  }
}
