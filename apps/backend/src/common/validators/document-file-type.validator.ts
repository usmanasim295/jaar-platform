import { FileValidator } from '@nestjs/common';

/**
 * Allowed MIME types for document uploads (signup, etc.).
 * Must match what we allow by extension so that MIME-based validation accepts them.
 */
const ALLOWED_MIME_REGEX =
  /^(application\/pdf|image\/(jpeg|jpg|png|gif)|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/;

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
]);

function getExtension(filename: string): string | null {
  if (!filename || typeof filename !== 'string') return null;
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return null;
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Validates uploads by MIME type and by file extension.
 * Accepts the file if EITHER the reported MIME type is allowed OR the file extension is allowed.
 * This ensures .doc and other types work even when the client sends application/octet-stream
 * or when magic-number detection fails.
 */
export class DocumentFileTypeValidator extends FileValidator<
  Record<string, unknown>,
  Express.Multer.File
> {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;

    const mimeOk =
      file.mimetype &&
      typeof file.mimetype === 'string' &&
      !!file.mimetype.match(ALLOWED_MIME_REGEX);

    if (mimeOk) return true;

    const ext = getExtension(file.originalname || '');
    if (ext && ALLOWED_EXTENSIONS.has(ext)) return true;

    return false;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    const current = file?.mimetype || file?.originalname || 'unknown';
    return `Validation failed (current file type is ${current}, allowed: pdf, jpg, jpeg, png, gif, doc, docx, xls, xlsx, ppt, pptx)`;
  }
}
