import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OeeMachineDto {
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsNumber()
  @Type(() => Number)
  oeeId: number;

  @IsNumber()
  @Type(() => Number)
  machineId: number;
}
