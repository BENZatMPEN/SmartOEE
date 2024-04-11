import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";


export class OeeOperatorDto {
    @IsNumber()
    @Type(() => Number)
    id?: number;

    @IsString()
    readonly email: string;
}