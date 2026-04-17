import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

/** One answered question under a service (nested payload). */
export class CreateJobQuestionAnswerDto {
  @IsUUID('4', { message: 'Each question ID must be a valid UUID' })
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Answer is required' })
  answer: string;
}

/** A service on the job with its question answers (questions optional for HOME_SERVICE/COMMUNITY_SERVICE). */
export class CreateJobServiceWithQuestionsDto {
  @IsUUID('4', { message: 'Service ID must be a valid UUID' })
  @IsNotEmpty()
  id: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateJobQuestionAnswerDto)
  questions?: CreateJobQuestionAnswerDto[];
}
