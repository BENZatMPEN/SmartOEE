import { IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  readonly sku: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;
}
