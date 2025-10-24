import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WebhookDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  transId: string;

  @IsString()
  @IsNotEmpty()
  requestId: string;
}

export class WebhookResponseDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  message?: string;
}
