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
      return '#ffc107';

    case OEE_BATCH_STATUS_RUNNING:
      return '#229a16';

    case OEE_BATCH_STATUS_BREAKDOWN:
      return '#b72136';

    case OEE_BATCH_STATUS_PLANNED:
      return '#0a853e';

    case OEE_BATCH_STATUS_MC_SETUP:
      return '#ff5200';

    default:
      return '#616161';
  }
}
