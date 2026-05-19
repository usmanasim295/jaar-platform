import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SendLocationMessageDto {
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty({ message: 'latitude is required' })
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 8,
    },
    { message: 'latitude must be a valid number' },
  )
  latitude: number;

  @IsNotEmpty({ message: 'longitude is required' })
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 8,
    },
    { message: 'longitude must be a valid number' },
  )
  longitude: number;
}
