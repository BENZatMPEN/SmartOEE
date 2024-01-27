import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  readonly sku: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  readonly activePcs: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly pscGram: number;
}
