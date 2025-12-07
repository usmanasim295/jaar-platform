import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class RequestStatusDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[123456]{1}\d{9}$/, {
    message:
      'National ID must start with 1,2,3,4,5, or 6 and be 10 digits long',
  })
  nationalId: string;

  @IsOptional()
  @IsBoolean()
  accept: boolean;
}
