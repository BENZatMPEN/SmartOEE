import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanningDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly lotNumber: string;

  @IsString()
  @IsOptional()
  readonly color?: string;

  @IsDate()
  @Type(() => Date)
  readonly startDate: Date;

  @IsDate()
  @Type(() => Date)
  readonly endDate: Date;

  @IsNumber()
  @Type(() => Number)
  readonly plannedQuantity: number;

  @IsString()
  @IsOptional()
  readonly remark: string;

  @IsNumber()
  @Type(() => Number)
  readonly productId: number;

  @IsNumber()
  @Type(() => Number)
  readonly oeeId: number;

  @IsNumber()
  @Type(() => Number)
  readonly userId: number;
}
