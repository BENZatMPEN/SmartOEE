import { MachineParameterDto } from './machine-parameter.dto';

export class CreateMachineDto {
  readonly code: string;
  readonly name: string;
  readonly location: string;
  readonly remark: string;
  readonly siteId: number;
  readonly parameters: MachineParameterDto[];
}
