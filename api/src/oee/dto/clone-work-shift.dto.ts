import { Type } from "class-transformer";
import {
  IsNumber,
  IsEnum,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { DayOfWeek } from "src/common/entities/work-shift.entity";

export class CloneWorkShiftDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayWorkShift)
  workShifts: DayWorkShift[];

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  oeeIds: number[];
}

export class DayWorkShift {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsBoolean()
  isDayActive: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkShift)
  shifts: WorkShift[];
}

export class WorkShift {
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