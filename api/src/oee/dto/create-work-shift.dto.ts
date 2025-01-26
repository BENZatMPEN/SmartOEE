import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { DayOfWeek } from 'src/common/entities/work-shift.entity';


export class CreateWorkShiftDto {

  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsNumber()
  shiftNumber: number;

  @IsString()
  shiftName: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsBoolean()
  isDayActive?: boolean;

  @IsBoolean()
  isShiftActive?: boolean;

  @IsNumber()
  oeeId: number;
}