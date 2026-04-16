import { IsString, IsOptional } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
