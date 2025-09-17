import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum JobCompletionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateJobCompletionRequestDto {
  @IsEnum(JobCompletionRequestStatus)
  status: JobCompletionRequestStatus;

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
