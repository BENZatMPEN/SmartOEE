import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OeeBatchPlannedDowntimeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly type: string;

  @IsString()
  readonly timing: string;

  @IsNumber()
  @Type(() => Number)
  readonly minutes: number;

  @IsNumber()
  @Type(() => Number)
  readonly oeeBatchId: number;
}
