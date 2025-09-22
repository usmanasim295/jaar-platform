import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  IsArray,
} from 'class-validator';
import { ChatType } from '@prisma/client';

export class CreateChatDto {
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsObject()
  name?: Record<string, any>;

  @IsOptional()
  @IsString()
  communityId?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];
}
