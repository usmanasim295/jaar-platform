import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1234569]{1}\d{9}$/, {
    message: 'National ID must start with 1,2,3,4,5,6, or 9 and be 10 digits long',
  })
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  service: string;
}

export class CreateRequestQueryDto {
  @IsString()
  @IsNotEmpty()
  local: string;

  @IsString()
  @IsNotEmpty()
  requestId: string;
}
