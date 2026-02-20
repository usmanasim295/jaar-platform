import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MessageService } from '../services/message.service';

@Catch(BadRequestException)
export class FileValidationFilter implements ExceptionFilter {
  constructor(private messageService: MessageService) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;
    const language = this.extractLanguage(host) || 'en';

    let message = exceptionResponse.message || 'Validation error';

    // Handle file validation errors
    if (Array.isArray(message)) {
      message = message
        .map((msg) => this.translateFileError(msg, language))
        .join(', ');
    } else if (typeof message === 'string') {
      message = this.translateFileError(message, language);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exceptionResponse.error || 'Bad Request',
    });
  }

  private extractLanguage(host: ArgumentsHost): 'en' | 'ar' | undefined {
    const request = host.switchToHttp().getRequest();
    return request.query?.lang === 'ar' ? 'ar' : 'en';
  }

  private translateFileError(
    errorMessage: string,
    language: 'en' | 'ar',
  ): string {
    const isRequired = errorMessage.toLowerCase().includes('required');
    const isInvalidType =
      errorMessage.toLowerCase().includes('type') ||
      errorMessage.toLowerCase().includes('mime');
    const isToolarLarge =
      errorMessage.toLowerCase().includes('file size') ||
      errorMessage.toLowerCase().includes('exceeds');

    if (isRequired) {
      return language === 'ar' ? 'الوثيقة مطلوبة' : 'Document is required';
    }

    if (isInvalidType) {
      return language === 'ar'
        ? 'نوع ملف غير صحيح. الأنواع المسموحة: pdf, jpg, jpeg, png, gif, doc, docx, xls, xlsx, ppt, pptx'
        : 'Invalid file type. Allowed types: pdf, jpg, jpeg, png, gif, doc, docx, xls, xlsx, ppt, pptx';
    }

    if (isToolarLarge) {
      return language === 'ar'
        ? 'حجم الملف يتجاوز الحد الأقصى 10 ميجابايت'
        : 'File size exceeds the maximum limit of 10MB';
    }

    return errorMessage;
  }
}
