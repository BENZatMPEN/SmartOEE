import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class OeeMachinePlannedDowntimeDto {
    @IsNumber()
    @Type(() => Number)
    id?: number;

    @IsNumber()
    @Type(() => Number)
    plannedDownTimeId?: number;

    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    fixTime: boolean;

    @IsDate()
    @Type(() => Date)
    readonly startDate: Date;

    @IsDate()
    @Type(() => Date)
    readonly endDate: Date;
}