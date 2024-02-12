import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EndType, StartType } from 'src/common/enums/batchTypes';

export class ImportPlanningDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly lotNumber: string;

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

  @IsString()
  readonly productSku: string;

  @IsString()
  readonly oeeCode: string;

  @IsString()
  readonly userEmail: string;

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
