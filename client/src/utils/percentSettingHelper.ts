import { PercentSetting } from '../@types/percentSetting';
import { Site } from '../@types/site';
import { initialPercentSettings } from '../constants';

export function getPercentSettingsByType(
  site: Site | null,
  oeePercentSettings: PercentSetting[],
  useSitePercentSettings: boolean,
  type: string,
): { high: number; medium: number; low: number } {
  const percentSetting = (
    (useSitePercentSettings ? site?.defaultPercentSettings : oeePercentSettings) || initialPercentSettings
  ).filter((item) => item.type === type)[0];

  return {
    high: percentSetting.settings.high,
    medium: percentSetting.settings.medium,
    low: percentSetting.settings.low,
  };
}
