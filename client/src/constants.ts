import { OeeTag } from './@types/oee';
import { OeeStats } from './@types/oeeBatch';
import { PercentSetting } from './@types/percentSetting';
import { RoleAction, RoleSetting, RoleSubject } from './@types/role';
import { AlertTemplate } from './@types/alertTemplate';

export const ROWS_PER_PAGE_OPTIONS = [10, 15, 20];
export const ROWS_PER_PAGE_DEFAULT = 10;

export const TIME_UNIT_SECOND = 'second';
export const TIME_UNIT_MINUTE = 'minute';
export const TIME_UNIT_OPTIONS = [TIME_UNIT_SECOND, TIME_UNIT_MINUTE];

export const DOWNTIME_TYPE_PLANNED = 'planned';
export const DOWNTIME_TYPE_MACHINE_SETUP = 'mc_setup';
export const DOWNTIME_TYPES = [DOWNTIME_TYPE_PLANNED, DOWNTIME_TYPE_MACHINE_SETUP];

export const DOWNTIME_TIMING_AUTO = 'auto';
export const DOWNTIME_TIMING_MANUAL = 'manual';
export const DOWNTIME_TIMING_TIMER = 'timer';
export const DOWNTIME_TIMINGS = [DOWNTIME_TIMING_AUTO, DOWNTIME_TIMING_MANUAL, DOWNTIME_TIMING_TIMER];

export const OEE_TYPE_STANDALONE = 'standalone';
export const OEE_TYPE_CONTINUOUS = 'continuous';
export const OEE_TYPE_OPTIONS = [OEE_TYPE_STANDALONE, OEE_TYPE_CONTINUOUS];

export const OEE_TYPE_OEE = 'oee';
export const OEE_TYPE_A = 'a';
export const OEE_TYPE_P = 'p';
export const OEE_TYPE_Q = 'q';

export const OEE_TAG_MC_STATE = 'mc_state';
export const OEE_TAG_TOTAL = 'total';
export const OEE_TAG_TOTAL_NG = 'total_ng';
export const OEE_TAG_OUT_OEE = 'out_oee';
export const OEE_TAG_OUT_A = 'out_a';
export const OEE_TAG_OUT_P = 'out_p';
export const OEE_TAG_OUT_Q = 'out_q';
export const OEE_TAG_OUT_OPERATING_TIME = 'out_operating_time';
export const OEE_TAG_OUT_PLANNED_DOWNTIME = 'out_planned_downtime';
export const OEE_TAG_OUT_BREAKING_TIME = 'out_breaking_time';
export const OEE_TAG_OUT_TOTAL_NG = 'out_total_ng';
export const OEE_TAG_OUT_CYCLE_TIME = 'out_cycle_time';
export const OEE_TAG_OUT_PLANNED_QUANTITY = 'out_planned_quantity';
export const OEE_TAG_OUT_BATCH_STATUS = 'out_batch_status';
export const OEE_TAG_OUT_RESET = 'out_reset';

export const OEE_BATCH_STATUS_STANDBY = 'standby';
export const OEE_BATCH_STATUS_RUNNING = 'running';
export const OEE_BATCH_STATUS_BREAKDOWN = 'breakdown';
export const OEE_BATCH_STATUS_PLANNED = 'planned';
export const OEE_BATCH_STATUS_MC_SETUP = 'mc_setup';
export const OEE_BATCH_STATUS_ENDED = 'ended';

export const ALARM_TYPE_EMAIL = 'email';
export const ALARM_TYPE_LINE = 'line';

export const HISTORY_LOG_TYPE_ACTION = 'action';
export const HISTORY_LOG_TYPE_ALARM = 'alarm';

export const PS_PROCESS_STATUS_ON_PROCESS = 'on_process';
export const PS_PROCESS_STATUS_APPROVED = 'approved';
export const PS_PROCESS_STATUS_COMPLETED = 'completed';
export const PS_PROCESS_STATUS_WAITING = 'waiting';

export const FAQ_PROCESS_STATUS_ON_PROCESS = 'on_process';
export const FAQ_PROCESS_STATUS_APPROVED = 'approved';
export const FAQ_PROCESS_STATUS_COMPLETED = 'completed';
export const FAQ_PROCESS_STATUS_WAITING = 'waiting';

export const DEVICE_MODEL_CONNECTION_TYPE_TCP = 'tcp';
export const DEVICE_MODEL_CONNECTION_TYPE_SERIAL = 'serial';
export const DEVICE_MODEL_CONNECTION_TYPES = [DEVICE_MODEL_CONNECTION_TYPE_TCP, DEVICE_MODEL_CONNECTION_TYPE_SERIAL];

export const DEVICE_MODEL_TYPE_MODBUS = 'modbus';
export const DEVICE_MODEL_TYPE_OPCUA = 'opcua';
export const DEVICE_MODEL_TYPES = [DEVICE_MODEL_TYPE_MODBUS, DEVICE_MODEL_TYPE_OPCUA];

export const DEVICE_MODEL_DATA_TYPES = ['int16', 'int16s', 'int16u', 'int32', 'int32s', 'int32u', 'float'];

export const DEVICE_MODEL_READ_FUNCTIONS = [1, 2, 3, 4];
export const DEVICE_MODEL_WRITE_FUNCTIONS = [5, 6, 15, 16];

export const defaultMaps = {
  center: {
    lat: 13.7245995,
    lng: 100.6331108,
  },
  zoom: 11,
};

export const initialOeeTags: OeeTag[] = [
  {
    key: OEE_TAG_MC_STATE,
    data: {
      running: '',
      standby: '',
    },
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_TOTAL,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_TOTAL_NG,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_BATCH_STATUS,
    data: {
      standby: '',
      running: '',
      breakdown: '',
      plannedDowntimeManual: '',
      plannedDowntimeAuto: '',
      mcSetup: '',
    },
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_RESET,
    data: {
      reset: '',
    },
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_OEE,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_A,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_P,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_Q,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_OPERATING_TIME,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_PLANNED_DOWNTIME,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_BREAKING_TIME,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_TOTAL_NG,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_CYCLE_TIME,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
  {
    key: OEE_TAG_OUT_PLANNED_QUANTITY,
    data: null,
    deviceId: -1,
    tagId: -1,
  },
];

export const initialOeeStats: OeeStats = {
  aPercent: 0,
  pPercent: 0,
  qPercent: 0,
  oeePercent: 0,
  runningSeconds: 0,
  operatingSeconds: 0,
  plannedDowntimeSeconds: 0,
  machineSetupSeconds: 0,
  totalCount: 0,
  totalBreakdownCount: 0,
  totalBreakdownSeconds: 0,
  totalStopSeconds: 0,
  totalSpeedLossCount: 0,
  totalSpeedLossSeconds: 0,
  totalMinorStopCount: 0,
  totalMinorStopSeconds: 0,
  totalManualDefects: 0,
  totalAutoDefects: 0,
  totalOtherDefects: 0,
  target: 0,
  efficiency: 0,
  totalManualGrams: 0,
};

export const initialPercentSettings: PercentSetting[] = [
  {
    type: OEE_TYPE_OEE,
    settings: { high: 80, medium: 60, low: 50 },
  },
  {
    type: OEE_TYPE_A,
    settings: { high: 80, medium: 60, low: 50 },
  },
  {
    type: OEE_TYPE_P,
    settings: { high: 80, medium: 60, low: 50 },
  },
  {
    type: OEE_TYPE_Q,
    settings: { high: 80, medium: 60, low: 50 },
  },
];

export const initialAlertTemplate: AlertTemplate = {
  aParamWithoutParam:
    'Breakdown has occurred on {{oeeCode}} - {{productionName}} - {{sku}} at {{time}} - {{seconds}} seconds.',
  aParamWithParam:
    '{{paramName}} has occurred on {{oeeCode}} - {{productionName}} - {{sku}} at {{time}} - {{seconds}} seconds.',
  pParamWithoutParam:
    'Minor Loss has occurred on {{oeeCode}} - {{productionName}} - {{sku}} at {{time}} - {{seconds}} seconds.',
  pParamWithParam:
    '{{paramName}} has occurred on {{oeeCode}} - {{productionName}} - {{sku}} at {{time}} - {{seconds}} seconds.',
  qParamWithParam:
    '{{paramName}} has increased from {{previousAmount}} to {{currentAmount}} on {{oeeCode}} - {{productionName}} - {{sku}}.',
  oeeLow:
    'OEE low on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  aLow: 'A low on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  pLow: 'P low on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  qLow: 'Q low on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  oeeHigh:
    'OEE high on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  aHigh:
    'A high on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  pHigh:
    'P high on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
  qHigh:
    'Q high on {{oeeCode}} - {{productionName}} - {{sku}} - previous: {{previousPercent}}, current: {{currentPercent}}',
};

export const initialRoles: RoleSetting[] = [
  {
    subject: RoleSubject.Dashboard,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.Analytics,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ProblemsAndSolutions,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete, RoleAction.Approve],
  },
  {
    subject: RoleSubject.Faqs,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete, RoleAction.Approve],
  },
  {
    subject: RoleSubject.Plannings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.OeeSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.MachineSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ProductSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.DeviceSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ModelSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.PlannedDowntimeSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.DashboardSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.AlarmSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.SiteSettings,
    actions: [RoleAction.Read, RoleAction.Update],
  },
  {
    subject: RoleSubject.UserSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.RoleSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
];

export const PLANNING_START_TYPE = [
  {
    name: 'Auto Start Batch',
    key: 'AUTO'
  },
  {
    name: 'Manual Start Batch',
    key: 'MANUAL'
  },
  {
    name: 'External Start Batch',
    key: 'EXTERNAL'
  }
];

export const PLANNING_END_TYPE = [
  {
    name: 'Auto End Batch (Planning Immediately)',
    key: 'AUTO_PLANNING'
  },
  {
    name: 'Auto End Batch (FG)',
    key: 'AUTO_FG'
  },
  {
    name: 'Auto End Batch (Actual FG)',
    key: 'AUTO_ACTUAL_FG'
  },
  {
    name: 'Manual End Batch',
    key: 'MANUAL'
  },
  {
    name: 'External End Batch',
    key: 'EXTERNAL'
  }
]

export const ADVANCED_TYPE = [
  {
    name : "OEE",
    key  : "oee"
  },
  {
    name : "TEEP",
    key  : "teep"
  },
  {
    name : "ANDON",
    key  : "andon"
  }
]
