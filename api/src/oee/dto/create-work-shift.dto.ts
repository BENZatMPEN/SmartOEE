import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from 'src/common/entities/work-shift.entity';

export class CreateWorkShiftDto {
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsNumber()
  shiftNumber: number;

  @IsString()
  shiftName: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBoolean()
  isShiftActive: boolean;
}

export class CreateDayWorkShiftDto {
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsNumber()
  oeeId: number;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsBoolean()
  isDayActive: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkShiftDto)
  shifts: CreateWorkShiftDto[];
}