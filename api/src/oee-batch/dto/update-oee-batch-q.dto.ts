import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOeeBatchQDto {
  @IsNumber()
  @Type(() => Number)
  readonly id: number;

  @IsNumber()
  @Type(() => Number)
  readonly manualAmount: number;
}
