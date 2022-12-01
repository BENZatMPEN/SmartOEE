import { OeeProduct } from 'src/common/entities/oee-product';
import { OeeMachine } from '../../common/entities/oee-machine';
import { PercentSetting } from '../../common/type/percent-settings';
import { OeeTag } from '../../common/type/oee-tag';

export class CreateOeeDto {
  readonly oeeCode: string;
  readonly oeeType: string;
  readonly location: string;
  readonly productionName: string;
  readonly remark: string;
  readonly minorStopSeconds: number;
  readonly breakdownSeconds: number;
  readonly siteId: number;
  readonly tags: OeeTag[];
  readonly oeeProducts: OeeProduct[];
  readonly oeeMachines: OeeMachine[];
  readonly percentSettings: PercentSetting[];
  readonly useSitePercentSettings: boolean;
  readonly timeUnit: string;
}
