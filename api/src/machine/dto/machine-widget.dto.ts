import { Widget } from '../../common/entities/widget';

export class MachineWidgetDto {
  readonly machineId: number;
  readonly widgets: Widget[];
}
