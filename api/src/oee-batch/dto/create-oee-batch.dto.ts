import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOeeBatchDto {
  @IsDate()
  @Type(() => Date)
  readonly startDate: Date;

  @IsDate()
  @Type(() => Date)
  readonly endDate: Date;

  @IsNumber()
  @Type(() => Number)
  readonly plannedQuantity: number;

  @IsNumber()
  @Type(() => Number)
  readonly oeeId: number;

  @IsNumber()
  @Type(() => Number)
  readonly productId: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly planningId?: number;

  @IsString()
  readonly lotNumber: string;
}
