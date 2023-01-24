import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePlanningDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly lotNumber: string;

  @IsString()
  readonly color: string;

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

  @IsBoolean()
  @Type(() => Boolean)
  readonly allDay: boolean;

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
