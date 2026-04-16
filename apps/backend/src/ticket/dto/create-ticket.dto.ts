import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { TicketCategory, TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Ticket title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Ticket description is required' })
  description: string;

  @IsEnum(TicketCategory, {
    message: 'Category must be MAINTENANCE, COMPLAINT, or GENERAL_REQUEST',
  })
  @IsOptional()
  category?: TicketCategory;

  @IsEnum(TicketPriority, {
    message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT',
  })
  @IsOptional()
  priority?: TicketPriority;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsUUID()
  @IsOptional()
  hoaId?: string;
}
