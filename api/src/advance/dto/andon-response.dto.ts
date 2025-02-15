import { AndonColumnEntity } from 'src/common/entities/andon-column.entity';
import { OeeStatusItem } from 'src/common/type/oee-status';

export class AndonResponse {
  running: number;
  breakdown: number;
  ended: number;
  standby: number;
  mcSetup: number;
  oeeGroups: OeeGroup[];
  columns: AndonColumnEntity[];
}

export class OeeGroup {
  groupName: string;
  oee: OeeStatusItem;
}
