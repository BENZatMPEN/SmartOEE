import { MachineParameterDto } from './machine-parameter.dto';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMachineDto {
  @IsString()
  readonly code: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly location: string;

  @IsString()
  readonly remark: string;

  @IsArray()
  @Type(() => MachineParameterDto)
  readonly parameters: MachineParameterDto[];
}
