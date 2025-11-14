import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UserStatsQueryDto {
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'yearly'])
  filter?: 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  lang?: string;
}
