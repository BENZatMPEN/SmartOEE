import { AnalyticChartType, AnalyticComparisonType, AnalyticDuration, AnalyticViewType } from '../@types/analytic';
import { OeeBatch, OeeBatchStats } from '../@types/oeeBatch';
import { RoleAction, RoleSubject } from '../@types/role';
import {
  ALARM_TYPE_EMAIL,
  ALARM_TYPE_LINE,
  DEVICE_MODEL_CONNECTION_TYPE_SERIAL,
  DEVICE_MODEL_CONNECTION_TYPE_TCP,
  DEVICE_MODEL_TYPE_MODBUS,
  DEVICE_MODEL_TYPE_OPCUA,
  DOWNTIME_TIMING_AUTO,
  DOWNTIME_TIMING_MANUAL,
  DOWNTIME_TIMING_TIMER,
  DOWNTIME_TYPE_MACHINE_SETUP,
  DOWNTIME_TYPE_PLANNED,
  FAQ_PROCESS_STATUS_APPROVED,
  FAQ_PROCESS_STATUS_COMPLETED,
  FAQ_PROCESS_STATUS_ON_PROCESS,
  FAQ_PROCESS_STATUS_WAITING,
  OEE_BATCH_STATUS_BREAKDOWN,
  OEE_BATCH_STATUS_ENDED,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
  OEE_BATCH_STATUS_STANDBY,
  OEE_TAG_MC_STATE,
  OEE_TAG_OUT_A,
  OEE_TAG_OUT_BATCH_STATUS,
  OEE_TAG_OUT_BREAKING_TIME,
  OEE_TAG_OUT_CYCLE_TIME,
  OEE_TAG_OUT_OEE,
  OEE_TAG_OUT_OPERATING_TIME,
  OEE_TAG_OUT_P,
  OEE_TAG_OUT_PLANNED_DOWNTIME,
  OEE_TAG_OUT_PLANNED_QUANTITY,
  OEE_TAG_OUT_Q,
  OEE_TAG_OUT_RESET,
  OEE_TAG_OUT_TOTAL_NG,
  OEE_TAG_TOTAL,
  OEE_TAG_TOTAL_NG,
  OEE_TYPE_CONTINUOUS,
  OEE_TYPE_STANDALONE,
  PS_PROCESS_STATUS_APPROVED,
  PS_PROCESS_STATUS_COMPLETED,
  PS_PROCESS_STATUS_ON_PROCESS,
  PS_PROCESS_STATUS_WAITING,
  TIME_UNIT_MINUTE,
  TIME_UNIT_SECOND,
} from '../constants';
import { fShortDateTime } from './formatTime';

export function fTimeUnitText(timeUnit: string | undefined) {
  switch (timeUnit) {
    case TIME_UNIT_SECOND:
      return 'Second';

    case TIME_UNIT_MINUTE:
      return 'Minute';

    default:
      return '';
  }
}

export function fTimeUnitShortText(timeUnit: string | undefined) {
  switch (timeUnit) {
    case TIME_UNIT_SECOND:
      return 'sec.';

    case TIME_UNIT_MINUTE:
      return 'min.';

    default:
      return '';
  }
}

export function fBatchStatusText(oeeStatus: string) {
  switch (oeeStatus) {
    case OEE_BATCH_STATUS_STANDBY:
      return 'Standby';

    case OEE_BATCH_STATUS_RUNNING:
      return 'Running';

    case OEE_BATCH_STATUS_BREAKDOWN:
      return 'Breakdown';

    case OEE_BATCH_STATUS_MC_SETUP:
      return 'Machine Setup';

    case OEE_BATCH_STATUS_PLANNED:
      return 'Planned Downtime';

    case OEE_BATCH_STATUS_ENDED:
      return 'Ended';

    default:
      return '';
  }
}

export function fAlarmTypeText(type: string) {
  switch (type) {
    case ALARM_TYPE_EMAIL:
      return 'Email';

    case ALARM_TYPE_LINE:
      return 'Line';

    default:
      return '';
  }
}

export function fAnalyticViewTypeText(type: AnalyticViewType) {
  switch (type) {
    case 'object':
      return 'By MC';

    case 'time':
      return 'By Time';
  }
}

export function fAnalyticComparisonTypeText(type: AnalyticComparisonType) {
  switch (type) {
    case 'oee':
      return 'Machine';

    case 'product':
      return 'Product';

    case 'batch':
      return 'Lot';
  }
}

export function fAnalyticChartTypeText(type: AnalyticChartType) {
  switch (type) {
    case 'oee':
      return 'OEE Analytic';

    case 'mc':
      return 'M/C Utilization';

    case 'a':
      return 'A - Downtime';

    case 'p':
      return 'P - Performance Lost';

    case 'q':
      return 'Q - Defect';
  }
}

export function fAnalyticChartSubTypeText(name: string) {
  switch (name) {
    case 'pareto':
      return 'Pareto';

    case 'pie':
      return 'Pie';

    case 'line':
      return 'Line';

    case 'bar':
      return 'Bar';

    case 'bar_min_max':
      return 'Bar (Min-Max)';

    case 'stack':
      return 'Stack';

    default:
      return 'N/A';
  }
}

export function fAnalyticDurationText(type: AnalyticDuration) {
  switch (type) {
    case 'hourly':
      return 'Hour';

    case 'daily':
      return 'Day';

    case 'monthly':
      return 'Month';
  }
}

export function fPsProcessStatusText(status: string) {
  switch (status) {
    case PS_PROCESS_STATUS_ON_PROCESS:
      return 'On Process';

    case PS_PROCESS_STATUS_WAITING:
      return 'Waiting';

    case PS_PROCESS_STATUS_APPROVED:
      return 'Approved';

    case PS_PROCESS_STATUS_COMPLETED:
      return 'Completed';
  }
}

export function fFaqProcessStatusText(status: string) {
  switch (status) {
    case FAQ_PROCESS_STATUS_ON_PROCESS:
      return 'On Process';

    case FAQ_PROCESS_STATUS_WAITING:
      return 'Waiting';

    case FAQ_PROCESS_STATUS_APPROVED:
      return 'Approved';

    case FAQ_PROCESS_STATUS_COMPLETED:
      return 'Completed';
  }
}

export function fDowntimeTypeText(type: string) {
  switch (type) {
    case DOWNTIME_TYPE_PLANNED:
      return 'Planned Downtime';

    case DOWNTIME_TYPE_MACHINE_SETUP:
      return 'M/C Setup';
  }
}

export function fDowntimeTimingText(type: string) {
  switch (type) {
    case DOWNTIME_TIMING_AUTO:
      return 'Auto';

    case DOWNTIME_TIMING_MANUAL:
      return 'Manual';

    case DOWNTIME_TIMING_TIMER:
      return 'Timer';
  }
}

export function fDeviceModelConnectionTypeText(type: string) {
  switch (type) {
    case DEVICE_MODEL_CONNECTION_TYPE_TCP:
      return 'TCP';

    case DEVICE_MODEL_CONNECTION_TYPE_SERIAL:
      return 'Serial';
  }
}

export function fDeviceModelTypeText(type: string) {
  switch (type) {
    case DEVICE_MODEL_TYPE_MODBUS:
      return 'Modbus';

    case DEVICE_MODEL_TYPE_OPCUA:
      return 'OPC UA';
  }
}

export function fDeviceModelReadFuncText(val: number) {
  switch (val) {
    case 1:
      return '01 Read Coil Status';

    case 2:
      return '02 Read Input Status';

    case 3:
      return '03 Read Holding Registers';

    case 4:
      return '04 Read Input Registers';
  }
}

export function fDeviceModelWriteFuncText(val: number) {
  switch (val) {
    case 5:
      return '05 Force Single Coil';

    case 6:
      return '06 Preset Single Register';

    case 15:
      return '15 Force Multiple Coil';

    case 16:
      return '16 Preset Multiple Registers';
  }
}

export function fRoleSubjectText(val: string) {
  switch (val) {
    case RoleSubject.Dashboard:
      return 'Dashboard';

    case RoleSubject.Analytics:
      return 'Analytics';

    case RoleSubject.ProblemsAndSolutions:
      return 'Problems & Solutions';

    case RoleSubject.Faqs:
      return 'FAQs';

    case RoleSubject.Plannings:
      return 'Plannings';

    case RoleSubject.OeeSettings:
      return 'Settings - OEE';

    case RoleSubject.MachineSettings:
      return 'Settings - Machines';

    case RoleSubject.ProductSettings:
      return 'Settings - Products';

    case RoleSubject.DeviceSettings:
      return 'Settings - Devices';

    case RoleSubject.ModelSettings:
      return 'Settings - Models';

    case RoleSubject.PlannedDowntimeSettings:
      return 'Settings - Planned Downtimes';

    case RoleSubject.DashboardSettings:
      return 'Settings - Dashboard';

    case RoleSubject.AlarmSettings:
      return 'Settings - Alarms';

    case RoleSubject.SiteSettings:
      return 'Settings - Site';

    case RoleSubject.UserSettings:
      return 'Settings - Users';

    case RoleSubject.RoleSettings:
      return 'Settings - Roles';
  }
}

export function fRoleActionText(val: string) {
  switch (val) {
    case RoleAction.Create:
      return 'Create';

    case RoleAction.Read:
      return 'Read';

    case RoleAction.Update:
      return 'Update';

    case RoleAction.Delete:
      return 'Delete';

    case RoleAction.Approve:
      return 'Approve';
  }
}

export function fChartTitle(batch: OeeBatch | null, batchStatsTime: OeeBatchStats[], title: string = '') {
  const startDate = batch?.batchStartedDate ? fShortDateTime(batch?.batchStartedDate) : '';
  let chartTitle = `${title} ${startDate}`.trim();

  if (batch?.batchStoppedDate) {
    const endTime = fShortDateTime(batch.batchStoppedDate);
    chartTitle = `${chartTitle} - ${endTime}`;
  } else {
    if (batchStatsTime.length > 0) {
      const endTime = fShortDateTime(batchStatsTime[batchStatsTime.length - 1].timestamp);
      chartTitle = `${chartTitle} - ${endTime}`;
    }
  }

  return chartTitle;
}

export function fAnalyticChartTitle(title: string, fromDate: Date, toDate: Date) {
  return `${title} ${fShortDateTime(fromDate)} - ${fShortDateTime(toDate)}`;
}

export function fOeeTypeText(oeeType: string): string {
  switch (oeeType) {
    case OEE_TYPE_STANDALONE:
      return 'Standalone';

    case OEE_TYPE_CONTINUOUS:
      return 'Continuous';

    default:
      return '';
  }
}

export function fOeeTabLabel(key: string): string {
  switch (key) {
    case OEE_TAG_MC_STATE:
      return 'M/C State';

    case OEE_TAG_TOTAL:
      return 'Total';

    case OEE_TAG_TOTAL_NG:
      return 'Total NG';

    case OEE_TAG_OUT_BATCH_STATUS:
      return 'Batch Status (Out)';

    case OEE_TAG_OUT_RESET:
      return 'Reset (Out)';

    case OEE_TAG_OUT_OEE:
      return 'OEE (Out)';

    case OEE_TAG_OUT_A:
      return 'A% (Out)';

    case OEE_TAG_OUT_P:
      return 'P% (Out)';

    case OEE_TAG_OUT_Q:
      return 'Q% (Out)';

    case OEE_TAG_OUT_OPERATING_TIME:
      return 'Operating Time (Out)';

    case OEE_TAG_OUT_PLANNED_DOWNTIME:
      return 'Planed Downtime (Out)';

    case OEE_TAG_OUT_BREAKING_TIME:
      return 'Breakdown Time (Out)';

    case OEE_TAG_OUT_TOTAL_NG:
      return 'Total NG (Out)';

    case OEE_TAG_OUT_CYCLE_TIME:
      return 'Standard Cycle Time (Out)';

    case OEE_TAG_OUT_PLANNED_QUANTITY:
      return 'Planned Quantity (Out)';

    default:
      return '';
  }
}

export function fAnalyticMcHeaderText(key: string): string {
  switch (key) {
    case 'key':
      return '';

    case 'running':
      return 'Operating Time';

    case 'standby':
      return 'Stand By';

    case 'breakdown':
      return 'Downtime Losses';

    case 'planned':
      return 'Planned Downtime';

    case 'mc_setup':
      return 'Machine Setup';

    default:
      return key;
  }
}

export function fAnalyticOeeHeaderText(key: string): string {
  switch (key) {
    case 'key':
      return '';

    case 'name':
      return 'Lot Number';

    case 'runningSeconds':
      return 'Operating Time';

    case 'totalBreakdownSeconds':
      return 'Downtime Losses';

    case 'plannedDowntimeSeconds':
      return 'Planned Downtime';

    case 'totalCount':
      return 'Total Product';

    case 'totalAutoDefects':
      return 'Defect Product';

    case 'totalManualDefects':
      return 'Defect Product (Man)';

    case 'totalOtherDefects':
      return 'Defect Product (Other)';

    case 'totalTimeSeconds':
      return 'Total Available Time';

    case 'totalCountByBatch':
      return '';

    default:
      return key;
  }
}

export function fAnalyticOeeAHeaderText(key: string): string {
  switch (key) {
    case 'key':
      return '';

    case 'name':
      return 'Lot Number';

    case 'runningSeconds':
      return 'Operating Time';

    case 'totalBreakdownSeconds':
      return 'Downtime Losses';

    case 'plannedDowntimeSeconds':
      return 'Planned Downtime';

    case 'count':
      return 'Count';

    case 'percent':
      return 'Percent';

    default:
      return key;
  }
}

export function fAnalyticOeePHeaderText(key: string): string {
  switch (key) {
    case 'key':
      return '';

    case 'name':
      return 'Lot Number';

    case 'runningSeconds':
      return 'Operating Time';

    case 'operatingSeconds':
      return 'Operating Time';

    case 'plannedDowntimeSeconds':
      return 'Planned Downtime';

    case 'totalCount':
      return 'Total Product';

    case 'percent':
      return 'Percent';

    default:
      return key;
  }
}

export function fAnalyticOeeQHeaderText(key: string): string {
  switch (key) {
    case 'key':
      return '';

    case 'name':
      return 'Lot Number';

    case 'totalAutoDefects':
      return 'Total Auto Defect';

    case 'totalManualDefects':
      return 'Total Manual Defect';

    case 'totalCount':
      return 'Total Product';

    case 'count':
      return 'Count';

    case 'percent':
      return 'Percent';

    default:
      return key;
  }
}

export function fAnalyticOeeParetoHeaderText(key: string): string {
  switch (key) {
    case 'name':
      return 'Reason';

    case 'count':
      return 'Count';

    case 'percent':
      return 'Percent';

    default:
      return key;
  }
}
