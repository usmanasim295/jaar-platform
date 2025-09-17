import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateJobCompletionRequestDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  completionNotes: string;

  @IsString()
  @IsOptional()
  additionalDocumentUrl?: string;
}
