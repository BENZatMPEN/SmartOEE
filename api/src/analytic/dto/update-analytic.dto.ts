import { IsBoolean, IsObject, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAnalyticDto {
  @IsString()
  readonly name: string;

  @IsObject()
  readonly data: any;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly group: boolean;
}
