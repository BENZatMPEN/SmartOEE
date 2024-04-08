import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OeeMachinePlannedDowntimeDto } from './machine-planned-downtime';

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

  @IsArray()
  @IsOptional()
  @Type(() => OeeMachinePlannedDowntimeDto)
  oeeMachinePlannedDowntime: OeeMachinePlannedDowntimeDto[];
  
}
