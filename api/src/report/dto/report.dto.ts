import { Type } from "class-transformer";
import { IsArray, IsDate, IsNumber, IsOptional, IsString } from "class-validator";



export class QueryReportOeeDto {

    @IsNumber()
    @Type(() => Number)
    readonly siteId: number;

    @IsString()
    readonly type: string;

    @IsArray({ message: 'Machine/Product/Lot has to be selected' })
    @Type(() => Number)
    readonly ids: number[];

    @IsString()
    readonly reportType: string;

    @IsString()
    @IsOptional()
    readonly viewType?: string;

    @IsDate()
    @Type(() => Date)
    readonly from: Date;

    @IsDate()
    @Type(() => Date)
    readonly to: Date;
}