import { FileValidator } from '@nestjs/common';

/**
 * MIME types for image uploads (profile picture, etc.).
 */
const ALLOWED_IMAGE_MIME_REGEX = /^image\/(jpeg|jpg|png|gif)$/;

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif']);

function getExtension(filename: string): string | null {
  if (!filename || typeof filename !== 'string') return null;
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return null;
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Validates image uploads by MIME type and by file extension.
 * Accepts the file if EITHER the reported MIME type is allowed OR the file extension is allowed.
 * Fixes "expected type is .(jpg|jpeg|png|gif)" errors when client sends image/jpeg etc.
 */
export class ImageFileTypeValidator extends FileValidator<
  Record<string, unknown>,
  Express.Multer.File
> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;

    const mimeOk =
      file.mimetype &&
      typeof file.mimetype === 'string' &&
      !!file.mimetype.match(ALLOWED_IMAGE_MIME_REGEX);

    if (mimeOk) return true;

    const ext = getExtension(file.originalname || '');
    if (ext && ALLOWED_EXTENSIONS.has(ext)) return true;

    return false;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    const current = file?.mimetype || file?.originalname || 'unknown';
    return `Validation failed (current file type is ${current}, allowed: jpg, jpeg, png, gif)`;
  }
}
