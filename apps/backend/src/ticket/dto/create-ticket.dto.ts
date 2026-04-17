import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Ticket title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Ticket description is required' })
  description: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId: string;

  @IsEnum(TicketPriority, {
    message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT',
  })
  @IsOptional()
  priority?: TicketPriority;

  @IsUUID()
  @IsOptional()
  hoaId?: string;
}
