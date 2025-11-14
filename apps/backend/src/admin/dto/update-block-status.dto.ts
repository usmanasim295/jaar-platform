import { IsBoolean } from 'class-validator';

export class UpdateBlockStatusDto {
  @IsBoolean()
  isBlocked: boolean;
}
