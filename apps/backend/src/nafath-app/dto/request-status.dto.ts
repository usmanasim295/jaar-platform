import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RequestStatusDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[123456]{1}\d{9}$/, {
    message: 'National ID must start with 1,2,3,4,5, or 6 and be 10 digits long',
  })
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:\{{0,1}(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12}\}{0,1})$/, {
    message: 'Transaction ID must be a valid UUID',
  })
  transId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}$/, {
    message: 'Random must be a 2-digit number',
  })
  random: string;
}
