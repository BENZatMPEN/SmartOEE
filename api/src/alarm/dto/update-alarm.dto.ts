import { AlarmCondition } from '../../common/type/alarm';

export class UpdateAlarmDto {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly notify: boolean;
  readonly data: any;
  readonly siteId: number;
  readonly condition: AlarmCondition;
}
