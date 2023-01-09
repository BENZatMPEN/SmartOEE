import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class IdListDto {
  @IsArray()
  @Type(() => Number)
  readonly ids: number[];
}
