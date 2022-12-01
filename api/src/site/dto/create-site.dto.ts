import { PercentSetting } from '../../common/type/percent-settings';

export class CreateSiteDto {
  readonly name: string;
  readonly branch: string;
  readonly address: string;
  readonly remark: string;
  readonly lat: number;
  readonly lng: number;
  readonly sync: boolean;
  readonly active: boolean;
  readonly defaultPercentSettings: PercentSetting[];
}
