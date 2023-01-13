import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlannedDowntimeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly type: string;

  @IsString()
  readonly timing: string;

  @IsNumber()
  @Type(() => Number)
  readonly seconds: number;
}
