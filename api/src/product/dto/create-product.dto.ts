import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  readonly sku: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;
}
