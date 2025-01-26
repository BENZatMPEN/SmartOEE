import { IsNumber, IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { DayOfWeek } from 'src/common/entities/work-shift.entity';

export class UpdateWorkShiftDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsNumber()
  shiftNumber?: number;

  @IsOptional()
  @IsString()
  shiftName?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isDayActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isShiftActive?: boolean;

  @IsOptional()
  @IsNumber()
  oeeId?: number;
}

export class UpdateMultipleWorkShiftsDto {
  workShifts: UpdateWorkShiftDto[];
}