import { IsNumber, IsString, ValidateNested, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AndonUpdateColumnReqDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AndonDetailDto)
    andonColumns: AndonDetailDto[];

    @IsNumber()
    siteId: number;
}

export class AndonDetailDto {
    @IsNumber()
    id: number;

    @IsString()
    columnName: string;

    @IsOptional()
    @IsString()
    columnValue: string;

    @IsNumber()
    columnOrder: number;

    @IsBoolean()
    deleted: boolean;
}