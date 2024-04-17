import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class StatusOeeDto {
  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;

  @IsNumber()
  @Type(() => Number)
  readonly userId: number;
}