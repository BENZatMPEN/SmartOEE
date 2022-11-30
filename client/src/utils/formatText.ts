import { AnalyticChartType, AnalyticComparisonType, AnalyticDuration, AnalyticViewType } from '../@types/analytic';
import { Oee } from '../@types/oee';
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
  PS_PROCESS_STATUS_APPROVED,
  PS_PROCESS_STATUS_COMPLETED,
  PS_PROCESS_STATUS_ON_PROCESS,
  PS_PROCESS_STATUS_WAITING,
  TIME_UNIT_MINUTE,
  TIME_UNIT_SECOND,
} from '../constants';
import { fShortDateTime } from './formatTime';

export function getTimeUnitText(timeUnit: string | undefined) {
  switch (timeUnit) {
    case TIME_UNIT_SECOND:
      return 'Second';

    case TIME_UNIT_MINUTE:
      return 'Minute';

    default:
      return '';
  }
}

export function getTimeUnitShortText(timeUnit: string | undefined) {
  switch (timeUnit) {
    case TIME_UNIT_SECOND:
      return 'sec.';

    case TIME_UNIT_MINUTE:
      return 'min.';

    default:
      return '';
  }
}

export function getBatchStatus(oeeStatus: string) {
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

export function getAlarmType(type: string) {
  switch (type) {
    case ALARM_TYPE_EMAIL:
      return 'Email';

    case ALARM_TYPE_LINE:
      return 'Line';

    default:
      return '';
  }
}

export function getAnalyticViewTypeText(type: AnalyticViewType) {
  switch (type) {
    case 'object':
      return 'By MC';

    case 'time':
      return 'By Time';
  }
}

export function getAnalyticComparisonTypeText(type: AnalyticComparisonType) {
  switch (type) {
    case 'oee':
      return 'Machine';

    case 'product':
      return 'Product';

    case 'batch':
      return 'Lot';
  }
}

export function getAnalyticChartTypeText(type: AnalyticChartType) {
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

export function getAnalyticChartSubTypeText(name: string) {
  switch (name) {
    case 'pareto':
      return 'Pareto';

    case 'pie':
      return 'Pie';

    case 'line':
      return 'Line';

    case 'bar':
      return 'Bar';

    default:
      return 'N/A';
  }
}

export function getAnalyticDurationText(type: AnalyticDuration) {
  switch (type) {
    case 'hourly':
      return 'Hour';

    case 'daily':
      return 'Day';

    case 'monthly':
      return 'Month';
  }
}

export function getPsProcessStatusText(status: string) {
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

export function getFaqProcessStatusText(status: string) {
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

export function getDowntimeTypeText(type: string) {
  switch (type) {
    case DOWNTIME_TYPE_PLANNED:
      return 'Planned Downtime';

    case DOWNTIME_TYPE_MACHINE_SETUP:
      return 'M/C Setup';
  }
}

export function getDowntimeTimingText(type: string) {
  switch (type) {
    case DOWNTIME_TIMING_AUTO:
      return 'Auto';

    case DOWNTIME_TIMING_MANUAL:
      return 'Manual';

    case DOWNTIME_TIMING_TIMER:
      return 'Timer';
  }
}

export function getDeviceModelConnectionTypeText(type: string) {
  switch (type) {
    case DEVICE_MODEL_CONNECTION_TYPE_TCP:
      return 'TCP';

    case DEVICE_MODEL_CONNECTION_TYPE_SERIAL:
      return 'Serial';
  }
}

export function getDeviceModelTypeText(type: string) {
  switch (type) {
    case DEVICE_MODEL_TYPE_MODBUS:
      return 'Modbus';

    case DEVICE_MODEL_TYPE_OPCUA:
      return 'OPC UA';
  }
}

export function getDeviceModelReadFuncText(val: number) {
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

export function getDeviceModelWriteFuncText(val: number) {
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

export function getRoleSubjectText(val: string) {
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

    case RoleSubject.AdminSites:
      return 'Administrator - Sites';

    case RoleSubject.AdminUsers:
      return 'Administrator - Users';

    case RoleSubject.AdminRoles:
      return 'Administrator - Roles';
  }
}

export function getRoleActionText(val: string) {
  switch (val) {
    case RoleAction.Create:
      return 'Create';

    case RoleAction.Read:
      return 'Read';

    case RoleAction.Update:
      return 'Update';

    case RoleAction.Delete:
      return 'Delete';
  }
}

export function chartTitle(batch: OeeBatch | null, batchStatsTime: OeeBatchStats[], title: string = '') {
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

export function analyticChartTitle(title: string, fromDate: Date, toDate: Date) {
  return `${title} ${fShortDateTime(fromDate)} - ${fShortDateTime(toDate)}`;
}
