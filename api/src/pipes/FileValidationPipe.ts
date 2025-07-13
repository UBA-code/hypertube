import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedExtensions = ['jpg', 'png', 'jpeg'];
  private readonly maxSize = 10 * 1024 * 1024; // 5MB in bytes

  transform(file: Express.Multer.File) {
    if (!file) {
      return file;
    }

    // Validate file extension
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${this.maxSize / (1024 * 1024)}MB`,
      );
    }

    return file;
  }
}
