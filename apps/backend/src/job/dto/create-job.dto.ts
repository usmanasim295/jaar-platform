import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ArrayMinSize,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { CreateJobServiceWithQuestionsDto } from './job-service-questions.dto';

export enum JobType {
  HOME_SERVICE = 'HOME_SERVICE',
  COMMUNITY_SERVICE = 'COMMUNITY_SERVICE',
  RFQ = 'RFQ',
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  description: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one service is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateJobServiceWithQuestionsDto)
  services: CreateJobServiceWithQuestionsDto[];

  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;

  @IsString()
  @IsOptional()
  timeSlot?: string;

  @IsString()
  @IsOptional()
  workDuration?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @IsEnum(JobType, {
    message: 'Job type must be either HOME_SERVICE or COMMUNITY_SERVICE',
  })
  @IsNotEmpty({ message: 'Job type is required' })
  jobType: JobType;

  @IsUUID()
  @IsOptional()
  apartmentId?: string; // Optional for home owners, required for community service
}
