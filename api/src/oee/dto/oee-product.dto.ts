import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OeeProductDto {
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsNumber()
  @Type(() => Number)
  oeeId: number;

  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Type(() => Number)
  standardSpeedSeconds: number;
}
