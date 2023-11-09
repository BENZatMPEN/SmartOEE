import {
  OEE_BATCH_STATUS_BREAKDOWN,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
  OEE_BATCH_STATUS_STANDBY,
} from '../constants';

export function getColor(status: string): string {
  switch (status) {
    case OEE_BATCH_STATUS_STANDBY:
      return '#FFFA00';

    case OEE_BATCH_STATUS_RUNNING:
      return '#00D000';

    case OEE_BATCH_STATUS_BREAKDOWN:
      return '#FF0000';

    case OEE_BATCH_STATUS_PLANNED:
      return '#B0B0B0';

    case OEE_BATCH_STATUS_MC_SETUP:
      return '#072EEF';

    default:
      return '#616161';
  }
}
