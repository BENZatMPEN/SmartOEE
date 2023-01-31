import { IsBoolean, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnalyticDto {
  @IsString()
  readonly name: string;

  @IsObject()
  readonly data: any;

  @IsBoolean()
  @Type(() => Boolean)
  readonly group: boolean;
}
