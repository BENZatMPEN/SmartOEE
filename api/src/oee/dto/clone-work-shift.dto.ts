import { Type } from "class-transformer";
import { IsNumber, IsEnum, IsString, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { DayOfWeek } from "src/common/entities/work-shift.entity";

export class CloneWorkShiftDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkShift)
    workShifts: WorkShift[];

    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    oeeIds: number[];
}

class WorkShift {
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
}