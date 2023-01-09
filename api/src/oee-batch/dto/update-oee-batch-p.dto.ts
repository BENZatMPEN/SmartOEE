import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOeeBatchPDto {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @IsNumber()
  @Type(() => Number)
  readonly machineId: number;

  @IsNumber()
  @Type(() => Number)
  readonly machineParameterId: number;

  @IsNumber()
  @Type(() => Number)
  readonly tagId: number;
}
