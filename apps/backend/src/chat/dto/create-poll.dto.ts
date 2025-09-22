import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreatePollOptionDto {
  @IsString()
  text: string; // Simple string, translation handled by service
}

export class CreatePollDto {
  @IsString()
  question: string; // Simple string, translation handled by service

  @IsArray()
  options: CreatePollOptionDto[];

  @IsOptional()
  @IsBoolean()
  isMultipleChoice?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  communityId?: string;

  @IsOptional()
  @IsString()
  chatId?: string;
}
