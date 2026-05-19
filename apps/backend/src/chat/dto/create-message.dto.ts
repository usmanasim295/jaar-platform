import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { MessageType } from '@prisma/client';

export class CreateMessageDto {
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType; // Optional, defaults to TEXT for text messages

  @IsOptional()
  @IsString()
  content?: string; // Simple string, translation handled by service

  @IsOptional()
  @IsUUID()
  pollId?: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateMessageWithFileDto extends CreateMessageDto {
  // This DTO is used when uploading files
  // The file will be handled separately in the controller
}
