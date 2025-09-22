import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class FileManagementService {
  constructor(private s3Service: S3Service) {}

  /**
   * Generate S3 key for chat files based on type and user
   */
  generateChatFileKey(
    fileType: 'images' | 'voice' | 'files' | 'documents',
    userId: string,
    originalName: string,
    chatId?: string,
  ): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'bin';
    const chatPrefix = chatId ? `chat-${chatId}` : 'general';

    return `chat-${fileType}/${chatPrefix}/${userId}/${timestamp}.${extension}`;
  }

  /**
   * Upload file to S3 with proper categorization
   */
  async uploadChatFile(
    file: Express.Multer.File,
    fileType: 'images' | 'voice' | 'files' | 'documents',
    userId: string,
    chatId?: string,
  ): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    s3Key: string;
  }> {
    const s3Key = this.generateChatFileKey(
      fileType,
      userId,
      file.originalname,
      chatId,
    );
    const s3Url = await this.s3Service.uploadFileBuffer(file, s3Key);

    return {
      fileUrl: s3Url,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      s3Key,
    };
  }

  /**
   * Delete file from S3
   */
  async deleteChatFile(s3Key: string): Promise<void> {
    await this.s3Service.deleteFile(s3Key);
  }

  /**
   * Get file type based on MIME type
   */
  getFileTypeFromMime(
    mimeType: string,
  ): 'images' | 'voice' | 'files' | 'documents' {
    if (mimeType.startsWith('image/')) {
      return 'images';
    } else if (mimeType.startsWith('audio/')) {
      return 'voice';
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')
    ) {
      return 'documents';
    } else {
      return 'files';
    }
  }

  /**
   * Validate file type and size based on message type
   */
  validateFileForMessageType(
    file: Express.Multer.File,
    messageType: 'IMAGE' | 'VOICE_NOTE' | 'FILE',
  ): { isValid: boolean; error?: string } {
    switch (messageType) {
      case 'IMAGE':
        if (!file.mimetype.startsWith('image/')) {
          return { isValid: false, error: 'File must be an image' };
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          return { isValid: false, error: 'Image file too large (max 10MB)' };
        }
        break;

      case 'VOICE_NOTE':
        if (!file.mimetype.startsWith('audio/')) {
          return { isValid: false, error: 'File must be an audio file' };
        }
        if (file.size > 20 * 1024 * 1024) {
          // 20MB
          return { isValid: false, error: 'Audio file too large (max 20MB)' };
        }
        break;

      case 'FILE':
        if (file.size > 50 * 1024 * 1024) {
          // 50MB
          return { isValid: false, error: 'File too large (max 50MB)' };
        }
        break;

      default:
        return {
          isValid: false,
          error: 'Invalid message type for file upload',
        };
    }

    return { isValid: true };
  }

  /**
   * Get file metadata for display
   */
  getFileMetadata(file: Express.Multer.File) {
    const fileType = this.getFileTypeFromMime(file.mimetype);
    const isImage = fileType === 'images';
    const isAudio = fileType === 'voice';
    const isDocument = fileType === 'documents';

    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      fileType,
      isImage,
      isAudio,
      isDocument,
      extension: file.originalname.split('.').pop()?.toLowerCase() || 'unknown',
    };
  }

  /**
   * Format file size in human readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
