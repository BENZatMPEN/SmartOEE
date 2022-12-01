export class MachineParameterDto {
  readonly id: number;
  readonly name: string;
  readonly oeeType: string;
  readonly deviceId?: number;
  readonly tagId?: number;
  readonly machineId: number;
}
