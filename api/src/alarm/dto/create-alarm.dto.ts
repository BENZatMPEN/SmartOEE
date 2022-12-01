import { AlarmCondition } from '../../common/type/alarm';

export class CreateAlarmDto {
  readonly name: string;
  readonly type: string;
  readonly notify: boolean;
  readonly data: any;
  readonly siteId: number;
  readonly condition: AlarmCondition;
}
