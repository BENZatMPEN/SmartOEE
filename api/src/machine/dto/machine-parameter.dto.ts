import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MachineParameterDto {
  @IsNumber()
  @Type(() => Number)
  readonly id?: number;

  @IsString()
  readonly name: string;

  @IsString()
  readonly oeeType: string;

  @IsNumber()
  @Type(() => Number)
  readonly deviceId?: number;

  @IsNumber()
  @Type(() => Number)
  readonly tagId?: number;

  @IsNumber()
  @Type(() => Number)
  readonly machineId: number;
}
