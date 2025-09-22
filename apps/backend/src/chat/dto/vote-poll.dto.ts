import { IsUUID, IsArray } from 'class-validator';

export class VotePollDto {
  @IsUUID()
  pollId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  optionIds: string[];
}
