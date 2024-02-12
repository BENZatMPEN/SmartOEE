import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EndType, StartType } from 'src/common/enums/batchTypes';

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

  @IsNumber()
  @Type(() => Number)
  readonly productId: number;

  @IsNumber()
  @Type(() => Number)
  readonly oeeId: number;

  @IsNumber()
  @Type(() => Number)
  readonly userId: number;

  @IsEnum(StartType)
  @IsOptional()
  readonly startType?: StartType;

  @IsEnum(EndType)
  @IsOptional()
  readonly endType?: EndType;

  @IsNumber()
  @Type(() => Number)
  readonly operatorId: number;
}
